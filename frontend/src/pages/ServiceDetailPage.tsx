import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, MapPin, Clock, Star, Calendar, Loader2 } from 'lucide-react';
import { servicesApi, reviewsApi, type Service, type Review } from '../data/api';
import { ServiceGallery } from '../components/features/Services/ServiceGallery';
import { ServiceReviews } from '../components/features/Services/ServiceReviews';
import { useAuth } from '../hooks/useAuth';

type ServiceWithDetails = Service & {
    priceRange?: {
        min: number;
        max: number;
    };
    averageRating?: number;
};

export default function ServiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [service, setService] = useState<ServiceWithDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            loadServiceDetails();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadServiceDetails = async () => {
        try {
            setLoading(true);
            const serviceId = parseInt(id!);

            // Carregar serviço e reviews em paralelo
            const [serviceResponse, reviewsResponse] = await Promise.all([
                servicesApi.getById(serviceId),
                reviewsApi.getServiceReviews(serviceId)
            ]);

            // A API pode retornar { service: {...} } ou o serviço diretamente
            const serviceData = serviceResponse;
            
            if (serviceData) {
                setService(serviceData as ServiceWithDetails);
                
                // Selecionar primeira variação por padrão
                if (serviceData.variations && serviceData.variations.length > 0) {
                    setSelectedVariation(serviceData.variations[0].id);
                }
            }

            // Reviews pode retornar { reviews: [...] } ou array diretamente
            const reviewsData = reviewsResponse;
            if (reviewsData && Array.isArray(reviewsData)) {
                setReviews(reviewsData);
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do serviço:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}min`;
    };

    const handleBooking = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/services/${id}` } });
            return;
        }

        // TODO: Implementar fluxo de agendamento
        console.log('Iniciar agendamento', { serviceId: id, variationId: selectedVariation });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Serviço não encontrado
                    </h2>
                    <Link
                        to="/services"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Voltar para serviços
                    </Link>
                </div>
            </div>
        );
    }

    const selectedVariationData = service.variations?.find(v => v.id === selectedVariation);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/services')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar para serviços</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Gallery & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Gallery */}
                        <ServiceGallery photos={service.photos || []} serviceName={service.name} />

                        {/* Service Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            {/* Badge */}
                            {service.serviceType && (
                                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
                                    {service.serviceType.name}
                                </div>
                            )}

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {service.name}
                            </h1>

                            {/* Rating & Reviews */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">
                                        {service.averageRating ? service.averageRating.toFixed(1) : '5.0'}
                                    </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">
                                    {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                                </span>
                                {service._count?.bookings !== undefined && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-600">
                                            {service._count.bookings} {service._count.bookings === 1 ? 'contratação' : 'contratações'}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <div className="prose max-w-none">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                    Sobre o Serviço
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            {/* Provider Info */}
                            {service.provider && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Prestador
                                    </h3>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            {service.provider.user?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                                {service.provider.user?.name}
                                            </div>
                                            {service.provider.bio && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {service.provider.bio}
                                                </p>
                                            )}
                                            {(service.provider.city || service.provider.state) && (
                                                <div className="flex items-center gap-1 mt-2 text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {[service.provider.city, service.provider.state]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <ServiceReviews reviews={reviews} averageRating={service.averageRating} />
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                Agendar Serviço
                            </h2>

                            {/* Variations */}
                            {service.variations && service.variations.length > 0 ? (
                                <div className="space-y-4 mb-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Escolha uma opção:
                                    </label>
                                    <div className="space-y-2">
                                        {service.variations.map((variation) => (
                                            <button
                                                key={variation.id}
                                                onClick={() => setSelectedVariation(variation.id)}
                                                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                                                    selectedVariation === variation.id
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">
                                                            {variation.name}
                                                        </div>
                                                        {variation.description && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {variation.description}
                                                            </p>
                                                        )}
                                                        {variation.duration && (
                                                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                                                <Clock className="w-4 h-4" />
                                                                <span>{formatDuration(variation.duration)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="font-bold text-blue-600">
                                                        {formatPrice(variation.price)}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <div className="text-gray-600 text-sm mb-2">Preço</div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        Sob consulta
                                    </div>
                                </div>
                            )}

                            {/* Selected Price */}
                            {selectedVariationData && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {formatPrice(selectedVariationData.price)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Booking Button */}
                            <button
                                onClick={handleBooking}
                                disabled={!selectedVariation && service.variations && service.variations.length > 0}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>
                                    {isAuthenticated ? 'Continuar Agendamento' : 'Fazer Login para Agendar'}
                                </span>
                            </button>

                            {!isAuthenticated && (
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Você precisa estar logado para agendar este serviço
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
