import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function Header() {
    const { user, isAuthenticated, isProvider, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        <Lightbulb className="w-8 h-8" />
                        Services Marketplace
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-6">
                        {/* Link para buscar serviços */}
                        <Link 
                            to="/services" 
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Buscar Serviços
                        </Link>

                        {/* Authenticated User */}
                        {isAuthenticated && user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors hover:cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {user.role === 'CLIENT' ? 'Cliente' : 'Prestador'}
                                        </p>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setShowDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                            {/* Dashboard - apenas para providers */}
                                            {isProvider && (
                                                <Link
                                                    to="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <LayoutDashboard size={18} />
                                                    Dashboard
                                                </Link>
                                            )}

                                            {/* Meus Agendamentos */}
                                            <Link
                                                to="/bookings"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <User size={18} />
                                                {user.role === 'CLIENT' ? 'Meus Agendamentos' : 'Agendamentos'}
                                            </Link>

                                            {/* Perfil */}
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <Settings size={18} />
                                                Configurações
                                            </Link>

                                            <hr className="my-2" />

                                            {/* Logout */}
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    handleLogout();
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left hover:cursor-pointer"
                                            >
                                                <LogOut size={18} />
                                                Sair
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Guest User */
                            <div className="flex items-center gap-4">
                                <Link 
                                    to="/login" 
                                    className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Cadastrar-se
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
