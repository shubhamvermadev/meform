import { z } from "zod";

/**
 * Application DTOs
 */

// Create Application
export const CreateApplicationRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .refine((val) => val.trim().length >= 2, "Name must be at least 2 characters")
    .refine((val) => val.trim().length <= 80, "Name too long"),
  hostname: z
    .string({ required_error: "Hostname is required" })
    .min(1, "Hostname is required")
    .refine((val) => val.trim().length >= 3, "Hostname must be at least 3 characters")
    .refine((val) => val.trim().length <= 255, "Hostname too long"),
  description: z
    .string()
    .max(300, "Description too long")
    .optional()
    .transform((val) => (val === "" || !val ? undefined : val.trim())),
});

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;
export type TCreateApplicationRequest = CreateApplicationRequest;

export const ApplicationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  hostname: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;
export type TApplicationResponse = ApplicationResponse;

// Update Application
export const UpdateApplicationRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  colorTheme: z.string().optional().nullable(),
});

export type UpdateApplicationRequest = z.infer<typeof UpdateApplicationRequestSchema>;

// List Applications
export const ListApplicationsResponseSchema = z.object({
  items: z.array(ApplicationResponseSchema),
});

export type ListApplicationsResponse = z.infer<typeof ListApplicationsResponseSchema>;

