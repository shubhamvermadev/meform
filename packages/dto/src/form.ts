import { z } from "zod";
// import { FIELD_TYPES } from "@meform/config";

/**
 * Form DTOs
 */

// Create Form
export const CreateFormRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .refine((val) => val.trim().length >= 1, "Name is required"),
    // .max(100, "Name too long"),
  urlRuleId: z.string().optional().nullable(),
});

export type CreateFormRequest = z.infer<typeof CreateFormRequestSchema>;

export const FormResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  name: z.string(),
  urlRuleId: z.string().nullable(),
  version: z.number(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  deletedAt: z.date().or(z.string()).nullable(),
});

export type FormResponse = z.infer<typeof FormResponseSchema>;

// Update Form
export const UpdateFormRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  urlRuleId: z.string().optional().nullable(),
});

export type UpdateFormRequest = z.infer<typeof UpdateFormRequestSchema>;

// List Forms
export const ListFormsResponseSchema = z.array(FormResponseSchema);

export type ListFormsResponse = z.infer<typeof ListFormsResponseSchema>;
