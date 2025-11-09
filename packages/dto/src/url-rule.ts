import { z } from "zod";

/**
 * URL Rule DTOs
 */

// Create URL Rule
export const CreateUrlRuleRequestSchema = z.object({
  hostname: z
    .string({ required_error: "Hostname is required" })
    .min(1, "Hostname is required")
    .refine((val) => val.trim().length >= 1, "Hostname is required"),
  pathPattern: z
    .string({ required_error: "Path pattern is required" })
    .min(1, "Path pattern is required")
    .refine((val) => val.trim().length >= 1, "Path pattern is required"),
});

export type CreateUrlRuleRequest = z.infer<typeof CreateUrlRuleRequestSchema>;

export const UrlRuleResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  hostname: z.string(),
  pathPattern: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  deletedAt: z.date().or(z.string()).nullable(),
});

export type UrlRuleResponse = z.infer<typeof UrlRuleResponseSchema>;

// Update URL Rule
export const UpdateUrlRuleRequestSchema = z.object({
  hostname: z
    .string()
    .min(1, "Hostname is required")
    .refine((val) => val.trim().length >= 1, "Hostname is required")
    .optional(),
  pathPattern: z
    .string()
    .min(1, "Path pattern is required")
    .refine((val) => val.trim().length >= 1, "Path pattern is required")
    .optional(),
});

export type UpdateUrlRuleRequest = z.infer<typeof UpdateUrlRuleRequestSchema>;

// List URL Rules
export const ListUrlRulesResponseSchema = z.array(UrlRuleResponseSchema);

export type ListUrlRulesResponse = z.infer<typeof ListUrlRulesResponseSchema>;

