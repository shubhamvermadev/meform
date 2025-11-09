import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimitAuth, getClientIdentifier } from "@/lib/rate-limit";
import { setRequestId, logger } from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  rateLimitResponse,
} from "@/lib/api-response";
import {
  RegisterRequestSchema,
  RegisterResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimitAuth(identifier);
    if (!rateLimit.allowed) {
      return rateLimitResponse("Too many registration attempts", rateLimit.resetAt);
    }

    const body = await request.json();
    const validated = RegisterRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { email, password } = validated.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return errorResponse(ERROR_CODES.AUTH_EMAIL_EXISTS, "Email already registered");
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const verificationToken = nanoid(32);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    // Send verification email (in a real app, store token in DB)
    await sendVerificationEmail(email, verificationToken);

    logger.info("User registered", { userId: user.id, email });

    const response = RegisterResponseSchema.parse(user);
    return successResponse(response, 201);
  } catch (error) {
    logger.error("Registration error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

