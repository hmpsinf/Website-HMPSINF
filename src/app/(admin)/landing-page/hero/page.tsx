"use client";

import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

interface HeroFormData {
    hero_title: string;
    hero_subtitle: string;
    hero_btn1_text: string;
    hero_btn1_link: string;
    hero_btn2_text: string;
    hero_btn2_link: string;
    hero_bg_size: string;
}

export default function HeroSettingsPage() {
    const { settings, loading, refreshSettings } = useSiteSettings();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    // Upload refs & states
    const heroBgInputRef = useRef<HTMLInputElement>(null);
    const heroSideImageInputRef = useRef<HTMLInputElement>(null);
    const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
    const [uploadingSideImage, setUploadingSideImage] = useState(false);

    const [formData, setFormData] = useState<HeroFormData>({
        hero_title: "",
        hero_subtitle: "",
        hero_btn1_text: "",
        hero_btn1_link: "",
        hero_btn2_text: "",
        hero_btn2_link: "",
        hero_bg_size: "cover",
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                hero_title: settings.hero_title || "",
                hero_subtitle: settings.hero_subtitle || "",
                hero_btn1_text: settings.hero_btn1_text || "",
                hero_btn1_link: settings.hero_btn1_link || "",
                hero_btn2_text: settings.hero_btn2_text || "",
                hero_btn2_link: settings.hero_btn2_link || "",
                hero_bg_size: settings.hero_bg_size || "cover",
            });
        }
    }, [settings]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: formData }),
            });

            if (res.ok) {
                showToast("success", "Pengaturan Hero berhasil disimpan");
                await refreshSettings();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Gagal menyimpan pengaturan");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (file: File, type: "hero_bg" | "hero_side_image") => {
        const isBg = type === "hero_bg";
        if (isBg) setUploadingHeroBg(true);
        else setUploadingSideImage(true);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", type);

        try {
            const res = await fetch("/api/settings/logo", {
                method: "POST",
                body: fd,
            });

            if (res.ok) {
                showToast("success", "Gambar berhasil diupload");
                await refreshSettings();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Gagal mengupload gambar");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            if (isBg) setUploadingHeroBg(false);
            else setUploadingSideImage(false);
        }
    };

    const handleDelete = async (type: "hero_bg" | "hero_side_image") => {
        if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

        const isBg = type === "hero_bg";
        if (isBg) setUploadingHeroBg(true);
        else setUploadingSideImage(true);

        try {
            const res = await fetch(`/api/settings/logo?type=${type}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("success", "Gambar berhasil dihapus");
                await refreshSettings();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Gagal menghapus gambar");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            if (isBg) setUploadingHeroBg(false);
            else setUploadingSideImage(false);
        }
    };

    const Skeleton = ({ className }: { className?: string }) => (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );

    const ImageUploadCard = ({
        title,
        imageUrl,
        type,
        inputRef,
        loadingState,
        description,
        aspectRatioClass = "aspect-video",
    }: {
        title: string;
        imageUrl: string | null;
        type: "hero_bg" | "hero_side_image";
        inputRef: React.RefObject<HTMLInputElement | null>;
        loadingState: boolean;
        description: string;
        aspectRatioClass?: string;
    }) => (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>

            <div className="space-y-4">
                <div className={`relative w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 ${aspectRatioClass}`}>
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            Tidak ada gambar
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(file, type);
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={loadingState}
                        className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                        {loadingState ? "Mengupload..." : "Upload"}
                    </button>
                    {imageUrl && (
                        <button
                            type="button"
                            onClick={() => handleDelete(type)}
                            disabled={loadingState}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                            Hapus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Pengaturan Hero Section" />

            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            ) : (
                <div className="rounded-lg bg-white p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        {/* Text Content */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 mb-6">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Konten Teks
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Judul Utama
                                        </label>
                                        <input
                                            type="text"
                                            name="hero_title"
                                            value={formData.hero_title}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                            placeholder="Judul besar di hero..."
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Subtitle
                                        </label>
                                        <textarea
                                            name="hero_subtitle"
                                            value={formData.hero_subtitle}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                            placeholder="Deskripsi singkat..."
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                                        <h4 className="font-medium text-gray-800 dark:text-white">Tombol Utama (Kiri)</h4>
                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500">Teks</label>
                                            <input
                                                type="text"
                                                name="hero_btn1_text"
                                                value={formData.hero_btn1_text}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500">Link</label>
                                            <input
                                                type="text"
                                                name="hero_btn1_link"
                                                value={formData.hero_btn1_link}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                                        <h4 className="font-medium text-gray-800 dark:text-white">Tombol Sekunder (Kanan)</h4>
                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500">Teks</label>
                                            <input
                                                type="text"
                                                name="hero_btn2_text"
                                                value={formData.hero_btn2_text}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500">Link</label>
                                            <input
                                                type="text"
                                                name="hero_btn2_link"
                                                value={formData.hero_btn2_link}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="grid gap-6 md:grid-cols-2 mb-6">
                            <ImageUploadCard
                                title="Background Hero"
                                description="Gambar latar belakang seluruh hero section. Max 5MB."
                                imageUrl={settings?.hero_bg_image || null}
                                type="hero_bg"
                                inputRef={heroBgInputRef}
                                loadingState={uploadingHeroBg}
                            />

                            <ImageUploadCard
                                title="Side Image"
                                description="Gambar ilustrasi di samping teks (kanan). Max 2MB."
                                imageUrl={settings?.hero_side_image || null}
                                type="hero_side_image"
                                inputRef={heroSideImageInputRef}
                                loadingState={uploadingSideImage}
                                aspectRatioClass="aspect-square"
                            />
                        </div>

                        {/* Background Settings */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 mb-6">
                            <div className="p-6">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ukuran Background
                                </label>
                                <select
                                    name="hero_bg_size"
                                    value={formData.hero_bg_size}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                >
                                    <option value="cover">Cover (Penuh)</option>
                                    <option value="contain">Contain (Utuh)</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                        </div>

                        <div className="sticky bottom-6 z-10 flex justify-end">
                            <div className="rounded-xl border border-gray-200 bg-white/80 p-2 shadow-lg backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                                >
                                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
