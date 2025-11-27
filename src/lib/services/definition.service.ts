
import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import { DefinitionResponse, CreateCategoryDTO, UpdateCategoryDTO, CreateDefinitionDTO } from "@/types/definition";

export const DefinitionService = {

    async getAllDefinitions(query?: {
      category?: string;
      status?: string;
      includeInactive?: boolean;
    }): Promise<any[]> {
      const { data } = await api.get(
        path.definitions(
          `${ENDPOINTS.DEFINITIONS.ROOT}?` +
            new URLSearchParams({
              ...(query?.category ? { category: query.category } : {}),
              ...(query?.status ? { status: query.status } : {}),
              ...(query?.includeInactive
                ? { includeInactive: String(query.includeInactive) }
                : {}),
            }).toString(),
        ),
      );
      return data.data;
    },
  
    /**
     * Archive definition (soft delete)
     * DELETE /definitions/:id
     */
    async archive(id: string): Promise<DefinitionResponse> {
      const { data } = await api.delete(
        path.definitions(`/${id}`),
      );
      return data;
    },
  
    /**
     * --------------------
     * Category APIs
     * --------------------
     */
  
    async getAllCategories(includeInactive = false): Promise<any[]> {
      const { data } = await api.get(
        path.definitions(
          `${ENDPOINTS.DEFINITIONS.CATEGORIES}?includeInactive=${includeInactive}`,
        ),
      );
      // Handle both cases: { data: [...] } and direct array
      const result = data.data || data;
      return Array.isArray(result) ? result : [];
    },
  
    async getCategoryByKey(key: string): Promise<any> {
      const { data } = await api.get(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CATEGORIES}/${key}`),
      );
      return data.data;
    },
  
    async createCategory(dto: CreateCategoryDTO): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(ENDPOINTS.DEFINITIONS.CATEGORIES),
        dto,
      );
      return data;
    },
  
    async updateCategory(
      key: string,
      dto: UpdateCategoryDTO,
    ): Promise<DefinitionResponse> {
      const { data } = await api.put(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CATEGORIES}/${key}`),
        dto,
      );
      return data;
    },
  
    /**
     * --------------------
     * Waste Type APIs
     * --------------------
     */
  
    async createWasteType(dto: CreateDefinitionDTO): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(ENDPOINTS.DEFINITIONS.WASTE_TYPES),
        dto,
      );
      return data;
    },
  
    async getActiveWasteTypes(): Promise<any[]> {
      const { data } = await api.get(
        path.definitions(ENDPOINTS.DEFINITIONS.WASTE_TYPES),
      );
      return data.data;
    },
  
    /**
     * --------------------
     * Contract Type APIs
     * --------------------
     */
  
    async createContractType(dto: CreateDefinitionDTO): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(ENDPOINTS.DEFINITIONS.CONTRACT_TYPES),
        dto,
      );
      return data;
    },
  
    async getActiveContractTypes(): Promise<any[]> {
      const { data } = await api.get(
        path.definitions(ENDPOINTS.DEFINITIONS.CONTRACT_TYPES),
      );
      return data.data;
    },
  
    /**
     * --------------------
     * EPR Entity APIs
     * --------------------
     */
  
    async createEprEntity(dto: CreateDefinitionDTO): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(ENDPOINTS.DEFINITIONS.EPR_ENTITIES),
        dto,
      );
      return data;
    },
  
    async getActiveEprEntities(): Promise<any[]> {
      const { data } = await api.get(
        path.definitions(ENDPOINTS.DEFINITIONS.EPR_ENTITIES),
      );
      return data.data;
    },
  
    /**
     * --------------------
     * Custom Category APIs
     * --------------------
     */
  
    async createCustom(categoryKey: string, dto: CreateDefinitionDTO): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CUSTOM}/${categoryKey}`),
        dto,
      );
      return data;
    },
  
    async getActiveCustom(categoryKey: string): Promise<any[]> {
      const { data } = await api.get(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CUSTOM}/${categoryKey}`),
      );
      return data.data;
    },
  };