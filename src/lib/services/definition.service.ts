
import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import { DefinitionResponse, RejectDefinitionDTO, CreateCategoryDTO, UpdateCategoryDTO, CreateDefinitionDTO, UpdateDefinitionDTO } from "@/types/definition";

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
  
    async approve(id: string): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(ENDPOINTS.DEFINITIONS.APPROVE(id)),
      );
      return data;
    },
  
    async reject(id: string, dto: RejectDefinitionDTO): Promise<DefinitionResponse> {
      const { data } = await api.post(
        path.definitions(ENDPOINTS.DEFINITIONS.REJECT(id)),
        dto,
      );
      return data;
    },
  
    async archive(id: string): Promise<DefinitionResponse> {
      const { data } = await api.delete(
        path.definitions(ENDPOINTS.DEFINITIONS.ARCHIVE(id)),
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
  
    async getWasteTypeById(id: string): Promise<any> {
      const { data } = await api.get(
        path.definitions(`${ENDPOINTS.DEFINITIONS.WASTE_TYPES}/${id}`),
      );
      return data.data;
    },
  
    async updateWasteType(
      id: string,
      dto: UpdateDefinitionDTO,
    ): Promise<DefinitionResponse> {
      const { data } = await api.put(
        path.definitions(`${ENDPOINTS.DEFINITIONS.WASTE_TYPES}/${id}`),
        dto,
      );
      return data;
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
  
    async getContractTypeById(id: string): Promise<any> {
      const { data } = await api.get(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CONTRACT_TYPES}/${id}`),
      );
      return data.data;
    },
  
    async updateContractType(
      id: string,
      dto: UpdateDefinitionDTO,
    ): Promise<DefinitionResponse> {
      const { data } = await api.put(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CONTRACT_TYPES}/${id}`),
        dto,
      );
      return data;
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
  
    async getEprEntityById(id: string): Promise<any> {
      const { data } = await api.get(
        path.definitions(`${ENDPOINTS.DEFINITIONS.EPR_ENTITIES}/${id}`),
      );
      return data.data;
    },
  
    async updateEprEntity(
      id: string,
      dto: UpdateDefinitionDTO,
    ): Promise<DefinitionResponse> {
      const { data } = await api.put(
        path.definitions(`${ENDPOINTS.DEFINITIONS.EPR_ENTITIES}/${id}`),
        dto,
      );
      return data;
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
  
    async getCustomById(categoryKey: string, id: string): Promise<any> {
      const { data } = await api.get(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CUSTOM}/${categoryKey}/${id}`),
      );
      return data.data;
    },
  
    async updateCustom(
      categoryKey: string,
      id: string,
      dto: UpdateDefinitionDTO,
    ): Promise<DefinitionResponse> {
      const { data } = await api.put(
        path.definitions(`${ENDPOINTS.DEFINITIONS.CUSTOM}/${categoryKey}/${id}`),
        dto,
      );
      return data;
    },
  };