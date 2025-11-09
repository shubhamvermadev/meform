import { getCurrentUser } from "./auth";
import { unauthorizedResponse, forbiddenResponse } from "./api-response";
import { prisma } from "@meform/db";

/**
 * Middleware to require authentication
 */
export async function requireAuth() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("Auth failed: No user found");
      return { error: unauthorizedResponse() };
    }
    return { user };
  } catch (error) {
    console.error("Auth error:", error);
    return { error: unauthorizedResponse() };
  }
}

/**
 * Middleware to verify application ownership
 */
export async function requireApplicationOwnership(
  applicationId: string,
  userId: string
): Promise<{ error?: Response; application?: unknown }> {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ownerId: userId,
      deletedAt: null,
    },
  });

  if (!application) {
    return { error: forbiddenResponse("Application not found or access denied") };
  }

  return { application };
}

