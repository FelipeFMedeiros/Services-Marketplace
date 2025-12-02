import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que rola a página para o topo sempre que a rota muda
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Use 'smooth' para scroll suave
        });
    }, [pathname]);

    return null;
}
