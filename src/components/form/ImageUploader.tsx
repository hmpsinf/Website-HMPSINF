"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

interface ImageUploaderProps {
    onUpload: (url: string) => void;
    showPreview?: boolean;
    defaultPreview?: string | null;
    folder?: string; // Currently unused by API but could be passed later
    type?: string;   // The type param for the API, defaults to "landing_video_bg_image" if not specified, but simpler to just hardcode or pass.
    // The component I wrote in the page uses `folder="site-settings"`, which doesn't match API param.
    // I will adapt this component to use the API logic.
}

export default function ImageUploader({
    onUpload,
    showPreview = true,
    defaultPreview = null,
    folder = "site-settings", // ignored, using type mapping instead
}: ImageUploaderProps) {
    const { showToast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(defaultPreview);

    // Sync preview with defaultPreview when it changes (e.g. after data fetch)
    React.useEffect(() => {
        setPreview(defaultPreview);
    }, [defaultPreview]);

    const handleUpload = async (file: File) => {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        // We use 'landing_video_bg_image' as the type, consistent with the API update.
        // If we want this component to be truly generic, we should pass 'type' as prop.
        // For now, I'll default to 'landing_video_bg_image' as that's what I need,
        // or I can try to infer or just add a prop.
        // The calling code didn't pass 'type', so I need to assume or update calling code.
        // But since I control both, I will add 'type' prop to interface and default it or require it.
        // Wait, the calling code is:
        // <ImageUploader
        //     onUpload={handleImageUpload}
        //     showPreview={true}
        //     defaultPreview={formData.landing_video_bg_image}
        //     folder="site-settings"
        // />
        // It doesn't pass 'type'.
        // So I will make 'type' prop optional and default to 'landing_video_bg_image' for now,
        // or effectively 'landing_video_bg_image'.

        fd.append("type", "landing_video_bg_image");

        try {
            const res = await fetch("/api/settings/logo", {
                method: "POST",
                body: fd,
            });

            if (res.ok) {
                const data = await res.json();
                const url = data.url;
                setPreview(url);
                onUpload(url);
                showToast("success", "Gambar berhasil diupload");
            } else {
                const data = await res.json();
                showToast("error", data.error || "Gagal mengupload gambar");
            }
        } catch {
            showToast("error", "Terjadi kesalahan saat upload");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Hapus gambar ini?")) return;
        setUploading(true);
        try {
            const res = await fetch("/api/settings/logo?type=landing_video_bg_image", {
                method: "DELETE",
            });
            if (res.ok) {
                setPreview(null);
                onUpload(""); // Clear URL in parent
                showToast("success", "Gambar dihapus");
            } else {
                showToast("error", "Gagal menghapus gambar");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {showPreview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <span className="text-sm">Tidak ada gambar</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3">
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                    }}
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                    {uploading ? "Mengupload..." : preview ? "Ganti Gambar" : "Upload Gambar"}
                </button>
                {preview && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={uploading}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                        Hapus
                    </button>
                )}
            </div>
        </div>
    );
}
