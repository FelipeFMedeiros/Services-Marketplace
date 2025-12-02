import { useState, useEffect } from 'react';
import { Calendar, Loader2, Filter } from 'lucide-react';
import { bookingsApi, type Booking, type BookingStatus } from '../data/api';
import { BookingCard } from '../components/features/Bookings/BookingCard';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');

    const loadBookings = async () => {
        try {
            setLoading(true);
            const params = filterStatus !== 'ALL' ? { status: filterStatus } : {};
            const response = await bookingsApi.getMy(params);
            setBookings(response.bookings);
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Meus Agendamentos
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
                                ? 'Você ainda não fez nenhum agendamento.'
                                : `Você não possui agendamentos com o status "${filterStatus}".`
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <BookingCard 
                                key={booking.id} 
                                booking={booking}
                                onUpdate={loadBookings}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
