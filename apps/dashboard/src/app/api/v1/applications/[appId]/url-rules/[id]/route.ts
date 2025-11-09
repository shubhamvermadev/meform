import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  UpdateUrlRuleRequestSchema,
  UrlRuleResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * PATCH /api/v1/applications/:appId/url-rules/:id
 * Update URL rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string; id: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, id } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    const body = await request.json();
    const validated = UpdateUrlRuleRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const urlRule = await prisma.urlRule.update({
      where: { id },
      data: validated.data,
    });

    logger.info("URL rule updated", { urlRuleId: id });

    const response = UrlRuleResponseSchema.parse(urlRule);
    return successResponse(response);
  } catch (error) {
    logger.error("Update URL rule error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * DELETE /api/v1/applications/:appId/url-rules/:id
 * Delete URL rule
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string; id: string }> }
) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { appId, id } = await params;
    const ownership = await requireApplicationOwnership(appId, auth.user.id);
    if (ownership.error) return ownership.error;

    await prisma.urlRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info("URL rule deleted", { urlRuleId: id });

    return successResponse({ success: true });
  } catch (error) {
    logger.error("Delete URL rule error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

