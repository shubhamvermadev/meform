import { NextRequest } from "next/server";
import { prisma } from "@meform/db";
import { requireAuth } from "@/lib/middleware";
import { setRequestId, logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  CreateApplicationRequestSchema,
  ListApplicationsResponseSchema,
  ApplicationResponseSchema,
  ERROR_CODES,
} from "@meform/dto";
import { normalizeHostname } from "@meform/utils";
import { nanoid } from "nanoid";

/**
 * GET /api/v1/applications
 * List user's applications
 */
export async function GET() {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const applications = await prisma.application.findMany({
      where: {
        ownerId: auth.user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match response schema
    const items = applications.map((app) => ({
      id: app.id,
      name: app.name,
      hostname: app.hostname,
      description: app.description,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    const response = ListApplicationsResponseSchema.parse({ items });
    return successResponse(response);
  } catch (error) {
    logger.error("List applications error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

/**
 * POST /api/v1/applications
 * Create new application
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid();
  setRequestId(requestId);

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validated = CreateApplicationRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validated.error.errors[0]?.message || "Validation failed"
      );
    }

    // Normalize hostname
    const normalizedHostname = normalizeHostname(validated.data.hostname);
    if (!normalizedHostname) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Invalid hostname"
      );
    }

    // Check for duplicate name per owner
    const existing = await prisma.application.findFirst({
      where: {
        ownerId: auth.user.id,
        name: validated.data.name,
        deletedAt: null,
      },
    });

    if (existing) {
      return errorResponse(
        ERROR_CODES.RESOURCE_ALREADY_EXISTS,
        "An application with this name already exists"
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        ownerId: auth.user.id,
        name: validated.data.name,
        hostname: normalizedHostname,
        description: validated.data.description || null,
      },
    });

    // Optionally create default URL rule
    const createDefaultUrlRule = process.env.CREATE_DEFAULT_URL_RULE === "true";
    if (createDefaultUrlRule) {
      await prisma.urlRule.create({
        data: {
          applicationId: application.id,
          hostname: normalizedHostname,
          pathPattern: "/",
        },
      });
      logger.info("Default URL rule created", { applicationId: application.id });
    }

    logger.info("Application created", { applicationId: application.id });

    // Transform to match response schema
    const response = ApplicationResponseSchema.parse({
      id: application.id,
      name: application.name,
      hostname: application.hostname,
      description: application.description,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    });
    return successResponse(response, 201);
  } catch (error) {
    logger.error("Create application error", error);
    return errorResponse(ERROR_CODES.INTERNAL_ERROR, "Internal server error", 500);
  }
}

