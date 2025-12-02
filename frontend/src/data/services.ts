import api from './api';
import type { ServiceType } from './serviceTypes';
import type { Provider } from './auth';

// ===== INTERFACES =====

export interface ServiceVariation {
    id: number;
    serviceId: number;
    name: string;
    description: string | null;
    price: number;
    duration: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface ServicePhoto {
    id: number;
    serviceId: number;
    url: string;
    publicId: string;
    isCover: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Service {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    serviceTypeId: number;
    providerId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    serviceType?: ServiceType;
    provider?: Provider;
    variations?: ServiceVariation[];
    photos?: ServicePhoto[];
    _count?: {
        bookings: number;
        reviews: number;
    };
    averageRating?: number;
}

export interface CreateServiceRequest {
    name: string;
    description: string;
    serviceTypeId: number;
    basePrice: number;
}

export interface UpdateServiceRequest {
    name?: string;
    description?: string;
    serviceTypeId?: number;
    basePrice?: number;
    isActive?: boolean;
}

export interface CreateVariationRequest {
    name: string;
    description?: string;
    price: number;
    duration?: number;
}

export interface UpdateVariationRequest {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
}

export interface ServicesSearchParams {
    serviceTypeId?: number;
    providerId?: number;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
}

export interface ServicesResponse {
    services: Service[];
}

export interface ServiceResponse {
    service: Service;
}

export interface VariationResponse {
    variation: ServiceVariation;
}

export interface PhotoResponse {
    photo: ServicePhoto;
}

// ===== SERVICES API =====

export const servicesApi = {
    /**
     * Criar novo serviço (PROVIDER)
     */
    create: async (data: CreateServiceRequest): Promise<ServiceResponse> => {
        const response = await api.post('/services', data);
        return response.data;
    },

    /**
     * Listar serviços com filtros (público)
     */
    getAll: async (params?: ServicesSearchParams): Promise<ServicesResponse> => {
        const response = await api.get('/services', { params });
        return response.data;
    },

    /**
     * Listar meus serviços (PROVIDER)
     */
    getMy: async (): Promise<ServicesResponse> => {
        const response = await api.get('/services/my');
        return response.data;
    },

    /**
     * Buscar serviço por ID (público)
     */
    getById: async (id: number): Promise<ServiceResponse> => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    /**
     * Atualizar serviço (PROVIDER - apenas próprio serviço)
     */
    update: async (id: number, data: UpdateServiceRequest): Promise<ServiceResponse> => {
        const response = await api.put(`/services/${id}`, data);
        return response.data;
    },

    /**
     * Deletar serviço (PROVIDER - apenas próprio serviço)
     */
    delete: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    },

    // ===== VARIAÇÕES =====

    /**
     * Criar variação de serviço (PROVIDER)
     */
    createVariation: async (serviceId: number, data: CreateVariationRequest): Promise<VariationResponse> => {
        const response = await api.post(`/services/${serviceId}/variations`, data);
        return response.data;
    },

    /**
     * Atualizar variação (PROVIDER)
     */
    updateVariation: async (
        serviceId: number,
        variationId: number,
        data: UpdateVariationRequest
    ): Promise<VariationResponse> => {
        const response = await api.put(`/services/${serviceId}/variations/${variationId}`, data);
        return response.data;
    },

    /**
     * Deletar variação (PROVIDER)
     */
    deleteVariation: async (serviceId: number, variationId: number): Promise<{ message: string }> => {
        const response = await api.delete(`/services/${serviceId}/variations/${variationId}`);
        return response.data;
    },

    // ===== FOTOS =====

    /**
     * Upload de foto do serviço (PROVIDER)
     */
    uploadPhoto: async (serviceId: number, file: File): Promise<PhotoResponse> => {
        const formData = new FormData();
        formData.append('photo', file);
        
        const response = await api.post(`/services/${serviceId}/photos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Definir foto como capa (PROVIDER)
     */
    setCoverPhoto: async (serviceId: number, photoId: number): Promise<PhotoResponse> => {
        const response = await api.put(`/services/${serviceId}/photos/${photoId}/cover`);
        return response.data;
    },

    /**
     * Deletar foto (PROVIDER)
     */
    deletePhoto: async (serviceId: number, photoId: number): Promise<{ message: string }> => {
        const response = await api.delete(`/services/${serviceId}/photos/${photoId}`);
        return response.data;
    },
};