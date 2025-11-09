/**
 * UI constants for labels, messages, and button text
 * No hardcoded strings in components
 */

export const UI_LABELS = {
  // Actions
  ADD: "Add",
  EDIT: "Edit",
  DELETE: "Delete",
  SAVE: "Save",
  CANCEL: "Cancel",
  CLOSE: "Close",
  CONFIRM: "Confirm",
  BACK: "Back",
  COPY: "Copy",
  VIEW: "View",

  // Specific actions
  ADD_URL: "Add URL",
  EDIT_URL: "Edit URL",
  DELETE_URL: "Delete URL",
  ADD_FORM: "Add New Form",
  EDIT_FORM: "Edit Form",
  DELETE_FORM: "Delete Form",
  ADD_FIELD: "Add Field",
  EDIT_FIELD: "Edit Field",
  DELETE_FIELD: "Delete Field",
  CREATE_APPLICATION: "Create Application",
  CREATE_NEW_APPLICATION: "Create New Application",

  // Titles
  URL: "URL",
  FORMS: "Forms",
  SCRIPTS: "Scripts",
  VISITOR_RESPONSES: "Visitor Responses",
  FIELDS: "Fields",

  // Messages
  URL_ADDED: "URL added successfully",
  URL_UPDATED: "URL updated successfully",
  URL_DELETED: "URL deleted successfully",
  FORM_ADDED: "Form added successfully",
  FORM_UPDATED: "Form updated successfully",
  FORM_DELETED: "Form deleted successfully",
  FIELD_ADDED: "Field added successfully",
  FIELD_UPDATED: "Field updated successfully",
  FIELD_DELETED: "Field deleted successfully",
  COPIED: "Copied to clipboard",
  APP_CREATED: "Application created",
  APP_UPDATED: "Application updated",
  APP_DELETED: "Application deleted",

  // Confirmations
  CONFIRM_DELETE_URL: "Are you sure you want to delete this URL rule?",
  CONFIRM_DELETE_FORM: "Are you sure you want to delete this form?",
  CONFIRM_DELETE_FIELD: "Are you sure you want to delete this field?",

  // Field labels
  NAME: "Name",
  HOSTNAME: "Hostname",
  PATH_PATTERN: "Path Pattern",
  URL_RULE: "URL Rule",
  FIELD_TYPE: "Type",
  PLACEHOLDER: "Placeholder",
  REQUIRED: "Required",
  OPTIONS: "Options",
  POSITION: "Position",
  KEY: "Key",
  APP_NAME: "Application name",
  APP_HOSTNAME: "Website hostname",
  APP_DESCRIPTION: "Description",
} as const;

export const UI_DESCRIPTIONS = {
  PATH_PATTERN_HELP:
    "Supports exact paths (/pricing), wildcards (/blog/*), or regex (^/docs/.*$)",
  SCRIPT_EXPLANATION:
    "The script automatically detects the current hostname and path, then matches against your URL rules to determine which form to display.",
  FIELD_KEY_HELP: "Unique identifier for this field (auto-generated from name)",
  FIELD_OPTIONS_HELP: "For CHECKBOX type: JSON array of options, e.g. [\"Option 1\", \"Option 2\"]",
  APP_CREATE_DESC: "Provide basic info for your application.",
  APP_HOSTNAME_HELPER: "example.com",
  EMPTY_STATE_MESSAGE: "Seems you have no application, create new",
} as const;

