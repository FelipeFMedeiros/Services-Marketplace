import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RouteLoadingOverlay } from '@/components/layout/RouteLoadingOverlay';
import { ScrollToTop } from '@/hooks/ScrollToTop';
import { Header } from '@/components/layout/Header';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import HomePage from '@/pages/HomePage';
import BookingsPage from '@/pages/BookingsPage';
import ServicesPage from '@/pages/ServicesPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import MyReviewsPage from '@/pages/MyReviewsPage';
import ProviderBookingsPage from '@/pages/ProviderBookingsPage';

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
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/services/:id" element={<ServiceDetailPage />} />

                        {/* Rota Protegida - Exemplo */}
                        <Route 
                            path="/bookings" 
                            element={
                                <ProtectedRoute>
                                    <BookingsPage />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Rotas do Cliente (CLIENT) */}
                        <Route 
                            path="/my-bookings" 
                            element={
                                <ProtectedRoute requireRole="CLIENT">
                                    <MyBookingsPage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/my-reviews" 
                            element={
                                <ProtectedRoute requireRole="CLIENT">
                                    <MyReviewsPage />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Rotas do Cliente (CLIENT) */}
                        <Route 
                            path="/my-bookings-provider" 
                            element={
                                <ProtectedRoute requireRole="PROVIDER">
                                    <ProviderBookingsPage />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
