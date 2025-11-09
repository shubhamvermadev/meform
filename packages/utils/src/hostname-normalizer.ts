/**
 * Normalizes hostname by removing protocol, www prefix, trailing slashes, and converting to lowercase
 * @param hostname - Hostname string (can include protocol, www, etc.)
 * @returns Normalized hostname (e.g. "example.com")
 */
export function normalizeHostname(hostname: string): string {
  if (!hostname) {
    return "";
  }

  // Remove protocol (http://, https://)
  let normalized = hostname.replace(/^https?:\/\//i, "");

  // Remove trailing slashes and paths
  normalized = normalized.split("/")[0] || "";

  // Remove www. prefix
  normalized = normalized.replace(/^www\./i, "");

  // Convert to lowercase
  normalized = normalized.toLowerCase().trim();

  return normalized;
}



