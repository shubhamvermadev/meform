import { NextResponse } from "next/server";
import { ERROR_CODES } from "@meform/config";
import { createErrorResponse, ErrorResponse } from "@meform/dto";

/**
 * API response helpers
 */

export function successResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse<ErrorResponse> {
  return NextResponse.json(createErrorResponse(code, message), { status });
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse<ErrorResponse> {
  return errorResponse(ERROR_CODES.AUTH_SESSION_INVALID, message, 401);
}

export function forbiddenResponse(message = "Access denied"): NextResponse<ErrorResponse> {
  return errorResponse(ERROR_CODES.RESOURCE_ACCESS_DENIED, message, 403);
}

export function notFoundResponse(message = "Resource not found"): NextResponse<ErrorResponse> {
  return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, message, 404);
}

export function rateLimitResponse(
  message = "Too many requests",
  resetAt: number
): NextResponse<ErrorResponse> {
  const response = NextResponse.json(
    createErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, message),
    { status: 429 }
  );
  response.headers.set("X-RateLimit-Reset", resetAt.toString());
  return response;
}

/**
 * Adds CORS headers to a response for public API endpoints
 */
export function addCorsHeaders<T>(response: NextResponse<T>): NextResponse<T> {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Hostname, X-Path");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

/**
 * Creates a CORS preflight response
 */
export function corsPreflightResponse(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}

