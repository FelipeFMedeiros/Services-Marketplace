import { useEffect, useState } from 'react';
import { Filter, X, MapPin, DollarSign, SlidersHorizontal } from 'lucide-react';
import { serviceTypesApi, type ServiceType } from '../../../data/api';

export interface FilterValues {
    serviceTypeId?: number;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

interface ServiceFiltersProps {
    filters: FilterValues;
    onFiltersChange: (filters: FilterValues) => void;
    onClear: () => void;
}

const ESTADOS_BRASIL = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function ServiceFilters({ filters, onFiltersChange, onClear }: ServiceFiltersProps) {
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

    const loadServiceTypes = async () => {
        try {
            const response = await serviceTypesApi.getAll();
            setServiceTypes(response.data.serviceTypes || []);
        } catch (error) {
            console.error('Erro ao carregar tipos de serviço:', error);
            setServiceTypes([]); // Define array vazio em caso de erro
        }
    };

    useEffect(() => {
        loadServiceTypes();
    }, []);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof FilterValues, value: string | number | undefined) => {
        const newFilters = { ...localFilters, [key]: value || undefined };
        setLocalFilters(newFilters);
    };

    const handleApply = () => {
        onFiltersChange(localFilters);
        setIsOpen(false);
    };

    const handleClear = () => {
        setLocalFilters({});
        onClear();
        setIsOpen(false);
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

    return (
        <>
            {/* Overlay Mobile - FORA do container principal */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-50"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="relative">
                {/* Botão Mobile */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {/* Container Desktop */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-4">
                        <SlidersHorizontal className="w-5 h-5 text-gray-700" />
                        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    </div>

                    {/* Filters Content Desktop */}
                    <div className="space-y-6">
                        {/* Tipo de Serviço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Serviço
                            </label>
                            <select
                                value={localFilters.serviceTypeId || ''}
                                onChange={(e) => handleFilterChange('serviceTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos os tipos</option>
                                {serviceTypes?.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Localização */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Localização
                            </label>
                            <div className="space-y-3">
                                {/* Estado */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Estado</label>
                                    <select
                                        value={localFilters.state || ''}
                                        onChange={(e) => handleFilterChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos os estados</option>
                                        {ESTADOS_BRASIL.map((estado) => (
                                            <option key={estado} value={estado}>
                                                {estado}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cidade */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Cidade</label>
                                    <input
                                        type="text"
                                        value={localFilters.city || ''}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        placeholder="Digite a cidade"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Faixa de Preço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Faixa de Preço
                            </label>
                            <div className="space-y-3">
                                {/* Preço Mínimo */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                                    <input
                                        type="number"
                                        value={localFilters.minPrice || ''}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="R$ 0,00"
                                        min="0"
                                        step="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Preço Máximo */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                                    <input
                                        type="number"
                                        value={localFilters.maxPrice || ''}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="R$ 10.000,00"
                                        min="0"
                                        step="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions Desktop */}
                    <div className="flex flex-col gap-2 mt-6">
                        <button
                            onClick={handleClear}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Limpar Filtros
                        </button>
                        <button
                            onClick={handleApply}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>

                {/* Sidebar Mobile */}
                <div className={`
                    lg:hidden fixed inset-y-0 left-0 z-60 w-80 bg-white
                    transform transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    shadow-xl overflow-y-auto
                `}>
                    {/* Header Mobile */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-semibold">Filtros</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filters Content Mobile */}
                    <div className="p-4 space-y-6 pb-24">
                        {/* Tipo de Serviço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Serviço
                            </label>
                            <select
                                value={localFilters.serviceTypeId || ''}
                                onChange={(e) => handleFilterChange('serviceTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos os tipos</option>
                                {serviceTypes?.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Localização */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Localização
                            </label>
                            <div className="space-y-3">
                                {/* Estado */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Estado</label>
                                    <select
                                        value={localFilters.state || ''}
                                        onChange={(e) => handleFilterChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos os estados</option>
                                        {ESTADOS_BRASIL.map((estado) => (
                                            <option key={estado} value={estado}>
                                                {estado}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cidade */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Cidade</label>
                                    <input
                                        type="text"
                                        value={localFilters.city || ''}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        placeholder="Digite a cidade"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Faixa de Preço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Faixa de Preço
                            </label>
                            <div className="space-y-3">
                                {/* Preço Mínimo */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                                    <input
                                        type="number"
                                        value={localFilters.minPrice || ''}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="R$ 0,00"
                                        min="0"
                                        step="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Preço Máximo */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                                    <input
                                        type="number"
                                        value={localFilters.maxPrice || ''}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="R$ 10.000,00"
                                        min="0"
                                        step="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions Mobile - Fixed */}
                    <div className="fixed bottom-0 left-0 w-80 p-4 bg-white border-t border-gray-200 flex gap-3 z-10">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
