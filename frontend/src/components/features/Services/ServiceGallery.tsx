import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ServicePhoto } from '../../../data/services';

interface ServiceGalleryProps {
    photos: ServicePhoto[];
    serviceName: string;
}

export function ServiceGallery({ photos, serviceName }: ServiceGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        setIsLightboxOpen(true);
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        
        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // Minimum swipe distance in pixels

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe left - next image
                handleNext();
            } else {
                // Swipe right - previous image
                handlePrevious();
            }
        }

        // Reset
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!isLightboxOpen) return;

        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsLightboxOpen(false);
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLightboxOpen]);

    if (!photos || photos.length === 0) {
        return (
            <div className="w-full aspect-video bg-linear-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <span className="text-6xl">📋</span>
            </div>
        );
    }

    const currentPhoto = photos[selectedIndex];

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-4">
                {/* Main Image */}
                <div 
                    className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden group touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={currentPhoto.url}
                        alt={`${serviceName} - Foto ${selectedIndex + 1}`}
                        className="w-full h-full object-contain cursor-pointer select-none"
                        onClick={() => openLightbox(selectedIndex)}
                        draggable={false}
                    />

                    {/* Navigation Arrows (only desktop and if multiple photos) */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white items-center justify-center z-10"
                                aria-label="Foto anterior"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-800" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white items-center justify-center z-10"
                                aria-label="Próxima foto"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-800" />
                            </button>
                        </>
                    )}

                    {/* Photo Counter */}
                    {photos.length > 1 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                            {selectedIndex + 1} / {photos.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {photos.map((photo, index) => (
                            <button
                                key={photo.id}
                                onClick={() => setSelectedIndex(index)}
                                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                                    index === selectedIndex
                                        ? 'ring-2 ring-blue-600 ring-offset-2'
                                        : 'opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={photo.url}
                                    alt={`Miniatura ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {photo.isCover && (
                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                                        Capa
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center"
                    style={{ height: '100dvh' }}
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-110"
                        aria-label="Fechar"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Navigation Arrows - Desktop only */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors items-center justify-center"
                                aria-label="Foto anterior"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors items-center justify-center"
                                aria-label="Próxima foto"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        </>
                    )}

                    {/* Image Container with Touch Support */}
                    <div 
                        className="relative w-full h-full flex items-center justify-center px-4 touch-pan-y pointer-events-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={currentPhoto.url}
                            alt={`${serviceName} - Foto ${selectedIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain select-none pointer-events-auto"
                            draggable={false}
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        {/* Counter */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full pointer-events-none">
                            {selectedIndex + 1} / {photos.length}
                        </div>
                    </div>

                    {/* Keyboard hint - Desktop only */}
                    <div className="hidden md:block absolute bottom-4 right-4 text-white/60 text-sm">
                        Use as setas ← → ou ESC para sair
                    </div>

                    {/* Touch hint - Mobile only */}
                    {photos.length > 1 && (
                        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center px-4">
                            Deslize para mudar de foto
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
