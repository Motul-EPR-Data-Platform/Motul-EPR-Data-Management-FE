export interface DefinitionBase {
  id: string;
  category: string;
  status: string;
  createdBy: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WasteTypeData {
  code: string;
  name: string;
  hazCode?: string | null;
  description?: string | null;
}

export interface ContractTypeData {
  code: string;
  name: string;
  description?: string | null;
}

export interface EprEntityData {
  code: string;
  name: string;
  producerContact?: string | null;
  region?: string | null;
  description?: string | null;
}

export interface DynamicDefinitionContent {
  [key: string]: any;
}

export interface CreateDefinitionDTO {
  data: any; // dynamic or static
}

export interface UpdateDefinitionDTO {
  data: any; // dynamic or static
}

export interface RejectDefinitionDTO {
  reason: string;
}

export interface CreateCategoryDTO {
  key: string;
  name: string;
  description?: string | null;
  schemaDefinition: any[];
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string | null;
  schemaDefinition?: any[];
  isActive?: boolean;
}

// Combined response type
export interface DefinitionResponse {
  message?: string;
  data: any;
}

// Field schema for dynamic forms
export interface FieldSchema {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "select" | "textarea";
  label: string;
  required?: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  defaultValue?: any;
}

// Category interface
export interface Category {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  schemaDefinition: FieldSchema[];
  isActive: boolean;
  createdAt?: string;
}

// Full definition type (combines base with data)
export type Definition = DefinitionBase & {
  data:
    | WasteTypeData
    | ContractTypeData
    | EprEntityData
    | DynamicDefinitionContent;
};

// Definition status type
export type DefinitionStatus = "pending" | "approved" | "rejected" | "archived";

// Helper type for definitions with specific data type
export type DefinitionWithData<T> = DefinitionBase & { data: T };
