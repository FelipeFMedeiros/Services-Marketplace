import { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Loader2 } from 'lucide-react';
import { bookingsApi, providersApi } from '../../../data/api';
import type { Service, ServiceVariation } from '../../../data/services';
import type { AvailableSlot } from '../../../data/providers';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service;
    variation: ServiceVariation;
    onSuccess?: () => void;
}

export function BookingModal({ isOpen, onClose, service, variation, onSuccess }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    // Buscar slots disponíveis quando o modal abrir
    useEffect(() => {
        const providerId = service.providerId || (service as Service & { provider_id?: number }).provider_id || service.provider?.id;
        
        console.log('🔍 BookingModal useEffect triggered:', {
            isOpen,
            service,
            providerId,
            provider: service.provider
        });
        
        if (isOpen && providerId) {
            loadAvailableSlots();
        } else if (isOpen) {
            console.warn('⚠️ Modal aberto mas providerId não encontrado!', {
                service,
                keys: Object.keys(service)
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const loadAvailableSlots = async () => {
        // Tentar obter provider ID de múltiplas fontes (compatibilidade snake_case/camelCase)
        const providerId = service.providerId || (service as Service & { provider_id?: number }).provider_id || service.provider?.id;
        
        if (!providerId) {
            console.warn('⚠️ Nenhum providerId encontrado:', service);
            setError('Informação do prestador não disponível');
            setLoadingSlots(false);
            return;
        }

        try {
            setLoadingSlots(true);
            setError(null);
            
            // Buscar slots dos próximos 3 meses (começar de hoje)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);

            console.log('🔍 Buscando slots disponíveis:', {
                providerId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                durationMinutes: variation.duration_minutes
            });

            const response = await providersApi.getAvailableSlots(
                providerId,
                {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    durationMinutes: variation.duration_minutes || undefined
                }
            );

            console.log('✅ Resposta do backend:', response);
            console.log(`📊 Total de slots encontrados: ${response.availableSlots.length}`);

            setAvailableSlots(response.availableSlots);
            
            // Extrair datas únicas
            const uniqueDates = [...new Set(
                response.availableSlots.map(slot => 
                    new Date(slot.start).toISOString().split('T')[0]
                )
            )];
            setAvailableDates(uniqueDates);

            console.log(`📅 Datas únicas disponíveis: ${uniqueDates.length}`, uniqueDates);

        } catch (err) {
            console.error('❌ Erro ao carregar slots:', err);
            const error = err as { response?: { data?: { error?: string } } };
            const errorMessage = error.response?.data?.error || 'Erro ao carregar horários disponíveis';
            setError(errorMessage);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!selectedDate || !selectedTime) {
            setError('Por favor, selecione data e horário');
            return;
        }

        try {
            setLoading(true);
            
            // Combinar data e hora no formato ISO 8601
            const startDatetime = `${selectedDate}T${selectedTime}:00`;

            console.log('📤 Criando booking:', {
                serviceId: service.id,
                variationId: variation.id,
                startDatetime
            });

            await bookingsApi.create({
                serviceId: service.id,
                variationId: variation.id,
                startDatetime
            });

            console.log('✅ Booking criado com sucesso!');
            setSuccess(true);
            
            // Aguardar 2 segundos e fechar
            setTimeout(() => {
                onSuccess?.();
                handleClose();
            }, 2000);

        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            const errorMessage = error.response?.data?.error || 'Erro ao criar agendamento';
            console.error('❌ Erro ao criar booking:', error);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedDate('');
        setSelectedTime('');
        setError(null);
        setSuccess(false);
        setAvailableSlots([]);
        setAvailableDates([]);
        onClose();
    };

    // Obter horários disponíveis para a data selecionada
    const getAvailableTimesForDate = (date: string) => {
        const serviceDuration = variation.duration_minutes;
        const times: Array<{
            value: string;
            label: string;
            slotData: AvailableSlot;
        }> = [];

        // Filtrar slots da data selecionada
        const slotsForDate = availableSlots.filter(
            slot => new Date(slot.start).toISOString().split('T')[0] === date
        );

        // Para cada slot disponível, gerar horários de início possíveis
        slotsForDate.forEach(slot => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            
            // Usar a duração do serviço como intervalo entre opções
            // Isso garante que não haja sobreposição de agendamentos
            const interval = serviceDuration;
            let currentTime = new Date(slotStart);

            while (currentTime < slotEnd) {
                // Verificar se cabe o serviço completo
                const serviceEndTime = new Date(currentTime.getTime() + serviceDuration * 60 * 1000);
                
                if (serviceEndTime <= slotEnd) {
                    // Verificar se é hoje e se o horário já passou
                    const now = new Date();
                    const isToday = currentTime.toDateString() === now.toDateString();
                    const isPast = isToday && currentTime < now;

                    if (!isPast) {
                        times.push({
                            value: currentTime.toTimeString().slice(0, 5), // HH:MM
                            label: currentTime.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            slotData: slot
                        });
                    }
                }

                // Avançar para o próximo horário (duração do serviço)
                currentTime = new Date(currentTime.getTime() + interval * 60 * 1000);
            }
        });

        // Remover duplicatas e ordenar
        const uniqueTimes = Array.from(
            new Map(times.map(t => [t.value, t])).values()
        );

        return uniqueTimes.sort((a, b) => a.value.localeCompare(b.value));
    };

    const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

    // Log para debug
    if (selectedDate && availableTimes.length > 0) {
        console.log(`⏰ Horários gerados para ${selectedDate}:`, {
            serviceName: variation.name,
            serviceDuration: variation.duration_minutes,
            intervalBetweenSlots: `${variation.duration_minutes} minutos (duração do serviço)`,
            totalOptions: availableTimes.length,
            firstTime: availableTimes[0]?.label,
            lastTime: availableTimes[availableTimes.length - 1]?.label,
            explanation: 'Cada horário é espaçado pela duração do serviço para evitar sobreposição'
        });
    }

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

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                {/* Modal */}
                <div 
                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            Agendar Serviço
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Service Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Serviço</div>
                                <div className="font-semibold text-gray-900">{service.name}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600 mb-1">Variação</div>
                                <div className="font-medium text-gray-900">{variation.name}</div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">
                                        {formatDuration(variation.duration_minutes)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-600" />
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatPrice(variation.price)}
                                    </span>
                                </div>
                            </div>

                            {service.provider && (
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="text-sm text-gray-600 mb-1">Prestador</div>
                                    <div className="font-medium text-gray-900">
                                        {service.provider.user?.name}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                                <div className="font-semibold mb-1">✓ Agendamento confirmado!</div>
                                <div className="text-sm">
                                    Você receberá uma notificação com os detalhes.
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                <div className="font-semibold mb-1">Erro</div>
                                <div className="text-sm">{error}</div>
                            </div>
                        )}

                        {/* Loading Slots */}
                        {loadingSlots && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                                <span className="text-gray-600">Carregando horários disponíveis...</span>
                            </div>
                        )}

                        {/* No Slots Available */}
                        {!loadingSlots && !success && availableSlots.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                                <div className="font-semibold mb-1">⚠️ Sem horários disponíveis</div>
                                <div className="text-sm">
                                    Este prestador não possui horários disponíveis
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        {!success && !loadingSlots && availableSlots.length > 0 && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Date Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Data Disponível
                                    </label>
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedTime(''); // Resetar horário ao trocar data
                                        }}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Selecione uma data</option>
                                        {availableDates.map(date => {
                                            const dateObj = new Date(date + 'T00:00:00');
                                            return (
                                                <option key={date} value={date}>
                                                    {dateObj.toLocaleDateString('pt-BR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {availableDates.length} {availableDates.length === 1 ? 'data disponível' : 'datas disponíveis'}
                                    </p>
                                </div>

                                {/* Time Picker */}
                                {selectedDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Horário Disponível
                                        </label>
                                        <select
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Selecione um horário</option>
                                            {availableTimes.map(time => (
                                                <option key={time.value} value={time.value}>
                                                    {time.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {availableTimes.length} {availableTimes.length === 1 ? 'horário disponível' : 'horários disponíveis'} nesta data
                                        </p>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-sm text-blue-800">
                                        <strong>Importante:</strong> O agendamento será confirmado automaticamente. 
                                        Você pode cancelar até 24h antes do horário agendado.
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors hover:cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Confirmando...
                                            </>
                                        ) : (
                                            'Confirmar Agendamento'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
