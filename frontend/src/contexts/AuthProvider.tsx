import { useState, useEffect, type ReactNode } from 'react';
import { authApi, type User } from '@/data/api';
import { AuthContext } from './AuthContext';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isClient: boolean;
    isProvider: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Verificar se o usuário está autenticado ao carregar a página
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await authApi.me();
            setUser(user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const user = await authApi.login({ email, password });
        setUser(user);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isClient: user?.role === 'CLIENT',
        isProvider: user?.role === 'PROVIDER',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
