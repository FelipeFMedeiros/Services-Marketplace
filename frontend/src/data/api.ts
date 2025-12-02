import axios from 'axios';

// ===== AXIOS INSTANCE =====

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===== INTERCEPTORS =====

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirecionar para login se não autenticado
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ===== RE-EXPORTS =====
// Centralizando todas as importações em um único ponto

export { authApi } from './auth';
export type { User, Provider, RegisterRequest, LoginRequest, AuthResponse } from './auth';

export { serviceTypesApi } from './serviceTypes';
export type { ServiceType, ServiceTypesResponse, ServiceTypeResponse } from './serviceTypes';

export { servicesApi } from './services';
export type {
    Service,
    ServiceVariation,
    ServicePhoto,
    CreateServiceRequest,
    UpdateServiceRequest,
    CreateVariationRequest,
    UpdateVariationRequest,
    ServicesSearchParams,
    ServicesResponse,
    ServiceResponse,
} from './services';

export { providersApi } from './providers';
export type {
    Availability,
    AvailableSlot,
    Notification,
    DashboardStats,
    ProviderProfile,
    UpdateProfileRequest,
    CreateAvailabilityRequest,
    UpdateAvailabilityRequest,
    SearchProvidersParams,
    ProvidersSearchResponse,
    ProviderResponse,
} from './providers';

export { bookingsApi } from './bookings';
export type {
    Booking,
    BookingStatus,
    CreateBookingRequest,
    BookingsSearchParams,
    BookingsResponse,
    BookingResponse,
} from './bookings';

export { reviewsApi } from './reviews';
export type {
    Review,
    CreateReviewRequest,
    UpdateReviewRequest,
    ReviewsResponse,
    ReviewResponse,
} from './reviews';
