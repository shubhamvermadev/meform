import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  UpdateApplicationStatusRequestSchema,
  ApplicationResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * PATCH /api/v1/applications/:appId/status
 * Update application status
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
    const validated = UpdateApplicationStatusRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const application = await prisma.application.update({
      where: { id: appId },
      data: { status: validated.data.status },
    });

    logger.info("Application status updated", { applicationId: appId, status: validated.data.status });

    const response = ApplicationResponseSchema.parse({
      id: application.id,
      name: application.name,
      hostname: application.hostname,
      description: application.description,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    });
    return successResponse(response);
  } catch (error) {
    logger.error("Update application status error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

