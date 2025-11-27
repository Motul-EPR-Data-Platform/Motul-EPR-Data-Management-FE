/**
 * Category key constants
 * Backend uses underscores (waste_type), frontend routes use hyphens (waste-types)
 */

// Backend category keys (as returned from API)
export const CATEGORY_KEYS = {
  WASTE_TYPE: "waste_type",
  CONTRACT_TYPE: "contract_type",
  EPR_ENTITY: "epr_entity",
} as const;

// Frontend route keys (used in URLs)
export const CATEGORY_ROUTE_KEYS = {
  WASTE_TYPES: "waste-types",
  CONTRACT_TYPES: "contract-types",
  EPR_ENTITIES: "epr-entities",
} as const;

/**
 * Convert backend category key (underscore) to frontend route key (hyphen)
 */
export function backendKeyToRouteKey(backendKey: string): string {
  const keyMap: Record<string, string> = {
    [CATEGORY_KEYS.WASTE_TYPE]: CATEGORY_ROUTE_KEYS.WASTE_TYPES,
    [CATEGORY_KEYS.CONTRACT_TYPE]: CATEGORY_ROUTE_KEYS.CONTRACT_TYPES,
    [CATEGORY_KEYS.EPR_ENTITY]: CATEGORY_ROUTE_KEYS.EPR_ENTITIES,
  };
  return keyMap[backendKey] || backendKey;
}

/**
 * Convert frontend route key (hyphen) to backend category key (underscore)
 */
export function routeKeyToBackendKey(routeKey: string): string {
  const keyMap: Record<string, string> = {
    [CATEGORY_ROUTE_KEYS.WASTE_TYPES]: CATEGORY_KEYS.WASTE_TYPE,
    [CATEGORY_ROUTE_KEYS.CONTRACT_TYPES]: CATEGORY_KEYS.CONTRACT_TYPE,
    [CATEGORY_ROUTE_KEYS.EPR_ENTITIES]: CATEGORY_KEYS.EPR_ENTITY,
  };
  return keyMap[routeKey] || routeKey;
}

/**
 * Check if a category key is a standard category (not custom)
 */
export function isStandardCategory(key: string): boolean {
  return (
    key === CATEGORY_KEYS.WASTE_TYPE ||
    key === CATEGORY_KEYS.CONTRACT_TYPE ||
    key === CATEGORY_KEYS.EPR_ENTITY ||
    key === CATEGORY_ROUTE_KEYS.WASTE_TYPES ||
    key === CATEGORY_ROUTE_KEYS.CONTRACT_TYPES ||
    key === CATEGORY_ROUTE_KEYS.EPR_ENTITIES
  );
}
