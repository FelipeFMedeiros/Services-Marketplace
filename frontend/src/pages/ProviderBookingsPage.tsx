import { useState, useEffect } from 'react';
import { Calendar, Loader2, Filter, Clock, DollarSign, User, Phone, Mail } from 'lucide-react';
import { providersApi } from '../data/api';
import type { Booking } from '../data/bookings';

export default function ProviderBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'>('ALL');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const params = filterStatus !== 'ALL' ? { status: filterStatus } : {};
            const response = await providersApi.getBookings(params);
            setBookings(response.data.bookings);
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: number, reason: string) => {
        try {
            setProcessingId(bookingId);
            await providersApi.cancelBooking(bookingId, reason);
            await loadBookings();
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            alert('Erro ao cancelar agendamento. Tente novamente.');
        } finally {
            setProcessingId(null);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Agendamentos Recebidos
                        </h1>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <Filter className="w-5 h-5 text-gray-500 shrink-0" />
                        
                        <button
                            onClick={() => setFilterStatus('ALL')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                filterStatus === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos
                        </button>

                        <button
                            onClick={() => setFilterStatus('PENDING')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                filterStatus === 'PENDING'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pendentes
                        </button>

                        <button
                            onClick={() => setFilterStatus('APPROVED')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                filterStatus === 'APPROVED'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Confirmados
                        </button>

                        <button
                            onClick={() => setFilterStatus('COMPLETED')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                filterStatus === 'COMPLETED'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Concluídos
                        </button>

                        <button
                            onClick={() => setFilterStatus('CANCELLED')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                filterStatus === 'CANCELLED'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Cancelados
                        </button>
                    </div>
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
                {!loading && bookings.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhum agendamento encontrado
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filterStatus === 'ALL' 
                                ? 'Você ainda não recebeu nenhum agendamento.'
                                : `Você não possui agendamentos com o status "${getStatusText(filterStatus)}".`
                            }
                        </p>
                        {filterStatus !== 'ALL' && (
                            <button
                                onClick={() => setFilterStatus('ALL')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Ver Todos
                            </button>
                        )}
                    </div>
                )}

                {/* Bookings Grid */}
                {!loading && bookings.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <BookingProviderCard 
                                key={booking.id} 
                                booking={booking}
                                onCancel={handleCancelBooking}
                                formatDate={formatDate}
                                formatPrice={formatPrice}
                                formatDuration={formatDuration}
                                getStatusColor={getStatusColor}
                                getStatusText={getStatusText}
                                processing={processingId === booking.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== BOOKING CARD COMPONENT =====

interface BookingProviderCardProps {
    booking: Booking;
    onCancel: (bookingId: number, reason: string) => Promise<void>;
    formatDate: (date: string | undefined) => string;
    formatPrice: (price: number) => number | string;
    formatDuration: (minutes: number) => string;
    getStatusColor: (status: string) => string;
    getStatusText: (status: string) => string;
    processing: boolean;
}

function BookingProviderCard({
    booking,
    onCancel,
    formatDate,
    formatPrice,
    formatDuration,
    getStatusColor,
    getStatusText,
    processing
}: BookingProviderCardProps) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            alert('Por favor, informe o motivo do cancelamento.');
            return;
        }
        
        await onCancel(booking.id, cancelReason);
        setShowCancelModal(false);
        setCancelReason('');
    };

    const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';

    return (
        <>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {(booking.service as any)?.title || booking.service?.name || 'Serviço'}
                        </h3>
                        {(booking.serviceVariation || (booking as any).service_variation) && (
                            <div className="text-sm text-gray-600">
                                {(booking.serviceVariation || (booking as any).service_variation)?.name}
                            </div>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                    </div>
                </div>

                {/* Client Info */}
                {booking.client && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                                {booking.client.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                    {booking.client.name}
                                </div>
                                <div className="text-xs text-gray-500">Cliente</div>
                            </div>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="space-y-2">
                            {booking.client.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{booking.client.phone}</span>
                                </div>
                            )}
                            {booking.client.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{booking.client.email}</span>
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
                                {formatDate(booking.startDatetime || (booking as any).start_datetime)}
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    {(booking.serviceVariation || (booking as any).service_variation)?.duration_minutes && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Duração</div>
                                <div className="font-medium">
                                    {formatDuration((booking.serviceVariation || (booking as any).service_variation)!.duration_minutes)}
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
                                {formatPrice(booking.priceAtBooking || (booking as any).price_at_booking || 0)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancellation Reason */}
                {booking.status === 'CANCELLED' && (booking.cancellationReason || (booking as any).cancellation_reason) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="text-sm font-medium text-red-900 mb-1">
                            Motivo do cancelamento:
                        </div>
                        <p className="text-sm text-red-700">
                            {booking.cancellationReason || (booking as any).cancellation_reason}
                        </p>
                    </div>
                )}

                {/* Actions */}
                {canCancel && (
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={processing}
                            className="w-full px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? 'Cancelando...' : 'Cancelar Agendamento'}
                        </button>
                    </div>
                )}
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
                                <User className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Tem certeza que deseja cancelar este agendamento?
                            O cliente será notificado sobre o cancelamento.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo do cancelamento (obrigatório)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ex: Imprevisto, indisponibilidade..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={processing}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {processing ? (
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
        </>
    );
}
