import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  UpdateFormRequestSchema,
  FormResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId/forms/:formId
 * Get form by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string; formId: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, formId } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.applicationId !== appId) {
      return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Form not found", 404);
    }

    const response = FormResponseSchema.parse(form);
    return successResponse(response);
  } catch (error) {
    logger.error("Get form error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * PATCH /api/v1/applications/:appId/forms/:formId
 * Update form
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string; formId: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, formId } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    const body = await request.json();
    const validated = UpdateFormRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const form = await prisma.form.update({
      where: { id: formId },
      data: validated.data,
    });

    logger.info("Form updated", { formId });

    const response = FormResponseSchema.parse(form);
    return successResponse(response);
  } catch (error) {
    logger.error("Update form error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * DELETE /api/v1/applications/:appId/forms/:formId
 * Delete form
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string; formId: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, formId } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    await prisma.form.update({
      where: { id: formId },
      data: { deletedAt: new Date() },
    });

    logger.info("Form deleted", { formId });

    return successResponse({ success: true });
  } catch (error) {
    logger.error("Delete form error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

