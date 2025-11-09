import { createHmac } from "crypto";

/**
 * Creates an HMAC SHA256 signature for a payload
 * @param secret - Secret key for HMAC
 * @param payload - Payload to sign (will be JSON stringified if not a string)
 * @returns HMAC signature in format: sha256={hex}
 */
export function createHmacSignature(secret: string, payload: string | object): string {
  const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
  const hmac = createHmac("sha256", secret);
  hmac.update(payloadString);
  const signature = hmac.digest("hex");
  return `sha256=${signature}`;
}

/**
 * Verifies an HMAC signature
 * @param secret - Secret key for HMAC
 * @param payload - Payload to verify
 * @param signature - Signature to verify (format: sha256={hex})
 * @returns True if signature is valid
 */
export function verifyHmacSignature(
  secret: string,
  payload: string | object,
  signature: string
): boolean {
  const expected = createHmacSignature(secret, payload);
  return expected === signature;
}

