import { Star, User } from 'lucide-react';
import type { Review } from '../../../data/reviews';

interface ServiceReviewsProps {
    reviews: Review[];
    averageRating?: number;
}

export function ServiceReviews({ reviews, averageRating }: ServiceReviewsProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const calculateRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            distribution[review.rating as keyof typeof distribution]++;
        });
        return distribution;
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Ainda não há avaliações
                </h3>
                <p className="text-gray-600">
                    Seja o primeiro a avaliar este serviço após contratá-lo!
                </p>
            </div>
        );
    }

    const distribution = calculateRatingDistribution();
    const totalReviews = reviews.length;

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Avaliações dos Clientes
                </h2>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Overall Rating */}
                    <div className="text-center md:border-r border-gray-200 pb-6 md:pb-0">
                        <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                            {averageRating ? averageRating.toFixed(1) : '5.0'}
                        </div>
                        {renderStars(Math.round(averageRating || 5))}
                        <p className="text-gray-600 mt-2">
                            Baseado em {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = distribution[rating as keyof typeof distribution];
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-20">
                                        <span className="text-sm font-medium text-gray-700">
                                            {rating}
                                        </span>
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-yellow-400 h-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                                    {review.client?.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                                </div>
                                
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {review.client?.name || 'Cliente'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            {renderStars(review.rating)}
                        </div>

                        {/* Comment */}
                        {review.comment && (
                            <p className="text-gray-700 leading-relaxed">
                                {review.comment}
                            </p>
                        )}

                        {/* Response (if exists) */}
                        {review.response && (
                            <div className="mt-4 pl-3 sm:pl-4 border-l-2 border-blue-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                        P
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        Resposta do Prestador
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {review.response}
                                </p>
                                {review.respondedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(review.respondedAt)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
