import { FIELD_TYPES, type FieldType } from "@meform/config";

/**
 * Type guard to check if a string is a valid FieldType
 */
export function isFieldType(value: string): value is FieldType {
  return Object.values(FIELD_TYPES).includes(value as FieldType);
}




