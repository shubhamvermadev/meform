/**
 * Path matching utility
 * Supports:
 * - Exact match: "/pricing"
 * - Wildcard suffix: "/blog/*"
 * - Regex: patterns starting with "^" are treated as regex
 */

/**
 * Checks if a path matches a pattern
 * @param pathPattern - Pattern to match against (exact, wildcard, or regex)
 * @param path - Path to check
 * @returns true if path matches pattern
 */
export function matchesPathPattern(pathPattern: string, path: string): boolean {
  // Regex pattern (starts with ^)
  if (pathPattern.startsWith("^")) {
    try {
      const regex = new RegExp(pathPattern);
      return regex.test(path);
    } catch {
      // Invalid regex, treat as literal
      return pathPattern === path;
    }
  }

  // Wildcard suffix pattern (ends with /*)
  if (pathPattern.endsWith("/*")) {
    const prefix = pathPattern.slice(0, -2);
    return path === prefix || path.startsWith(prefix + "/");
  }

  // Exact match
  return pathPattern === path;
}

