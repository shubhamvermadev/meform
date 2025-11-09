import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  VerifyEmailRequestSchema,
  VerifyEmailResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/auth/verify-email
 * Verify email with token
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const body = await request.json();
    const validated = VerifyEmailRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { token } = validated.data;

    // In a real app, validate token from DB
    // For now, we'll skip token validation
    // TODO: Implement token validation

    logger.info("Email verification attempted", { token });

    return successResponse(VerifyEmailResponseSchema.parse({ success: true }));
  } catch (error) {
    logger.error("Email verification error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

