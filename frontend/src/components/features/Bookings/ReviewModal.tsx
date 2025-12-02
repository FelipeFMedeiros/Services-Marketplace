import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { reviewsApi, type CreateReviewRequest } from '../../../data/reviews';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number;
    serviceTitle: string;
    onSuccess: () => void;
}

export function ReviewModal({ isOpen, onClose, bookingId, serviceTitle, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Por favor, selecione uma avaliação');
            return;
        }

        if (comment.length > 0 && comment.length < 10) {
            setError('O comentário deve ter pelo menos 10 caracteres');
            return;
        }

        if (comment.length > 500) {
            setError('O comentário não pode ter mais de 500 caracteres');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data: CreateReviewRequest = {
                bookingId,
                rating,
                ...(comment.trim() && { comment: comment.trim() })
            };

            await reviewsApi.create(data);
            onSuccess();
            handleClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Erro ao enviar avaliação');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setHoveredRating(0);
        setComment('');
        setError(null);
        onClose();
    };

    const renderStars = () => {
        return Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= (hoveredRating || rating);
            
            return (
                <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`w-10 h-10 ${
                            isFilled 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Avaliar Serviço
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Service Title */}
                    <div className="mb-6 text-center">
                        <p className="text-gray-600 mb-2">Como foi sua experiência com:</p>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {serviceTitle}
                        </h3>
                    </div>

                    {/* Rating Stars */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Sua Avaliação *
                        </label>
                        <div className="flex items-center justify-center gap-2">
                            {renderStars()}
                        </div>
                        {rating > 0 && (
                            <p className="text-center mt-2 text-sm text-gray-600">
                                {rating === 1 && 'Muito Ruim'}
                                {rating === 2 && 'Ruim'}
                                {rating === 3 && 'Regular'}
                                {rating === 4 && 'Bom'}
                                {rating === 5 && 'Excelente'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Comentário (opcional)
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte-nos sobre sua experiência... (mínimo 10 caracteres)"
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={loading}
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">
                                {comment.length > 0 && comment.length < 10 && (
                                    <span className="text-red-500">
                                        Mínimo 10 caracteres
                                    </span>
                                )}
                            </span>
                            <span className="text-xs text-gray-500">
                                {comment.length}/500
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading || rating === 0}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Avaliação'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
