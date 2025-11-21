import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { rateLimitPublicSubmit, getClientIdentifier } from "@/lib/rate-limit";
import { setRequestId, logger } from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  rateLimitResponse,
  addCorsHeaders,
  corsPreflightResponse,
} from "@/lib/api-response";
import { PublicSubmitRequestSchema, PublicSubmitResponseSchema, ERROR_CODES } from "@meform/dto";
import { createHmacSignature } from "@meform/utils";
import { nanoid } from "nanoid";

/**
 * OPTIONS /public/v1/submit
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return corsPreflightResponse();
}

/**
 * POST /public/v1/submit
 * Submit form data
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimitPublicSubmit(identifier);
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse("Too many submissions", rateLimit.resetAt));
    }

    const body = await request.json();
    const validated = PublicSubmitRequestSchema.safeParse(body);

    if (!validated.success) {
      return addCorsHeaders(
        errorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          validated.error.errors[0]?.message || "Validation failed"
        )
      );
    }

    const { applicationId, formId, hostname, path, payload } = validated.data;

    // Verify application and form exist
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return addCorsHeaders(
        errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Application not found", 404)
      );
    }

    // Check if application is disabled or deleted
    if (application.status === "DISABLED" || application.deletedAt) {
      return addCorsHeaders(
        errorResponse(ERROR_CODES.RESOURCE_ACCESS_DENIED, "Application is disabled", 403)
      );
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        googleSheets: true,
      },
    });

    if (!form || form.applicationId !== applicationId || form.deletedAt) {
      return addCorsHeaders(errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Form not found", 404));
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        formId,
        applicationId,
        hostname,
        path,
        payload,
        integrationStatus: "PENDING",
        integrationAttemptCount: 0,
      },
    });

    logger.info("Submission created", { submissionId: submission.id });

    // Handle Google Sheets integration asynchronously
    if (form.googleSheets?.enabled && form.googleSheets.webAppUrl) {
      // Don't await - process in background
      processGoogleSheetsIntegration(submission.id, form, application, hostname, path, payload).catch(
        (error) => {
          logger.error("Google Sheets integration error", { submissionId: submission.id, error });
        }
      );
    }

    const response = PublicSubmitResponseSchema.parse({
      id: submission.id,
      success: true,
    });

    return addCorsHeaders(successResponse(response, 201));
  } catch (error) {
    logger.error("Submit error", error);
    return addCorsHeaders(errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500));
  }
}

/**
 * Processes Google Sheets integration with retries
 */
async function processGoogleSheetsIntegration(
  submissionId: string,
  form: { id: string; googleSheets: { sheetName: string; webAppUrl: string } | null },
  application: { id: string; integrationSecret: string | null },
  hostname: string,
  path: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!form.googleSheets?.webAppUrl) {
    return;
  }

  // Check if integration secret exists
  if (!application.integrationSecret || application.integrationSecret.trim() === "") {
    const error = "Integration secret is not configured";
    logger.error("Google Sheets integration failed: missing secret", {
      submissionId,
      applicationId: application.id,
    });
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        integrationStatus: "FAILED",
        integrationAttemptCount: 0,
        integrationLastError: error,
      },
    });
    return;
  }

  const integrationData = {
    sheetName: form.googleSheets.sheetName,
    applicationId: application.id,
    formId: form.id,
    hostname,
    path,
    createdAt: new Date().toISOString(),
    payload,
  };

  const bodyString = JSON.stringify(integrationData);
  let signature: string;
  try {
    signature = createHmacSignature(application.integrationSecret, bodyString);
  } catch (error) {
    const errorMsg = `Failed to create signature: ${error instanceof Error ? error.message : String(error)}`;
    logger.error("Google Sheets integration failed: signature creation error", {
      submissionId,
      applicationId: application.id,
      error: errorMsg,
    });
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        integrationStatus: "FAILED",
        integrationAttemptCount: 0,
        integrationLastError: errorMsg,
      },
    });
    return;
  }

  // Include signature in the body (Google Apps Script doesn't expose headers reliably)
  const integrationDataWithSignature = {
    ...integrationData,
    signature,
  };
  const bodyStringWithSignature = JSON.stringify(integrationDataWithSignature);

  const maxAttempts = 3;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(form.googleSheets.webAppUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyStringWithSignature,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update submission with success
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              integrationStatus: "SUCCESS",
              integrationAttemptCount: attempt,
              integrationLastError: null,
            },
          });

          // Update Google Sheets integration last attempt
          await prisma.googleSheetsIntegration.updateMany({
            where: { formId: form.id },
            data: {
              lastAttemptAt: new Date(),
              lastError: null,
            },
          });

          logger.info("Google Sheets integration successful", { submissionId, attempt });
          return;
        } else {
          throw new Error(result.error || "Integration returned success: false");
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      logger.warn("Google Sheets integration attempt failed", {
        submissionId,
        attempt,
        error: lastError,
      });

      // Update submission with attempt count
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          integrationAttemptCount: attempt,
          integrationLastError: lastError,
        },
      });

      // Update Google Sheets integration last attempt
      await prisma.googleSheetsIntegration.updateMany({
        where: { formId: form.id },
        data: {
          lastAttemptAt: new Date(),
          lastError: lastError,
        },
      });

      // Exponential backoff: 500ms, 1500ms
      if (attempt < maxAttempts) {
        const delay = attempt === 1 ? 500 : 1500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      integrationStatus: "FAILED",
      integrationAttemptCount: maxAttempts,
      integrationLastError: lastError,
    },
  });

  logger.error("Google Sheets integration failed after all retries", {
    submissionId,
    error: lastError,
  });
}
