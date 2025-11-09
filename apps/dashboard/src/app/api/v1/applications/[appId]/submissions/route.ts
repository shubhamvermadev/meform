import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth, requireApplicationOwnership } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  ListSubmissionsQuerySchema,
  ListSubmissionsResponseSchema,
  ERROR_CODES,
  PAGINATION,
} from "@meform/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications/:appId/submissions
 * List submissions with pagination and filters
 */
export async function GET(
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

    const searchParams = request.nextUrl.searchParams;
    const query = {
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      formId: searchParams.get("formId") || undefined,
      hostname: searchParams.get("hostname") || undefined,
      path: searchParams.get("path") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const validated = ListSubmissionsQuerySchema.safeParse(query);
    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    const { page = 1, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, ...filters } =
      validated.data;

    const where: Record<string, unknown> = {
      applicationId: appId,
    };

    if (filters.formId) {
      where.formId = filters.formId;
    }
    if (filters.hostname) {
      where.hostname = filters.hostname;
    }
    if (filters.path) {
      where.path = { contains: filters.path };
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.submission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const response = ListSubmissionsResponseSchema.parse({
      data: submissions,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });

    return successResponse(response);
  } catch (error) {
    logger.error("List submissions error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

