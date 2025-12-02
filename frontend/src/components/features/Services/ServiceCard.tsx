import { Link } from 'react-router';
import { MapPin, Star } from 'lucide-react';
import type { Service } from '../../../data/services';

interface ServiceCardProps {
    service: Service & {
        priceRange?: {
            min: number;
            max: number;
        };
        averageRating?: number;
    };
}

export function ServiceCard({ service }: ServiceCardProps) {
    // Pegar foto de capa ou primeira foto
    const coverPhoto = service.photos?.find(p => p.isCover)?.url || service.photos?.[0]?.url;

    // Formatar preço
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    // Calcular preço a partir das variações
    const getPriceDisplay = () => {
        if (service.priceRange) {
            const { min, max } = service.priceRange;
            if (min === max) {
                return formatPrice(min);
            }
            return `${formatPrice(min)} - ${formatPrice(max)}`;
        }
        
        if (service.variations && service.variations.length > 0) {
            const prices = service.variations.map(v => v.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            
            if (min === max) {
                return formatPrice(min);
            }
            return `${formatPrice(min)} - ${formatPrice(max)}`;
        }

        return 'Preço sob consulta';
    };

    return (
        <Link to={`/services/${service.id}`} className="group block">
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative z-0">
                {/* Imagem */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {coverPhoto ? (
                        <img
                            src={coverPhoto}
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-200">
                            <span className="text-4xl text-blue-400">📋</span>
                        </div>
                    )}
                    
                    {/* Badge de tipo de serviço */}
                    {service.serviceType && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                            {service.serviceType.name}
                        </div>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                    {/* Título */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {service.name}
                    </h3>

                    {/* Descrição */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                    </p>

                    {/* Provider e Localização */}
                    {service.provider && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                            <span className="font-medium">{service.provider.user?.name}</span>
                            {(service.provider.city || service.provider.state) && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>
                                            {[service.provider.city, service.provider.state]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Rating e Preço */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">
                                {service.averageRating ? service.averageRating.toFixed(1) : '5.0'}
                            </span>
                            {service._count?.reviews !== undefined && (
                                <span className="text-xs text-gray-500">
                                    ({service._count.reviews})
                                </span>
                            )}
                        </div>

                        {/* Preço */}
                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                                {getPriceDisplay()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
