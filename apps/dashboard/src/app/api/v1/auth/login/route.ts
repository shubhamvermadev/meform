import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { rateLimitAuth, getClientIdentifier } from "@/lib/rate-limit";
import { setRequestId, logger } from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  rateLimitResponse,
} from "@/lib/api-response";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/auth/login
 * Login user
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimitAuth(identifier);
    if (!rateLimit.allowed) {
      return rateLimitResponse("Too many login attempts", rateLimit.resetAt);
    }

    const body = await request.json();
    const validated = LoginRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { email, password } = validated.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(ERROR_CODES.AUTH_INVALID_CREDENTIALS, "Invalid credentials");
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse(ERROR_CODES.AUTH_INVALID_CREDENTIALS, "Invalid credentials");
    }

    // Create session
    const sessionId = await createSession(user.id, user.email);

    logger.info("User logged in", { userId: user.id, email, sessionId });

    const response = LoginResponseSchema.parse({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });
    
    const httpResponse = successResponse(response);
    // Ensure cookie is set in response headers
    logger.info("Session created", { sessionId, cookieName: "meform.session" });
    
    return httpResponse;
  } catch (error) {
    logger.error("Login error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

