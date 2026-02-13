'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Zoom } from 'swiper/modules';
import { cn } from '@/lib/utils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface LightboxProps {
    images: {
        id: string;
        image_url: string;
        caption: string | null;
    }[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Prevent scrolling when lightbox is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-110 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Swiper Container */}
            <div className="w-full h-full flex items-center justify-center">
                <Swiper
                    modules={[Navigation, Pagination, Keyboard, Zoom]}
                    initialSlide={initialIndex}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={{
                        prevEl: '.custom-swiper-button-prev',
                        nextEl: '.custom-swiper-button-next',
                    }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    keyboard={{ enabled: true }}
                    zoom={{ maxRatio: 3 }}
                    className="w-full h-full"
                >
                    {images.map((image) => (
                        <SwiperSlide key={image.id} className="flex items-center justify-center w-full h-full">
                            <div className="swiper-zoom-container w-full h-full relative flex items-center justify-center p-4 md:p-10">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <Image
                                        src={image.image_url}
                                        alt={image.caption || 'Gallery Image'}
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                </div>

                                {/* Caption Overlay */}
                                {image.caption && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-[90%] text-center">
                                        {image.caption}
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Custom Navigation Buttons */}
            <button className="custom-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-110 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all hidden md:block">
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button className="custom-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-110 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all hidden md:block">
                <ChevronRight className="w-8 h-8" />
            </button>

            <div className="absolute top-4 left-4 z-110">
                <div className="px-3 py-1.5 bg-black/40 text-white/80 text-xs rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5" />
                    Double click to zoom
                </div>
            </div>
        </div>
    );
}
