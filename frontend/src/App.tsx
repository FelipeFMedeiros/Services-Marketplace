import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RouteLoadingOverlay } from '@/components/RouteLoadingOverlay';
import { ScrollToTop } from '@/hooks/ScrollToTop';
import { Header } from '@/components/Header';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import HomePage from '@/pages/HomePage';
import BookingsPage from '@/pages/BookingsPage';

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <RouteLoadingOverlay />
            <AuthProvider>
                <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
                    {/* Header com autenticação */}
                    <Header />

                    {/* Routes */}
                    <Routes>
                        {/* Rotas Públicas */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Rota Protegida - Exemplo */}
                        <Route 
                            path="/bookings" 
                            element={
                                <ProtectedRoute>
                                    <BookingsPage />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Rotas para implementar depois:
                        <Route path="/services" element={<ServicesPage />} /> // Pública
                        <Route path="/services/:id" element={<ServiceDetailPage />} /> // Pública
                        
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute requireRole="PROVIDER">
                                    <ProviderDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            } 
                        />
                        */}
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
