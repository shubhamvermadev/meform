import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  UpdateApplicationRequestSchema,
  ApplicationResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId
 * Get application by ID
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
    });

    if (!application) {
      return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Application not found", 404);
    }

    const response = ApplicationResponseSchema.parse(application);
    return successResponse(response);
  } catch (error) {
    logger.error("Get application error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * PATCH /api/v1/applications/:appId
 * Update application
 */
export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const validated = UpdateApplicationRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const application = await prisma.application.update({
      where: { id: appId },
      data: validated.data,
    });

    logger.info("Application updated", { applicationId: appId });

    const response = ApplicationResponseSchema.parse(application);
    return successResponse(response);
  } catch (error) {
    logger.error("Update application error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * DELETE /api/v1/applications/:appId
 * Soft delete application
 */
export async function DELETE(
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

    await prisma.application.update({
      where: { id: appId },
      data: { deletedAt: new Date() },
    });

    logger.info("Application deleted", { applicationId: appId });

    return successResponse({ success: true });
  } catch (error) {
    logger.error("Delete application error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

