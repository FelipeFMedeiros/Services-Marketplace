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
    success: boolean;
    data: {
        serviceTypes: ServiceType[];
        total: number;
    };
}

export interface ServiceTypeResponse {
    success: boolean;
    data: {
        serviceType: ServiceType;
    };
}

// ===== SERVICE TYPES API =====

export const serviceTypesApi = {
    /**
     * Listar todos os tipos de serviço
     */
    getAll: async (): Promise<ServiceTypesResponse> => {
        const response = await api.get('/service-types');
        return response.data; // Backend retorna { success, data: { serviceTypes, total } }
    },

    /**
     * Buscar tipo de serviço por ID
     */
    getById: async (id: number): Promise<ServiceTypeResponse> => {
        const response = await api.get(`/service-types/${id}`);
        return response.data; // Backend retorna { success, data: { serviceType } }
    },
};