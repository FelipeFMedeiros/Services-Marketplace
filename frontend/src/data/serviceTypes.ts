import api from './api';

// ===== INTERFACES =====

export interface ServiceType {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        services: number;
    };
}

export interface ServiceTypesResponse {
    serviceTypes: ServiceType[];
}

export interface ServiceTypeResponse {
    serviceType: ServiceType;
}

// ===== SERVICE TYPES API =====

export const serviceTypesApi = {
    /**
     * Listar todos os tipos de serviço
     */
    getAll: async (): Promise<ServiceTypesResponse> => {
        const response = await api.get('/service-types');
        return response.data;
    },

    /**
     * Buscar tipo de serviço por ID
     */
    getById: async (id: number): Promise<ServiceTypeResponse> => {
        const response = await api.get(`/service-types/${id}`);
        return response.data;
    },
};