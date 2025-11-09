import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  UpdateFormFieldRequestSchema,
  FormFieldResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * PATCH /api/v1/applications/:appId/forms/:formId/fields/:fieldId
 * Update form field
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string; formId: string; fieldId: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, formId, fieldId } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.applicationId !== appId) {
      return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Form not found", 404);
    }

    const body = await request.json();
    const validated = UpdateFormFieldRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const field = await prisma.formField.update({
      where: { id: fieldId },
      data: validated.data,
    });

    logger.info("Form field updated", { fieldId });

    const response = FormFieldResponseSchema.parse(field);
    return successResponse(response);
  } catch (error) {
    logger.error("Update form field error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * DELETE /api/v1/applications/:appId/forms/:formId/fields/:fieldId
 * Delete form field
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string; formId: string; fieldId: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, formId, fieldId } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.applicationId !== appId) {
      return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Form not found", 404);
    }

    await prisma.formField.update({
      where: { id: fieldId },
      data: { deletedAt: new Date() },
    });

    logger.info("Form field deleted", { fieldId });

    return successResponse({ success: true });
  } catch (error) {
    logger.error("Delete form field error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

