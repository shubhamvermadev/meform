import { describe, it, expect } from "vitest";
import { matchesPathPattern } from "./path-matcher";

describe("matchesPathPattern", () => {
  it("should match exact paths", () => {
    expect(matchesPathPattern("/pricing", "/pricing")).toBe(true);
    expect(matchesPathPattern("/pricing", "/blog")).toBe(false);
  });

  it("should match wildcard patterns", () => {
    expect(matchesPathPattern("/blog/*", "/blog")).toBe(true);
    expect(matchesPathPattern("/blog/*", "/blog/")).toBe(true);
    expect(matchesPathPattern("/blog/*", "/blog/post-1")).toBe(true);
    expect(matchesPathPattern("/blog/*", "/blog/category/post")).toBe(true);
    expect(matchesPathPattern("/blog/*", "/pricing")).toBe(false);
  });

  it("should match regex patterns", () => {
    expect(matchesPathPattern("^/docs/.*$", "/docs/getting-started")).toBe(true);
    expect(matchesPathPattern("^/docs/.*$", "/docs")).toBe(false);
    expect(matchesPathPattern("^/api/v\\d+/.*$", "/api/v1/users")).toBe(true);
  });

  it("should handle invalid regex gracefully", () => {
    expect(matchesPathPattern("^[invalid", "/test")).toBe(false);
  });
});

