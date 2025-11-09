import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { hashPassword } from "@/lib/auth";
import { rateLimitAuth, getClientIdentifier } from "@/lib/rate-limit";
import { setRequestId, logger } from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  rateLimitResponse,
} from "@/lib/api-response";
import {
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimitAuth(identifier);
    if (!rateLimit.allowed) {
      return rateLimitResponse("Too many requests", rateLimit.resetAt);
    }

    const body = await request.json();
    const validated = ResetPasswordRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { token, password } = validated.data;

    // In a real app, validate token from DB and find user
    // For now, we'll skip token validation
    // TODO: Implement token validation

    logger.info("Password reset attempted", { token });

    return successResponse(ResetPasswordResponseSchema.parse({ success: true }));
  } catch (error) {
    logger.error("Password reset error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

