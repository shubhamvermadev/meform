import { RATE_LIMITS } from "@meform/config";

/**
 * Simple in-memory rate limiter
 * In production, use Redis or a proper rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

/**
 * Checks if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  windowMs: number,
  max: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const record = store[key];

  if (!record || now > record.resetAt) {
    // Create new window
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: max - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: max - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Gets client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Rate limit middleware for auth endpoints
 */
export function rateLimitAuth(identifier: string): ReturnType<typeof checkRateLimit> {
  return checkRateLimit(
    `auth:${identifier}`,
    RATE_LIMITS.AUTH.windowMs,
    RATE_LIMITS.AUTH.max
  );
}

/**
 * Rate limit middleware for public submit
 */
export function rateLimitPublicSubmit(
  identifier: string
): ReturnType<typeof checkRateLimit> {
  return checkRateLimit(
    `public-submit:${identifier}`,
    RATE_LIMITS.PUBLIC_SUBMIT.windowMs,
    RATE_LIMITS.PUBLIC_SUBMIT.max
  );
}

/**
 * Rate limit middleware for public config
 */
export function rateLimitPublicConfig(
  identifier: string
): ReturnType<typeof checkRateLimit> {
  return checkRateLimit(
    `public-config:${identifier}`,
    RATE_LIMITS.PUBLIC_CONFIG.windowMs,
    RATE_LIMITS.PUBLIC_CONFIG.max
  );
}

