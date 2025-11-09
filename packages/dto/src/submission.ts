import { z } from "zod";
import { PaginationQuerySchema, PaginationMetaSchema } from "./common";

/**
 * Submission DTOs
 */

// Public Submit
export const PublicSubmitRequestSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  formId: z.string().min(1, "Form ID is required"),
  hostname: z.string().min(1, "Hostname is required"),
  path: z.string().min(1, "Path is required"),
  payload: z.record(z.unknown()), // { key: value } object
});

export type PublicSubmitRequest = z.infer<typeof PublicSubmitRequestSchema>;

export const PublicSubmitResponseSchema = z.object({
  id: z.string(),
  success: z.boolean(),
});

export type PublicSubmitResponse = z.infer<typeof PublicSubmitResponseSchema>;

// Public Config
export const PublicConfigQuerySchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
});

export type PublicConfigQuery = z.infer<typeof PublicConfigQuerySchema>;

export const PublicConfigResponseSchema = z.object({
  forms: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      fields: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          key: z.string(),
          type: z.string(),
          required: z.boolean(),
          placeholder: z.string().nullable(),
          options: z.unknown().nullable(),
        })
      ),
    })
  ),
});

export type PublicConfigResponse = z.infer<typeof PublicConfigResponseSchema>;

// List Submissions
export const ListSubmissionsQuerySchema = PaginationQuerySchema.extend({
  formId: z.string().optional(),
  hostname: z.string().optional(),
  path: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
});

export type ListSubmissionsQuery = z.infer<typeof ListSubmissionsQuerySchema>;

export const SubmissionResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  applicationId: z.string(),
  hostname: z.string(),
  path: z.string(),
  payload: z.record(z.unknown()),
  createdAt: z.date().or(z.string()),
});

export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

export const ListSubmissionsResponseSchema = z.object({
  data: z.array(SubmissionResponseSchema),
  meta: PaginationMetaSchema,
});

export type ListSubmissionsResponse = z.infer<typeof ListSubmissionsResponseSchema>;

