import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { servicesApi, type Service } from '../data/api';
import { ServiceCard } from '../components/features/Services/ServiceCard';
import { ServiceFilters, type FilterValues } from '../components/features/Services/ServiceFilters';

type ServiceWithPrice = Service & {
    priceRange?: {
        min: number;
        max: number;
    };
};

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceWithPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterValues>({});
    const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortBy, currentPage]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await servicesApi.getAll({
                ...filters,
                search: searchTerm || undefined,
                sortBy,
                page: currentPage,
                limit: 12
            });
            setServices(response.services);
            setPagination(response.pagination || null);
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadServices();
    };

    const handleFiltersChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-12">
                {/* Anterior */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Anterior
                </button>

                {/* Primeira página */}
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-2">...</span>}
                    </>
                )}

                {/* Páginas */}
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                            page === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Última página */}
                {endPage < pagination.totalPages && (
                    <>
                        {endPage < pagination.totalPages - 1 && <span className="px-2">...</span>}
                        <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {pagination.totalPages}
                        </button>
                    </>
                )}

                {/* Próxima */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Próxima
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Encontre o Serviço Ideal
                    </h1>

                    {/* Barra de Busca */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar serviços..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Buscar
                        </button>
                    </form>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-1 mb-8 lg:mb-0">
                        <ServiceFilters
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onClear={handleClearFilters}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-sm text-gray-600">
                                {pagination && (
                                    <span>
                                        Mostrando {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, pagination.total)} de {pagination.total} resultados
                                    </span>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Ordenar:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value as 'recent' | 'price_asc' | 'price_desc');
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="recent">Mais recentes</option>
                                    <option value="price_asc">Menor preço</option>
                                    <option value="price_desc">Maior preço</option>
                                </select>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && services.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Nenhum serviço encontrado
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Tente ajustar os filtros ou fazer uma nova busca
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        )}

                        {/* Services Grid */}
                        {!loading && services.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {services.map((service) => (
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {renderPagination()}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
