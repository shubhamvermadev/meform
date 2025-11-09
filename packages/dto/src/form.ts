import { z } from "zod";
// import { FIELD_TYPES } from "@meform/config";

/**
 * Form DTOs
 */

// Google Sheets Integration Schema
export const GoogleSheetsIntegrationSchema = z
  .object({
    enabled: z.boolean(),
    sheetName: z.string().min(1).optional(),
    appScriptDeploymentId: z.string().optional().nullable(),
    webAppUrl: z.string().url().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.enabled) {
        return data.sheetName && data.sheetName.trim().length > 0 && data.webAppUrl && data.webAppUrl.trim().length > 0;
      }
      return true;
    },
    {
      message: "sheetName and webAppUrl are required when enabled is true",
      path: ["webAppUrl"],
    }
  );

export type GoogleSheetsIntegration = z.infer<typeof GoogleSheetsIntegrationSchema>;

// Create Form
export const CreateFormRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .refine((val) => val.trim().length >= 1, "Name is required"),
    // .max(100, "Name too long"),
  urlRuleId: z.string().optional().nullable(),
  renderAsSection: z.boolean().optional(),
  sectionIdOverride: z.string().optional().nullable(),
  sharePublicly: z.boolean().optional(),
  googleSheets: GoogleSheetsIntegrationSchema.optional(),
});

export type CreateFormRequest = z.infer<typeof CreateFormRequestSchema>;

export const FormResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  name: z.string(),
  urlRuleId: z.string().nullable(),
  version: z.number(),
  renderAsSection: z.boolean(),
  sectionIdOverride: z.string().nullable(),
  computedSectionId: z.string().optional(), // Computed on server
  sharePublicly: z.boolean(),
  googleSheets: GoogleSheetsIntegrationSchema.nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  deletedAt: z.date().or(z.string()).nullable(),
});

export type FormResponse = z.infer<typeof FormResponseSchema>;

// Update Form
export const UpdateFormRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  urlRuleId: z.string().optional().nullable(),
  renderAsSection: z.boolean().optional(),
  sectionIdOverride: z.string().optional().nullable(),
  sharePublicly: z.boolean().optional(),
  googleSheets: GoogleSheetsIntegrationSchema.optional(),
});

export type UpdateFormRequest = z.infer<typeof UpdateFormRequestSchema>;

// List Forms
export const ListFormsResponseSchema = z.array(FormResponseSchema);

export type ListFormsResponse = z.infer<typeof ListFormsResponseSchema>;
