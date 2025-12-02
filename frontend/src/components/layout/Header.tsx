import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, LogOut, User, Settings, LayoutDashboard, Menu, X, NotepadText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export function Header() {
    const { user, isAuthenticated, isProvider, isClient, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Fecha menu mobile quando redimensiona para desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowMobileMenu(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Previne scroll quando mobile menu está aberto
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showMobileMenu]);

    const handleLogout = async () => {
        try {
            await logout();
            setShowMobileMenu(false);
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-lg md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        onClick={closeMobileMenu}
                    >
                        <Lightbulb className="w-6 h-6 md:w-8 md:h-8" />
                        Services Marketplace
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
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
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
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

                                            {isClient && (
                                                <Link
                                                    to="/reviews"
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    onClick={closeMobileMenu}
                                                >
                                                    <NotepadText size={20} />
                                                    Minhas Avaliações
                                                </Link>
                                            )}

                                            {/* Perfil */}
                                            {isProvider && (
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <Settings size={18} />
                                                    Configurações
                                                </Link>
                                            )}

                                            <hr className="my-2" />

                                            {/* Logout */}
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    handleLogout();
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <LogOut size={18} />
                                                Sair
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Guest User - Desktop */
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

                    {/* Mobile Menu Button & Quick Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Hamburguer Menu */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                            aria-label="Menu"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200"
                        onClick={closeMobileMenu}
                    />

                    {/* Mobile Menu Panel */}
                    <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl md:hidden overflow-y-auto transform transition-transform duration-300 ease-out">
                        {/* Close Button - Top Right */}
                        <div className="sticky top-0 bg-white z-10 flex justify-end p-4 border-b border-gray-200">
                            <button
                                onClick={closeMobileMenu}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                                aria-label="Fechar menu"
                            >
                                <span className="text-gray-600 font-medium">Fechar</span>
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info - Mobile */}
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {user.role === 'CLIENT' ? 'Cliente' : 'Prestador'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Navigation Links - Authenticated */}
                                    <nav className="space-y-1">
                                        {isProvider && (
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <LayoutDashboard size={20} />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                        )}
                                        {/* Página de Serviços - apenas para clients */}
                                        {isClient && (
                                            <Link
                                                to="/services"
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <NotepadText size={20} />
                                                <span className="font-medium">Contratar Serviço</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/bookings"
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            <User size={20} />
                                            <span className="font-medium">
                                                {user.role === 'CLIENT' ? 'Meus Agendamentos' : 'Agendamentos'}
                                            </span>
                                        </Link>

                                        {isProvider && (
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <Settings size={20} />
                                                <span className="font-medium">Configurações</span>
                                            </Link>
                                        )}

                                        {isClient && (
                                            <Link
                                                to="/reviews"
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <NotepadText size={20} />
                                                <span className="font-medium">Minhas Avaliações</span>
                                            </Link>
                                        )}
                                    </nav>

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full mt-4"
                                    >
                                        <LogOut size={20} />
                                        <span className="font-medium">Sair</span>
                                    </button>
                                </>
                            ) : (
                                /* Guest User - Mobile */
                                <div className="space-y-3">
                                    <Link
                                        to="/login"
                                        className="block w-full px-6 py-3 text-center text-blue-600 font-semibold border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block w-full px-6 py-3 text-center bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        Cadastrar-se
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
