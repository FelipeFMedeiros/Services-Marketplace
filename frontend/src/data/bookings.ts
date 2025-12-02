import api from './api';
import type { User } from './auth';
import type { Service, ServiceVariation } from './services';

// ===== INTERFACES =====

export type BookingStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
    id: number;
    clientId: number;
    serviceId: number;
    variationId: number | null;
    scheduledDate: string;
    status: BookingStatus;
    totalPrice: number;
    notes: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    client?: User;
    service?: Service;
    variation?: ServiceVariation;
    review?: {
        id: number;
        rating: number;
        comment: string | null;
    };
}

export interface CreateBookingRequest {
    serviceId: number;
    variationId?: number;
    scheduledDate: string; // ISO 8601
    notes?: string;
}

export interface BookingsSearchParams {
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
}

export interface BookingsResponse {
    bookings: Booking[];
}

export interface BookingResponse {
    booking: Booking;
}

// ===== BOOKINGS API =====

export const bookingsApi = {
    /**
     * Criar contratação/agendamento (CLIENT)
     */
    create: async (data: CreateBookingRequest): Promise<BookingResponse> => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    /**
     * Listar minhas contratações (CLIENT)
     */
    getMy: async (params?: BookingsSearchParams): Promise<BookingsResponse> => {
        const response = await api.get('/bookings/my', { params });
        return response.data;
    },

    /**
     * Buscar detalhes de uma contratação (CLIENT ou PROVIDER envolvido)
     */
    getById: async (id: number): Promise<BookingResponse> => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    /**
     * Cancelar contratação (CLIENT - apenas PENDING ou APPROVED)
     */
    cancel: async (id: number, reason?: string): Promise<BookingResponse> => {
        const response = await api.patch(`/bookings/${id}/cancel`, { reason });
        return response.data;
    },
};