import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  CreateFormFieldRequestSchema,
  ListFormFieldsResponseSchema,
  FormFieldResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId/forms/:formId/fields
 * List form fields
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

    const fields = await prisma.formField.findMany({
      where: {
        formId,
        deletedAt: null,
      },
      orderBy: { position: "asc" },
    });

    const response = ListFormFieldsResponseSchema.parse(fields);
    return successResponse(response);
  } catch (error) {
    logger.error("List form fields error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * POST /api/v1/applications/:appId/forms/:formId/fields
 * Create form field
 */
export async function POST(
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

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.applicationId !== appId) {
      return errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, "Form not found", 404);
    }

    const body = await request.json();
    const validated = CreateFormFieldRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const field = await prisma.formField.create({
      data: {
        formId,
        ...validated.data,
      },
    });

    logger.info("Form field created", { fieldId: field.id });

    const response = FormFieldResponseSchema.parse(field);
    return successResponse(response, 201);
  } catch (error) {
    logger.error("Create form field error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

