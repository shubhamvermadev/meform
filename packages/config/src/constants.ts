/**
 * Application-wide constants
 * No hardcoded strings/values; all hoisted here
 */

export const ROUTES = {
  // Auth
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    LOGOUT: "/api/v1/auth/logout",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    REQUEST_PASSWORD_RESET: "/api/v1/auth/request-password-reset",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },
  // Dashboard
  DASHBOARD: {
    HOME: "/dashboard",
    URLS: "/dashboard/urls",
    FORMS: "/dashboard/forms",
    SCRIPTS: "/dashboard/scripts",
    RESPONSES: "/dashboard/responses",
  },
  // API
  API: {
    V1: "/api/v1",
    AUTH: {
      REGISTER: "/api/v1/auth/register",
      LOGIN: "/api/v1/auth/login",
      LOGOUT: "/api/v1/auth/logout",
      VERIFY_EMAIL: "/api/v1/auth/verify-email",
      REQUEST_PASSWORD_RESET: "/api/v1/auth/request-password-reset",
      RESET_PASSWORD: "/api/v1/auth/reset-password",
    },
    APPLICATIONS: "/api/v1/applications",
    APPLICATION: (appId: string) => `/api/v1/applications/${appId}`,
    URL_RULES: (appId: string) => `/api/v1/applications/${appId}/url-rules`,
    URL_RULE: (appId: string, ruleId: string) =>
      `/api/v1/applications/${appId}/url-rules/${ruleId}`,
    FORMS: (appId: string) => `/api/v1/applications/${appId}/forms`,
    FORM: (appId: string, formId: string) =>
      `/api/v1/applications/${appId}/forms/${formId}`,
    FIELDS: (appId: string, formId: string) =>
      `/api/v1/applications/${appId}/forms/${formId}/fields`,
    FIELD: (appId: string, formId: string, fieldId: string) =>
      `/api/v1/applications/${appId}/forms/${formId}/fields/${fieldId}`,
    SUBMISSIONS: (appId: string) => `/api/v1/applications/${appId}/submissions`,
  },
  // Public
  PUBLIC: {
    V1: "/public/v1",
    CONFIG: "/public/v1/config",
    SUBMIT: "/public/v1/submit",
  },
  // CDN
  CDN: {
    EMBED: "/cdn/v1/meform.js",
  },
} as const;

export const ERROR_CODES = {
  // Auth
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_EMAIL_EXISTS: "AUTH_EMAIL_EXISTS",
  AUTH_EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_SESSION_INVALID: "AUTH_SESSION_INVALID",
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  // Resource
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  RESOURCE_ACCESS_DENIED: "RESOURCE_ACCESS_DENIED",
  // Rate limit
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const COOKIE_NAMES = {
  SESSION: "meform.session",
  CSRF_TOKEN: "meform.csrf",
} as const;

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
  },
  PUBLIC_SUBMIT: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per window
  },
  PUBLIC_CONFIG: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per window
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const FIELD_TYPES = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  EMAIL: "EMAIL",
  PHONE: "PHONE",
  NUMBER: "NUMBER",
  CHECKBOX: "CHECKBOX",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

