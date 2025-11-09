import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { rateLimitPublicConfig, getClientIdentifier } from "@/lib/rate-limit";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse, rateLimitResponse, addCorsHeaders, corsPreflightResponse } from "@/lib/api-response";
import {
  PublicConfigQuerySchema,
  PublicConfigResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { matchesPathPattern, normalizeHostname } from "@meform/utils";
import { nanoid } from "nanoid";

/**
 * OPTIONS /public/v1/config
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return corsPreflightResponse();
}

/**
 * GET /public/v1/config
 * Get forms matching hostname and path for an application
 */
export async function GET(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimitPublicConfig(identifier);
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse("Too many requests", rateLimit.resetAt));
    }

    const searchParams = request.nextUrl.searchParams;
    const query = {
      applicationId: searchParams.get("applicationId"),
    };

    const validated = PublicConfigQuerySchema.safeParse(query);
    if (!validated.success) {
      return addCorsHeaders(
        errorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          validated.error.errors[0]?.message || "Validation failed"
        )
      );
    }

    const { applicationId } = validated.data;
    // Get hostname and path from headers or URL
    const hostname = request.headers.get("x-hostname") || new URL(request.url).searchParams.get("hostname") || "";
    const path = request.headers.get("x-path") || new URL(request.url).searchParams.get("path") || "/";

    // Normalize hostname
    const normalizedHostname = normalizeHostname(hostname);

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        urlRules: {
          where: { deletedAt: null },
        },
        forms: {
          where: { deletedAt: null },
          include: {
            fields: {
              where: { deletedAt: null },
              orderBy: { position: "asc" },
            },
            urlRule: true,
          },
        },
      },
    });

    if (!application) {
      return addCorsHeaders(errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Application not found", 404));
    }


    // Find matching forms based on URL rules
    const matchingForms = application.forms.filter((form) => {
      // If form has a specific URL rule, check it
      if (form.urlRuleId && form.urlRule) {
        const rule = form.urlRule;
        if (
          normalizeHostname(application.hostname) === normalizedHostname &&
          matchesPathPattern(rule.pathPattern, path)
        ) {
          return true;
        }
      }

      // Check if any URL rule matches
      const matchingRule = application.urlRules.find(
        (rule) =>
          normalizeHostname(rule.hostname) === normalizedHostname &&
          matchesPathPattern(rule.pathPattern, path)
      );

      // If form has no URL rule or matches general rule
      if (!form.urlRuleId && matchingRule) {
        return true;
      }

      return false;
    });

    const response = PublicConfigResponseSchema.parse({
      forms: matchingForms.map((form) => ({
        id: form.id,
        name: form.name,
        fields: form.fields.map((field) => ({
          id: field.id,
          name: field.name,
          key: field.key,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          options: field.options,
        })),
      })),
    });

    return addCorsHeaders(successResponse(response));
  } catch (error) {
    logger.error("Public config error", error);
    return addCorsHeaders(errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500));
  }
}

