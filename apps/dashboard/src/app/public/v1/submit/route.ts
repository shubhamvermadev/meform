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

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.applicationId !== applicationId) {
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
      },
    });

    logger.info("Submission created", { submissionId: submission.id });

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
