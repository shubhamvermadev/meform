import { nanoid } from "nanoid";

/**
 * Logger with request ID support
 */

let requestId: string | null = null;

export function setRequestId(id?: string): void {
  requestId = id || nanoid();
}

export function getRequestId(): string | null {
  return requestId;
}

export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(`[INFO] [${requestId || "no-request"}] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] [${requestId || "no-request"}] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[ERROR] [${requestId || "no-request"}] ${message}`, ...args);
  },
};

