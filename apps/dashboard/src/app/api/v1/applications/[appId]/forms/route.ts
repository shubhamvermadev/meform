import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  CreateFormRequestSchema,
  ListFormsResponseSchema,
  FormResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { buildSectionId } from "@meform/utils";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId/forms
 * List forms for application
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

    const forms = await prisma.form.findMany({
      where: {
        applicationId: appId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { fields: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = ListFormsResponseSchema.parse(
      forms.map((form) => ({
        id: form.id,
        applicationId: form.applicationId,
        name: form.name,
        urlRuleId: form.urlRuleId,
        version: form.version,
        renderAsSection: form.renderAsSection,
        sectionIdOverride: form.sectionIdOverride,
        sharePublicly: form.sharePublicly,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        deletedAt: form.deletedAt,
      }))
    );
    return successResponse(response);
  } catch (error) {
    logger.error("List forms error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * POST /api/v1/applications/:appId/forms
 * Create form
 */
export async function POST(
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
    const validated = CreateFormRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { googleSheets, ...formData } = validated.data;

    const form = await prisma.form.create({
      data: {
        applicationId: appId,
        ...formData,
        googleSheets: googleSheets?.enabled
          ? {
              create: {
                enabled: googleSheets.enabled,
                sheetName: googleSheets.sheetName || "",
                appScriptDeploymentId: googleSheets.appScriptDeploymentId || null,
                webAppUrl: googleSheets.webAppUrl || null,
              },
            }
          : undefined,
      },
    });

    logger.info("Form created", { formId: form.id });

    const computedSectionId = form.sectionIdOverride || buildSectionId(appId, form.name);

    const response = FormResponseSchema.parse({
      id: form.id,
      applicationId: form.applicationId,
      name: form.name,
      urlRuleId: form.urlRuleId,
      version: form.version,
      renderAsSection: form.renderAsSection,
      sectionIdOverride: form.sectionIdOverride,
      computedSectionId,
      sharePublicly: form.sharePublicly,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      deletedAt: form.deletedAt,
    });
    return successResponse(response, 201);
  } catch (error) {
    logger.error("Create form error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

