import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Overlay de loading que aparece durante transições de rota
 * Mostra um spinner animado com fundo semi-transparente
 */
export function RouteLoadingOverlay() {
    const { pathname } = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Inicia o loading de forma assíncrona
        const startTimeout = setTimeout(() => {
            setIsLoading(true);
        }, 0);

        // Define um tempo mínimo de loading para suavizar a transição
        const minLoadingTime = 300; // 300ms - ajuste conforme preferir
        const endTimeout = setTimeout(() => {
            setIsLoading(false);
        }, minLoadingTime);

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(endTimeout);
        };
    }, [pathname]);

    if (!isLoading) return null;

    return (
        <div 
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: isLoading ? 1 : 0 }}
        >
            <div className="flex flex-col items-center gap-3">
                {/* Spinner animado */}
                <Loader2 
                    className="w-12 h-12 text-blue-600 animate-spin" 
                    strokeWidth={2.5}
                />
                
                {/* Texto opcional */}
                <p className="text-sm text-gray-600 font-medium">
                    Carregando...
                </p>
            </div>
        </div>
    );
}
