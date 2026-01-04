import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { DefinitionService } from "@/lib/services/definition.service";
import { transformDefinitions } from "./definitionUtils/definitionTransformers";

export interface DropdownData {
  wasteOwners?: Array<{ id: string; name: string }>; // Optional - now handled by SearchableWasteOwnerSelect
  contractTypes: Array<{ id: string; name: string; code: string }>;
  wasteTypes: Array<{ id: string; name: string; code?: string; hazCode?: string }>;
  hazTypes: Array<{ id: string; code: string; name?: string; haz_code?: string }>;
}

/**
 * Load all dropdown data for collection record form
 */
export const loadDropdownData = async (): Promise<DropdownData> => {
  const defaultData: DropdownData = {
    contractTypes: [],
    wasteTypes: [],
    hazTypes: [],
  };

  try {
    // Note: wasteOwners are now loaded on-demand by SearchableWasteOwnerSelect component
    // We skip loading them here to avoid loading all waste owners upfront
    const [contractTypesRes, wasteTypesRes, hazTypesRes] =
      await Promise.allSettled([
        DefinitionService.getActiveContractTypes(),
        DefinitionService.getActiveWasteTypes(),
        DefinitionService.getActiveHazTypes(),
      ]);

    // Process contract types
    if (contractTypesRes.status === "fulfilled") {
      const transformedDefinitions = transformDefinitions(
        contractTypesRes.value,
      );

      defaultData.contractTypes = transformedDefinitions.map((def) => {
        const contractData = def.data as any;

        // Extract name and code
        const name = contractData?.name || contractData?.code || "";
        const code = contractData?.code || "";

        // Fallback to original data if needed
        if (!name && contractTypesRes.value) {
          const original = contractTypesRes.value.find(
            (ct: any) => String(ct.id) === String(def.id),
          );
          if (original) {
            const originalName =
              original.definition_contract_type?.name ||
              original.data?.name ||
              original.name;
            const originalCode =
              original.definition_contract_type?.code ||
              original.data?.code ||
              original.code;

            return {
              id: def.id,
              name: originalName || originalCode || "Unknown",
              code: originalCode || "",
            };
          }
        }

        return {
          id: def.id,
          name: name || "Unknown",
          code: code,
        };
      });
    }

    // Process waste types
    if (wasteTypesRes.status === "fulfilled") {
      const transformedDefinitions = transformDefinitions(
        wasteTypesRes.value,
      );

      defaultData.wasteTypes = transformedDefinitions.map((def) => {
        const wasteTypeData = def.data as any;

        // Extract name, code, and hazCode from nested data
        const name = wasteTypeData?.name || wasteTypeData?.code || "";
        const code = wasteTypeData?.code || "";
        const hazCode =
          wasteTypeData?.hazCode || wasteTypeData?.haz_code || "";

        // Fallback to original data if needed
        if (!name && wasteTypesRes.value) {
          const original = wasteTypesRes.value.find(
            (wt: any) => String(wt.id) === String(def.id),
          );
          if (original) {
            const originalName =
              original.definition_waste_type?.name ||
              original.data?.name ||
              original.name;
            const originalCode =
              original.definition_waste_type?.code ||
              original.data?.code ||
              original.code;
            const originalHazCode =
              original.definition_waste_type?.haz_code ||
              original.data?.hazCode ||
              original.hazCode;

            return {
              id: def.id,
              name: originalName || originalCode || "Unknown",
              code: originalCode || "",
              hazCode: originalHazCode || "",
            };
          }
        }

        return {
          id: def.id,
          name: name || "Unknown",
          code: code,
          hazCode: hazCode,
        };
      });
    }

    // Process HAZ types
    if (hazTypesRes.status === "fulfilled") {
      const transformedDefinitions = transformDefinitions(hazTypesRes.value);
      defaultData.hazTypes = transformedDefinitions
        .map((def) => {
          const hazTypeData = def.data as any;
          return {
            id: def.id,
            code: hazTypeData?.code || "",
            name: hazTypeData?.name || hazTypeData?.code || "",
            haz_code:
              hazTypeData?.hazCode ||
              hazTypeData?.haz_code ||
              hazTypeData?.code ||
              "",
          };
        })
        .filter((hazType) => hazType.id && hazType.id.trim() !== ""); // Filter out any with empty IDs
    }
  } catch (error) {
    console.error("Error loading dropdown data:", error);
  }

  return defaultData;
};

