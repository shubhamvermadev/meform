import { slugify } from "./slugify";
import { SECTION_ID_PREFIX } from "@meform/config";

/**
 * Builds a section ID for a form
 * @param applicationId - Application ID
 * @param formName - Form name
 * @returns Section ID in format: meform_{applicationId}_{slugifiedFormName}
 */
export function buildSectionId(applicationId: string, formName: string): string {
  const slug = slugify(formName);
  return `${SECTION_ID_PREFIX}_${applicationId}_${slug}`;
}

