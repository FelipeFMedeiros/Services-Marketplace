import { useState, useEffect } from 'react';
import { Star, Loader2, MessageSquare, Calendar, MapPin } from 'lucide-react';
import { reviewsApi, type Review } from '../data/reviews';
import { Link } from 'react-router-dom';

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsApi.getMy();
            setReviews(response.reviews);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Data inválida';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-5 h-5 ${
                    i < rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Minhas Avaliações
                        </h1>
                    </div>
                    <p className="mt-2 text-gray-600">
                        Veja todas as avaliações que você fez sobre os serviços contratados
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && reviews.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">⭐</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhuma avaliação ainda
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Você ainda não avaliou nenhum serviço. Complete um agendamento para poder avaliar!
                        </p>
                        <Link
                            to="/my-bookings"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ver Meus Agendamentos
                        </Link>
                    </div>
                )}

                {/* Reviews List */}
                {!loading && reviews.length > 0 && (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div 
                                key={review.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    {/* Service Info */}
                                    <div className="flex-1">
                                        {(review.booking?.service || review.service) && (
                                            <Link
                                                to={`/services/${(review.booking?.service || review.service)?.id}`}
                                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                            >
                                                {(review.booking?.service || review.service)?.title || (review.booking?.service || review.service)?.name}
                                            </Link>
                                        )}
                                        
                                        {(review.booking?.service?.provider || review.service?.provider) && (
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>
                                                    {(review.booking?.service?.provider || review.service?.provider)?.name || 
                                                     (review.booking?.service?.provider || review.service?.provider)?.user?.name}
                                                </span>
                                                {(review.booking?.service?.provider || review.service?.provider)?.city && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {(review.booking?.service?.provider || review.service?.provider)?.city}, {(review.booking?.service?.provider || review.service?.provider)?.state}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(review.createdAt || review.created_at)}</span>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex gap-1">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {review.rating}.0
                                    </span>
                                </div>

                                {/* Comment */}
                                {review.comment && (
                                    <div className="mb-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                )}

                                {/* Provider Response */}
                                {review.response && (
                                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-blue-900">
                                                Resposta do Prestador
                                            </span>
                                            {(review.respondedAt || review.responded_at) && (
                                                <span className="text-xs text-blue-600">
                                                    • {formatDate((review.respondedAt || review.responded_at) || undefined)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            {review.response}
                                        </p>
                                    </div>
                                )}

                                {/* Booking Info */}
                                {review.booking && (review.booking.startDatetime || review.booking.start_datetime) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="font-medium">Agendamento:</span>
                                            <span>
                                                {new Date(review.booking.startDatetime || review.booking.start_datetime || '').toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
