import { z } from "zod";
import { ERROR_CODES } from "@meform/config";

/**
 * Auth DTOs
 */

// Register
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

// Login
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Verify Email
export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export const VerifyEmailResponseSchema = z.object({
  success: z.boolean(),
});

export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;

// Request Password Reset
export const RequestPasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type RequestPasswordResetRequest = z.infer<
  typeof RequestPasswordResetRequestSchema
>;

export const RequestPasswordResetResponseSchema = z.object({
  success: z.boolean(),
});

export type RequestPasswordResetResponse = z.infer<
  typeof RequestPasswordResetResponseSchema
>;

// Reset Password
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

