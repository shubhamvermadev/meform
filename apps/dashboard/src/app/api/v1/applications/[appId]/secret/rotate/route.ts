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
 * POST /api/v1/applications/:appId/secret/rotate
 * Rotate application integration secret
 */
export async function POST(
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

    // Generate new secret using cuid
    const newSecret = nanoid();

    const application = await prisma.application.update({
      where: { id: appId },
      data: { integrationSecret: newSecret },
      select: { integrationSecret: true },
    });

    logger.info("Application secret rotated", { applicationId: appId });

    const response = ApplicationSecretResponseSchema.parse({
      integrationSecret: application.integrationSecret,
    });
    return successResponse(response);
  } catch (error) {
    logger.error("Rotate application secret error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}
