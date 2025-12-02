import api from './api';
import type { User } from './auth';
import type { Service, ServiceVariation } from './services';
import type { Provider } from './auth';

// ===== INTERFACES =====

export type BookingStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
    id: number;
    clientId: number;
    providerId: number;
    serviceId: number;
    serviceVariationId: number;
    startDatetime: string;
    endDatetime: string;
    start_datetime?: string;
    end_datetime?: string;
    priceAtBooking: number;
    price_at_booking?: number;
    status: BookingStatus;
    cancellationReason: string | null;
    cancellation_reason?: string | null;
    createdAt: string;
    updatedAt: string;
    created_at?: string;
    updated_at?: string;
    client?: User;
    provider?: Provider;
    service?: Service;
    serviceVariation?: ServiceVariation;
    service_variation?: ServiceVariation;
    review?: {
        id: number;
        rating: number;
        comment: string | null;
    };
}

export interface CreateBookingRequest {
    serviceId: number;
    variationId: number;
    startDatetime: string;
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
    message?: string;
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