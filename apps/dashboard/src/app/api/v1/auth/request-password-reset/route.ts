import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimitAuth, getClientIdentifier } from "@/lib/rate-limit";
import { setRequestId, logger } from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  rateLimitResponse,
} from "@/lib/api-response";
import {
  RequestPasswordResetRequestSchema,
  RequestPasswordResetResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/auth/request-password-reset
 * Request password reset
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
    const validated = RequestPasswordResetRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { email } = validated.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success (don't reveal if email exists)
    if (user) {
      const resetToken = nanoid(32);
      // In a real app, store token in DB with expiry
      await sendPasswordResetEmail(email, resetToken);
      logger.info("Password reset requested", { email });
    }

    return successResponse(RequestPasswordResetResponseSchema.parse({ success: true }));
  } catch (error) {
    logger.error("Password reset request error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

