import {
  Category,
  FieldSchema,
  Definition,
  DefinitionBase,
} from "@/types/definition";
import { CATEGORY_KEYS } from "@/constants/categoryKeys";

/**
 * Transform a single field schema from backend format to frontend format
 */
function transformFieldSchema(backendField: any): FieldSchema {
  return {
    name: backendField.key || backendField.name,
    type: mapFieldType(backendField.type),
    label: backendField.label,
    required: backendField.isRequired ?? backendField.required ?? false,
    options: backendField.options,
    placeholder: backendField.placeholder,
    defaultValue: backendField.defaultValue,
  };
}

/**
 * Map backend field types to frontend field types
 */
function mapFieldType(backendType: string): FieldSchema["type"] {
  const typeMap: Record<string, FieldSchema["type"]> = {
    text: "string",
    string: "string",
    number: "number",
    boolean: "boolean",
    date: "date",
    select: "select",
    textarea: "textarea",
  };
  return typeMap[backendType?.toLowerCase()] || "string";
}

/**
 * Transform a single category from backend format to frontend format
 */
export function transformCategory(backendCategory: any): Category {
  if (!backendCategory) {
    throw new Error("Cannot transform null or undefined category");
  }

  const schemaDefinition = (
    backendCategory.schema_definition ||
    backendCategory.schemaDefinition ||
    []
  ).map(transformFieldSchema);

  return {
    id: String(backendCategory.id || ""),
    key: backendCategory.key,
    name: backendCategory.name,
    description: backendCategory.description || null,
    isActive: backendCategory.is_active ?? backendCategory.isActive ?? true,
    createdAt: backendCategory.created_at || backendCategory.createdAt,
    schemaDefinition,
    // Use definitionCount from backend if available
    definitionCount: backendCategory.definitionCount ?? backendCategory.definition_count ?? undefined,
  };
}

/**
 * Transform an array of categories from backend format to frontend format
 */
export function transformCategories(backendCategories: any[]): Category[] {
  if (!Array.isArray(backendCategories)) {
    return [];
  }
  return backendCategories.map(transformCategory);
}

/**
 * Extract nested definition data from backend response
 * Backend returns data in format: { definition_waste_type: {...}, definition_contract_type: {...}, etc. }
 */
function extractDefinitionData(backendDefinition: any): any {
  if (!backendDefinition) {
    return null;
  }

  // Find the nested definition data key (e.g., definition_waste_type, definition_contract_type)
  const definitionKeys = Object.keys(backendDefinition).filter((key) =>
    key.startsWith("definition_"),
  );

  if (definitionKeys.length === 0) {
    // If no nested key found, check if data is already in the expected format
    return backendDefinition.data || null;
  }

  // Get the nested data (should only be one)
  const nestedData = backendDefinition[definitionKeys[0]];

  // Transform snake_case to camelCase for the nested data
  const transformed: any = {};
  if (nestedData) {
    Object.keys(nestedData).forEach((key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      transformed[camelKey] = nestedData[key];
    });
  }

  return transformed;
}

/**
 * Transform a single definition from backend format to frontend format
 */
export function transformDefinition(backendDefinition: any): Definition {
  if (!backendDefinition) {
    throw new Error("Cannot transform null or undefined definition");
  }

  // Extract and transform the nested data
  const definitionData = extractDefinitionData(backendDefinition);

  // Transform base fields
  const base: DefinitionBase = {
    id: String(backendDefinition.id || ""),
    category: backendDefinition.category || "",
    status: (backendDefinition.status || "").toLowerCase(),
    createdBy:
      backendDefinition.created_by || backendDefinition.createdBy || "",
    approvedBy:
      backendDefinition.approved_by || backendDefinition.approvedBy || null,
    approvedAt:
      backendDefinition.approved_at || backendDefinition.approvedAt || null,
    isActive: backendDefinition.is_active ?? backendDefinition.isActive ?? true,
    createdAt:
      backendDefinition.created_at || backendDefinition.createdAt || "",
  };

  return {
    ...base,
    data: definitionData || ({} as any),
  };
}

/**
 * Transform an array of definitions from backend format to frontend format
 */
export function transformDefinitions(backendDefinitions: any[]): Definition[] {
  if (!Array.isArray(backendDefinitions)) {
    return [];
  }
  return backendDefinitions.map(transformDefinition);
}
