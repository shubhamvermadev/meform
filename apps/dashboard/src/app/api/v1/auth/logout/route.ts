import { destroySession } from "@/lib/auth";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse } from "@/lib/api-response";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
export async function POST() {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    await destroySession();
    logger.info("User logged out");
    return successResponse({ success: true });
  } catch (error) {
    logger.error("Logout error", error);
    return successResponse({ success: true }); // Always succeed on logout
  }
}

