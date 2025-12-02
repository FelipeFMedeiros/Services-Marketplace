import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirecionar para login se não autenticado
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authApi = {
    register: async (data: {
        name: string;
        email: string;
        password: string;
        role: 'CLIENT' | 'PROVIDER';
        phone: string;
        address: string;
        city: string;
    }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Service Types APIs
export const serviceTypesApi = {
    getAll: async () => {
        const response = await api.get('/service-types');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/service-types/${id}`);
        return response.data;
    },
};

// Services APIs
export const servicesApi = {
    getAll: async (params?: {
        serviceTypeId?: number;
        providerId?: number;
        location?: string;
        minPrice?: number;
        maxPrice?: number;
    }) => {
        const response = await api.get('/services', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    create: async (data: {
        name: string;
        description: string;
        serviceTypeId: number;
        basePrice: number;
    }) => {
        const response = await api.post('/services', data);
        return response.data;
    },

    update: async (id: number, data: {
        name?: string;
        description?: string;
        serviceTypeId?: number;
        basePrice?: number;
    }) => {
        const response = await api.put(`/services/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    },

    uploadPhoto: async (serviceId: number, formData: FormData) => {
        const response = await api.post(`/services/${serviceId}/photos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deletePhoto: async (serviceId: number, photoId: number) => {
        const response = await api.delete(`/services/${serviceId}/photos/${photoId}`);
        return response.data;
    },
};

// Providers APIs
export const providersApi = {
    search: async (params?: {
        serviceTypeId?: number;
        location?: string;
        minRating?: number;
    }) => {
        const response = await api.get('/providers/search', { params });
        return response.data;
    },

    getProfile: async (id: number) => {
        const response = await api.get(`/providers/${id}`);
        return response.data;
    },

    getAvailabilities: async (providerId: number) => {
        const response = await api.get(`/providers/${providerId}/availabilities`);
        return response.data;
    },

    getDashboard: async () => {
        const response = await api.get('/providers/dashboard');
        return response.data;
    },

    getBookings: async () => {
        const response = await api.get('/providers/bookings');
        return response.data;
    },

    getNotifications: async () => {
        const response = await api.get('/providers/notifications');
        return response.data;
    },
};

// Bookings APIs
export const bookingsApi = {
    create: async (data: {
        serviceId: number;
        variationId?: number;
        scheduledDate: string;
        notes?: string;
    }) => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    getMy: async () => {
        const response = await api.get('/bookings/my');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    cancel: async (id: number) => {
        const response = await api.post(`/bookings/${id}/cancel`);
        return response.data;
    },
};

// Reviews APIs
export const reviewsApi = {
    create: async (data: {
        bookingId: number;
        rating: number;
        comment?: string;
    }) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    getMy: async () => {
        const response = await api.get('/reviews/my');
        return response.data;
    },

    getServiceReviews: async (serviceId: number) => {
        const response = await api.get(`/reviews/service/${serviceId}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/reviews/${id}`);
        return response.data;
    },

    update: async (id: number, data: {
        rating?: number;
        comment?: string;
    }) => {
        const response = await api.put(`/reviews/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    },
};

export default api;
