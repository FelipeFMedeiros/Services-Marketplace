import api from './api';
import type { User } from './auth';
import type { Booking } from './bookings';

// ===== INTERFACES =====

export interface Review {
    id: number;
    bookingId: number;
    clientId: number;
    rating: number; // 1-5
    comment: string | null;
    createdAt: string;
    updatedAt: string;
    client?: User;
    booking?: Booking;
}

export interface CreateReviewRequest {
    bookingId: number;
    rating: number;
    comment?: string;
}

export interface UpdateReviewRequest {
    rating?: number;
    comment?: string;
}

export interface ReviewsResponse {
    reviews: Review[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ReviewResponse {
    review: Review;
}

export interface ServiceReviewsParams {
    page?: number;
    limit?: number;
    minRating?: number;
    maxRating?: number;
}

// ===== REVIEWS API =====

export const reviewsApi = {
    /**
     * Criar avaliação (CLIENT - apenas COMPLETED bookings sem review)
     */
    create: async (data: CreateReviewRequest): Promise<ReviewResponse> => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    /**
     * Listar minhas avaliações (CLIENT)
     */
    getMy: async (): Promise<ReviewsResponse> => {
        const response = await api.get('/reviews/my');
        return response.data;
    },

    /**
     * Listar avaliações de um serviço (público)
     */
    getServiceReviews: async (
        serviceId: number,
        params?: ServiceReviewsParams
    ): Promise<ReviewsResponse> => {
        const response = await api.get(`/reviews/service/${serviceId}`, { params });
        return response.data;
    },

    /**
     * Buscar avaliação por ID (público)
     */
    getById: async (id: number): Promise<ReviewResponse> => {
        const response = await api.get(`/reviews/${id}`);
        return response.data;
    },

    /**
     * Atualizar avaliação (CLIENT - apenas própria review)
     */
    update: async (id: number, data: UpdateReviewRequest): Promise<ReviewResponse> => {
        const response = await api.put(`/reviews/${id}`, data);
        return response.data;
    },

    /**
     * Deletar avaliação (CLIENT - apenas própria review)
     */
    delete: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    },
};