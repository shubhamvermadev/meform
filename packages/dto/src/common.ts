import { z } from "zod";
import { ERROR_CODES, PAGINATION } from "@meform/config";

// Re-export ERROR_CODES for convenience
export { ERROR_CODES };
export type { ErrorCode } from "@meform/config";

/**
 * Common response schemas
 */

export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Creates an error response object
 */
export function createErrorResponse(code: string, message: string): ErrorResponse {
  return { code, message };
}

/**
 * Pagination query parameters
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * Paginated response metadata
 */
export const PaginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export { PAGINATION };

