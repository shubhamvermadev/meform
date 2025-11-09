import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  ApplicationSecretResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId/secret
 * Get application integration secret
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    const application = await prisma.application.findUnique({
      where: { id: appId },
      select: { integrationSecret: true },
    });

    if (!application) {
      return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Application not found", 404);
    }

    const response = ApplicationSecretResponseSchema.parse({
      integrationSecret: application.integrationSecret,
    });
    return successResponse(response);
  } catch (error) {
    logger.error("Get application secret error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}
