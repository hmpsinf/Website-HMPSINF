'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface GalleryImageUploadProps {
    images: { file?: File; url: string; public_id?: string; caption?: string }[];
    onChange: (images: { file?: File; url: string; public_id?: string; caption?: string }[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
}

export default function GalleryImageUpload({
    images,
    onChange,
    maxFiles = 3,
    maxSize = 1024 * 1024 // 1MB
}: GalleryImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateImage = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            if (file.size > maxSize) {
                setError(`Ukuran gambar maksimal ${maxSize / 1024 / 1024}MB`);
                resolve(false);
                return;
            }

            const img = new window.Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                // Aspect ratio check removed as per requirement
                // Images will be cropped to 16:9 via CSS (object-cover) and Cloudinary transformation
                resolve(true);
            };
            img.onerror = () => {
                setError('File bukan gambar valid');
                resolve(false);
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > maxFiles) {
            setError(`Maksimal ${maxFiles} gambar`);
            return;
        }

        const newImages = [...images];
        for (const file of files) {
            const isValid = await validateImage(file);
            if (isValid) {
                newImages.push({
                    file,
                    url: URL.createObjectURL(file), // Preview URL
                    caption: '' // Default empty caption
                });
                setError(null);
            }
        }
        onChange(newImages);
        if (inputRef.current) inputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Foto Galeri (Maks {maxFiles} foto, Max 1MB)
                <span className="block text-xs font-normal text-gray-500 mt-0.5">
                    Rasio bebas, akan otomatis dipotong ke 16:9
                </span>
            </label>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="aspect-video relative">
                            <Image
                                src={img.url}
                                alt={`Gallery ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {images.length < maxFiles && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        className={`aspect-video flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dragging
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                            : 'border-gray-300 hover:border-brand-500 dark:border-gray-700 dark:hover:border-brand-500'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={async (e) => {
                            e.preventDefault();
                            setDragging(false);
                            // Handle drop... similar to handleFileChange
                        }}
                    >
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 text-center px-2">
                            Klik atau drag foto
                        </span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="h-4 w-4" /> {error}
                </p>
            )}
        </div>
    );
}