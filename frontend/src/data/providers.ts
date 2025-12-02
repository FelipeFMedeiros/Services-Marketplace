import api from './api';
import type { Provider, User } from './auth';
import type { Service } from './services';
import type { Booking } from './bookings';

// ===== INTERFACES =====

export interface Availability {
    id: number;
    providerId: number;
    dayOfWeek: number; // 0-6 (domingo-sábado)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    createdAt: string;
    updatedAt: string;
}

export interface AvailableSlot {
    datetime: string;
    available: boolean;
}

export interface Notification {
    id: number;
    providerId: number;
    type: 'NEW_BOOKING' | 'BOOKING_CANCELLED' | 'NEW_REVIEW';
    title: string;
    message: string;
    isRead: boolean;
    relatedId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    approvedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    activeServices: number;
    recentBookings: Array<{
        id: number;
        scheduledDate: string;
        status: string;
        client: User;
        service: Service;
    }>;
}

export interface ProviderProfile extends Provider {
    user: User;
    services: Service[];
    _count: {
        bookings: number;
    };
}

export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    bio?: string;
}

export interface CreateAvailabilityRequest {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface UpdateAvailabilityRequest {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
}

export interface SearchProvidersParams {
    serviceTypeId?: number;
    location?: string;
    minRating?: number;
}

export interface ProvidersSearchResponse {
    providers: ProviderProfile[];
}

export interface ProviderResponse {
    provider: ProviderProfile;
}

export interface AvailabilitiesResponse {
    availabilities: Availability[];
}

export interface AvailabilityResponse {
    availability: Availability;
}

export interface AvailableSlotsResponse {
    slots: AvailableSlot[];
}

export interface NotificationsResponse {
    notifications: Notification[];
}

export interface NotificationResponse {
    notification: Notification;
}

export interface DashboardResponse {
    stats: DashboardStats;
}

// ===== PROVIDERS API =====

export const providersApi = {
    /**
     * Atualizar perfil do prestador (PROVIDER)
     */
    updateProfile: async (data: UpdateProfileRequest): Promise<ProviderResponse> => {
        const response = await api.put('/providers/profile', data);
        return response.data;
    },

    /**
     * Buscar prestadores com filtros (público)
     */
    search: async (params?: SearchProvidersParams): Promise<ProvidersSearchResponse> => {
        const response = await api.get('/providers/search', { params });
        return response.data;
    },

    /**
     * Buscar perfil de prestador por ID (público)
     */
    getById: async (id: number): Promise<ProviderResponse> => {
        const response = await api.get(`/providers/${id}`);
        return response.data;
    },

    // ===== DISPONIBILIDADES =====

    /**
     * Criar disponibilidade (PROVIDER)
     */
    createAvailability: async (data: CreateAvailabilityRequest): Promise<AvailabilityResponse> => {
        const response = await api.post('/providers/availabilities', data);
        return response.data;
    },

    /**
     * Listar disponibilidades (PROVIDER)
     */
    getAvailabilities: async (): Promise<AvailabilitiesResponse> => {
        const response = await api.get('/providers/availabilities');
        return response.data;
    },

    /**
     * Atualizar disponibilidade (PROVIDER)
     */
    updateAvailability: async (
        id: number,
        data: UpdateAvailabilityRequest
    ): Promise<AvailabilityResponse> => {
        const response = await api.put(`/providers/availabilities/${id}`, data);
        return response.data;
    },

    /**
     * Deletar disponibilidade (PROVIDER)
     */
    deleteAvailability: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete(`/providers/availabilities/${id}`);
        return response.data;
    },

    /**
     * Buscar slots disponíveis de um prestador (público)
     */
    getAvailableSlots: async (
        providerId: number,
        params: { startDate: string; endDate: string }
    ): Promise<AvailableSlotsResponse> => {
        const response = await api.get(`/providers/${providerId}/available-slots`, { params });
        return response.data;
    },

    // ===== DASHBOARD & AGENDAMENTOS =====

    /**
     * Listar agendamentos do prestador (PROVIDER)
     */
    getBookings: async (params?: {
        status?: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await api.get('/providers/bookings', { params });
        return response.data;
    },

    /**
     * Obter estatísticas do dashboard (PROVIDER)
     */
    getDashboard: async (): Promise<DashboardResponse> => {
        const response = await api.get('/providers/dashboard/stats');
        return response.data;
    },

    /**
     * Aprovar agendamento (PROVIDER)
     */
    approveBooking: async (bookingId: number): Promise<{ message: string; booking: Booking }> => {
        const response = await api.patch(`/providers/bookings/${bookingId}/approve`);
        return response.data;
    },

    /**
     * Cancelar agendamento (PROVIDER)
     */
    cancelBooking: async (bookingId: number, reason?: string): Promise<{ message: string; booking: Booking }> => {
        const response = await api.patch(`/providers/bookings/${bookingId}/cancel`, { reason });
        return response.data;
    },

    /**
     * Marcar agendamento como concluído (PROVIDER)
     */
    completeBooking: async (bookingId: number): Promise<{ message: string; booking: Booking }> => {
        const response = await api.patch(`/providers/bookings/${bookingId}/complete`);
        return response.data;
    },

    // ===== NOTIFICAÇÕES =====

    /**
     * Listar notificações (PROVIDER)
     */
    getNotifications: async (params?: { isRead?: boolean }): Promise<NotificationsResponse> => {
        const response = await api.get('/providers/notifications', { params });
        return response.data;
    },

    /**
     * Marcar notificação como lida (PROVIDER)
     */
    markNotificationAsRead: async (id: number): Promise<NotificationResponse> => {
        const response = await api.patch(`/providers/notifications/${id}/read`);
        return response.data;
    },
};