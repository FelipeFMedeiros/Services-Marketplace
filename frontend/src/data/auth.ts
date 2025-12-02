import api from './api';

// ===== INTERFACES =====

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'CLIENT' | 'PROVIDER';
    phone: string | null;
    address: string | null;
    city: string | null;
    createdAt: string;
    updatedAt: string;
    provider?: Provider;
}

export interface Provider {
    id: number;
    userId: number;
    bio: string | null;
    rating: number;
    totalReviews: number;
    city: string | null;
    state: string | null;
    user?: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'CLIENT' | 'PROVIDER';
    phone?: string;
    address?: string;
    city?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
    };
}

// ===== AUTH API =====

export const authApi = {
    /**
     * Registrar novo usuário (cliente ou prestador)
     */
    register: async (data: RegisterRequest): Promise<User> => {
        const response = await api.post('/auth/register', data);
        return response.data.data.user;
    },

    /**
     * Fazer login - retorna JWT em httpOnly cookie
     */
    login: async (data: LoginRequest): Promise<User> => {
        const response = await api.post('/auth/login', data);
        return response.data.data.user;
    },

    /**
     * Fazer logout - remove cookie de autenticação
     */
    logout: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    /**
     * Obter dados do usuário autenticado
     */
    me: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data.data.user;
    },
};