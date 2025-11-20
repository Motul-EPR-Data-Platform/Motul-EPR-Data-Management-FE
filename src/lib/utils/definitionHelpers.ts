import { DefinitionService } from "@/lib/services/definition.service";
import { CreateDefinitionDTO, DefinitionResponse } from "@/types/definition";
import {
  CATEGORY_KEYS,
  CATEGORY_ROUTE_KEYS,
} from "@/constants/categoryKeys";
import { transformDefinitions } from "@/lib/utils/definitionTransformers";

/**
 * Helper function to create a definition based on category key
 * Routes to the appropriate service method
 * @param categoryKey - Can be either backend key (waste_type) or route key (waste-types)
 */
export async function createDefinition(
  categoryKey: string,
  dto: CreateDefinitionDTO
): Promise<DefinitionResponse> {
  // Check both route keys (from URL) and backend keys (from API)
  if (
    categoryKey === CATEGORY_ROUTE_KEYS.WASTE_TYPES ||
    categoryKey === CATEGORY_KEYS.WASTE_TYPE
  ) {
    return DefinitionService.createWasteType(dto);
  }
  if (
    categoryKey === CATEGORY_ROUTE_KEYS.CONTRACT_TYPES ||
    categoryKey === CATEGORY_KEYS.CONTRACT_TYPE
  ) {
    return DefinitionService.createContractType(dto);
  }
  if (
    categoryKey === CATEGORY_ROUTE_KEYS.EPR_ENTITIES ||
    categoryKey === CATEGORY_KEYS.EPR_ENTITY
  ) {
    return DefinitionService.createEprEntity(dto);
  }
  // Custom category - use original key
  return DefinitionService.createCustom(categoryKey, dto);
}

/**
 * Helper function to get definitions for a category
 * @param categoryKey - Can be either backend key (waste_type) or route key (waste-types)
 */
export async function getDefinitionsByCategory(categoryKey: string): Promise<any[]> {
  let rawDefinitions: any[] = [];

  // Check both route keys (from URL) and backend keys (from API)
  if (
    categoryKey === CATEGORY_ROUTE_KEYS.WASTE_TYPES ||
    categoryKey === CATEGORY_KEYS.WASTE_TYPE
  ) {
    rawDefinitions = await DefinitionService.getActiveWasteTypes();
  } else if (
    categoryKey === CATEGORY_ROUTE_KEYS.CONTRACT_TYPES ||
    categoryKey === CATEGORY_KEYS.CONTRACT_TYPE
  ) {
    rawDefinitions = await DefinitionService.getActiveContractTypes();
  } else if (
    categoryKey === CATEGORY_ROUTE_KEYS.EPR_ENTITIES ||
    categoryKey === CATEGORY_KEYS.EPR_ENTITY
  ) {
    rawDefinitions = await DefinitionService.getActiveEprEntities();
  } else {
    // Custom category - use original key
    rawDefinitions = await DefinitionService.getActiveCustom(categoryKey);
  }

  // Transform backend response to frontend format
  return transformDefinitions(rawDefinitions);
}

