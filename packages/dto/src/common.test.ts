import { describe, it, expect } from "vitest";
import { PaginationQuerySchema, createErrorResponse } from "./common";

describe("PaginationQuerySchema", () => {
  it("should validate valid pagination query", () => {
    const result = PaginationQuerySchema.safeParse({ page: 1, pageSize: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("should default page and pageSize", () => {
    const result = PaginationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid page", () => {
    const result = PaginationQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

describe("createErrorResponse", () => {
  it("should create error response", () => {
    const response = createErrorResponse("ERROR_CODE", "Error message");
    expect(response).toEqual({
      code: "ERROR_CODE",
      message: "Error message",
    });
  });
});

