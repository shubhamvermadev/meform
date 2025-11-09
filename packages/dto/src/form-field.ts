import { z } from "zod";
import { FIELD_TYPES } from "@meform/config";

/**
 * Form Field DTOs
 */

const FieldTypeEnum = z.enum([
  FIELD_TYPES.TEXT,
  FIELD_TYPES.TEXTAREA,
  FIELD_TYPES.EMAIL,
  FIELD_TYPES.PHONE,
  FIELD_TYPES.NUMBER,
  FIELD_TYPES.CHECKBOX,
  FIELD_TYPES.RADIO,
]);

// Create Form Field
export const CreateFormFieldRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  key: z.string().min(1, "Key is required").max(100, "Key too long"),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  placeholder: z.string().max(200).optional().nullable(),
  options: z.record(z.unknown()).optional().nullable(), // JSON for checkbox, radio list, etc.
  position: z.number().int().min(0).default(0),
});

export type CreateFormFieldRequest = z.infer<typeof CreateFormFieldRequestSchema>;

export const FormFieldResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  name: z.string(),
  key: z.string(),
  type: FieldTypeEnum,
  required: z.boolean(),
  placeholder: z.string().nullable(),
  options: z.unknown().nullable(), // JSON
  position: z.number(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  deletedAt: z.date().or(z.string()).nullable(),
});

export type FormFieldResponse = z.infer<typeof FormFieldResponseSchema>;

// Update Form Field
export const UpdateFormFieldRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  key: z.string().min(1).max(100).optional(),
  type: FieldTypeEnum.optional(),
  required: z.boolean().optional(),
  placeholder: z.string().max(200).optional().nullable(),
  options: z.record(z.unknown()).optional().nullable(),
  position: z.number().int().min(0).optional(),
});

export type UpdateFormFieldRequest = z.infer<typeof UpdateFormFieldRequestSchema>;

// List Form Fields
export const ListFormFieldsResponseSchema = z.array(FormFieldResponseSchema);

export type ListFormFieldsResponse = z.infer<typeof ListFormFieldsResponseSchema>;

