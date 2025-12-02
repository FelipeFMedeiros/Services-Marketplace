import { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Star, X, Loader2 } from 'lucide-react';
import { bookingsApi } from '../../../data/api';
import type { Booking } from '../../../data/bookings';
import { ReviewModal } from './ReviewModal';

interface BookingCardProps {
    booking: Booking;
    onUpdate?: () => void;
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Data inválida';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}min`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Pendente';
            case 'APPROVED':
                return 'Confirmado';
            case 'COMPLETED':
                return 'Concluído';
            case 'CANCELLED':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';
    const canReview = booking.status === 'COMPLETED' && !booking.review;

    const handleCancel = async () => {
        try {
            setCancelling(true);
            await bookingsApi.cancel(booking.id, cancelReason || undefined);
            setShowCancelModal(false);
            onUpdate?.();
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            alert('Erro ao cancelar agendamento. Tente novamente.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.service?.name || 'Serviço'}
                        </h3>
                        {booking.serviceVariation && (
                            <div className="text-sm text-gray-600">
                                {booking.serviceVariation.name}
                            </div>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                    </div>
                </div>

                {/* Provider Info */}
                {booking.provider && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {booking.provider.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">
                                {booking.provider.user?.name}
                            </div>
                            {(booking.provider.city || booking.provider.state) && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    <span>
                                        {[booking.provider.city, booking.provider.state]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Booking Details */}
                <div className="space-y-3 mb-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <div className="text-sm text-gray-600">Data e Horário</div>
                            <div className="font-medium">
                                {formatDate(booking.startDatetime || booking.start_datetime)}
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    {(booking.serviceVariation || booking.service_variation)?.duration_minutes && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Duração</div>
                                <div className="font-medium">
                                    {formatDuration((booking.serviceVariation || booking.service_variation)!.duration_minutes)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-3 text-gray-700">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                            <div className="text-sm text-gray-600">Valor</div>
                            <div className="font-bold text-blue-600">
                                {formatPrice(booking.priceAtBooking || booking.price_at_booking || 0)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Info */}
                {booking.review && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">
                                Você avaliou: {booking.review.rating}/5
                            </span>
                        </div>
                        {booking.review.comment && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {booking.review.comment}
                            </p>
                        )}
                    </div>
                )}

                {/* Cancellation Reason */}
                {booking.status === 'CANCELLED' && (booking.cancellationReason || booking.cancellation_reason) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="text-sm font-medium text-red-900 mb-1">
                            Motivo do cancelamento:
                        </div>
                        <p className="text-sm text-red-700">
                            {booking.cancellationReason || booking.cancellation_reason}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {canCancel && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex-1 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Cancelar Agendamento
                        </button>
                    )}
                    
                    {canReview && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Avaliar Serviço
                        </button>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCancelModal(false)}
                >
                    <div 
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                Cancelar Agendamento
                            </h3>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Tem certeza que deseja cancelar este agendamento?
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo do cancelamento (opcional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ex: Imprevisto, mudança de planos..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Cancelando...
                                    </>
                                ) : (
                                    'Confirmar Cancelamento'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                bookingId={booking.id}
                serviceTitle={booking.service?.title || booking.service?.name || 'Serviço'}
                onSuccess={() => {
                    setShowReviewModal(false);
                    onUpdate?.();
                }}
            />
        </>
    );
}
