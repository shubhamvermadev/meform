/**
 * UI constants for labels, messages, and button text
 * No hardcoded strings in components
 */

export const UI_LABELS = {
  // Actions
  ADD: "Add",
  EDIT: "Edit",
  SETTING: "Setting",
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
  SETTINGS: "Settings",

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
  APP_DISABLED: "Application disabled",
  APP_ENABLED: "Application enabled",
  APP_DELETE_SUCCESS: "Application deleted successfully",
  APP_DELETE_ERROR: "Failed to delete application",
  APP_STATUS_UPDATED: "Application status updated",

  // Confirmations
  CONFIRM_DELETE_URL: "Are you sure you want to delete this URL rule?",
  CONFIRM_DELETE_FORM: "Are you sure you want to delete this form?",
  CONFIRM_DELETE_FIELD: "Are you sure you want to delete this field?",
  CONFIRM_DELETE_APP: "Are you sure you want to delete this application? This action cannot be undone.",
  CONFIRM_DELETE_APP_NAME: "Type the application name to confirm deletion",

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
  APP_STATUS: "Application Status",
  APP_STATUS_ACTIVE: "Active",
  APP_STATUS_DISABLED: "Disabled",
  RENDER_AS_SECTION: "Render as section",
  SECTION_ID: "Section ID",
  SECTION_ID_OVERRIDE: "Custom Section ID (optional)",
  SHARE_PUBLICLY: "Share via public link",
  PUBLIC_LINK: "Public Link",
  GOOGLE_SHEETS: "Send submissions to Google Sheets",
  SHEET_NAME: "Sheet Name",
  APP_SCRIPT_DEPLOYMENT_ID: "Apps Script Deployment ID",
  WEB_APP_URL: "Web App URL",
  VIEW_SETUP_GUIDE: "View setup guide",
  COPY_SECTION_ID: "Copy Section ID",
  COPY_PUBLIC_LINK: "Copy Public Link",
  DANGER_ZONE: "Danger Zone",
  DELETE_APPLICATION: "Delete Application",
} as const;

export const UI_DESCRIPTIONS = {
  PATH_PATTERN_HELP:
    "Supports exact paths (/pricing), wildcards (/blog/*), or regex (^/docs/.*$)",
  SCRIPT_EXPLANATION:
    "The script automatically detects the current hostname and path, then matches against your URL rules to determine which form to display.",
  FIELD_KEY_HELP: "Unique identifier for this field (auto-generated from name)",
  FIELD_OPTIONS_HELP: "For CHECKBOX/RADIO types: JSON array (e.g. [\"Option 1\", \"Option 2\"]) or object (e.g. {\"opt1\": \"Option 1\", \"opt2\": \"Option 2\"})",
  APP_CREATE_DESC: "Provide basic info for your application.",
  APP_HOSTNAME_HELPER: "example.com",
  EMPTY_STATE_MESSAGE: "Seems you have no application, create new",
  SECTION_RENDERING_HELP: "When enabled, the form will render inline in a container on your page instead of (or in addition to) the floating widget.",
  SECTION_ID_HELP: "Use this ID in your HTML to render the form inline. You can also use the data attribute method.",
  PUBLIC_LINK_HELP: "Share this link to allow users to submit the form without embedding it on your website.",
  GOOGLE_SHEETS_HELP: "Automatically send form submissions to a Google Sheet using Apps Script.",
  APP_STATUS_DISABLED_HELP: "When disabled, all public endpoints will return 403 for this application and the embed will not render.",
} as const;

