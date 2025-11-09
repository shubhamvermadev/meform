/**
 * Hostname normalization utilities
 */

/**
 * Normalizes hostname by stripping www subdomain
 * @param hostname - Hostname to normalize
 * @returns Normalized hostname
 */
export function normalizeHostname(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

