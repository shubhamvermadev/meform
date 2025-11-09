import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  CreateUrlRuleRequestSchema,
  ListUrlRulesResponseSchema,
  UrlRuleResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId/url-rules
 * List URL rules for application
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

    const urlRules = await prisma.urlRule.findMany({
      where: {
        applicationId: appId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    const response = ListUrlRulesResponseSchema.parse(urlRules);
    return successResponse(response);
  } catch (error) {
    logger.error("List URL rules error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * POST /api/v1/applications/:appId/url-rules
 * Create URL rule
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
    const validated = CreateUrlRuleRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const urlRule = await prisma.urlRule.create({
      data: {
        applicationId: appId,
        ...validated.data,
      },
    });

    logger.info("URL rule created", { urlRuleId: urlRule.id });

    const response = UrlRuleResponseSchema.parse(urlRule);
    return successResponse(response, 201);
  } catch (error) {
    logger.error("Create URL rule error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

