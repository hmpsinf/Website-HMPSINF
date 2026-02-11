"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useToast } from "@/components/ui/Toast";
import ImageUploader from "../../../../components/form/ImageUploader";

interface VideoSectionFormData {
    landing_video_title: string;
    landing_video_subtitle: string;
    landing_video_url: string;
    landing_video_description: string;
    landing_video_bg_image: string;
    landing_video_bg_attachment: string;
    landing_video_overlay_opacity: string;
    landing_video_pattern_opacity: string;
    landing_video_footer_text: string;
}

export default function VideoSectionSettingsPage() {
    const { settings, loading, refreshSettings } = useSiteSettings();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<VideoSectionFormData>({
        landing_video_title: "",
        landing_video_subtitle: "",
        landing_video_url: "",
        landing_video_description: "",
        landing_video_bg_image: "",
        landing_video_bg_attachment: "fixed",
        landing_video_overlay_opacity: "80",
        landing_video_pattern_opacity: "10",
        landing_video_footer_text: "HMPSINF 2024",
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                landing_video_title: settings.landing_video_title || "",
                landing_video_subtitle: settings.landing_video_subtitle || "",
                landing_video_url: (() => {
                    const url = settings.landing_video_url || "";
                    if (url.includes("<iframe")) {
                        const match = url.match(/src=["']([^"']+)["']/);
                        return match ? match[1] : url;
                    }
                    return url;
                })(),
                landing_video_description: settings.landing_video_description || "",
                landing_video_bg_image: settings.landing_video_bg_image || "",
                landing_video_bg_attachment: settings.landing_video_bg_attachment || "fixed",
                landing_video_overlay_opacity: settings.landing_video_overlay_opacity || "80",
                landing_video_pattern_opacity: settings.landing_video_pattern_opacity || "10",
                landing_video_footer_text: settings.landing_video_footer_text || "HMPSINF 2024",
            });
        }
    }, [settings]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // Auto-extract URL if user pastes a full iframe tag
        if (name === "landing_video_url" && value.includes("<iframe")) {
            const srcMatch = value.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                setFormData((prev) => ({ ...prev, [name]: srcMatch[1] }));
                showToast("info", "URL video berhasil diekstrak dari embed code");
                return;
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({ ...prev, landing_video_bg_image: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: formData }),
            });

            if (res.ok) {
                showToast("success", "Pengaturan Video Section berhasil disimpan");
                await refreshSettings();
            } else {
                showToast("error", "Gagal menyimpan pengaturan");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading settings...</div>;

    return (
        <div>
            <PageBreadcrumb
                pageTitle="Pengaturan Video Section"
            />

            <div className="rounded-lg bg-white p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Settings */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                        <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Konten & Teks
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur judul, deskripsi, dan link video YouTube yang akan ditampilkan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Judul Section
                                </label>
                                <input
                                    type="text"
                                    name="landing_video_title"
                                    value={formData.landing_video_title}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Contoh: Profil Himpunan"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subtitle / Tagline
                                </label>
                                <input
                                    type="text"
                                    name="landing_video_subtitle"
                                    value={formData.landing_video_subtitle}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Contoh: Saksikan dokumentasi kegiatan kami"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Link Video YouTube (Embed URL)
                                </label>
                                <input
                                    type="text"
                                    name="landing_video_url"
                                    value={formData.landing_video_url}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Contoh: https://www.youtube.com/embed/dQw4w9WgXcQ"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Pastikan menggunakan link embed (biasanya ada di opsi Share &gt; Embed di YouTube).
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    name="landing_video_description"
                                    value={formData.landing_video_description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Tuliskan deskripsi singkat..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Teks Footer (Kecil)
                                </label>
                                <input
                                    type="text"
                                    name="landing_video_footer_text"
                                    value={formData.landing_video_footer_text}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Contoh: HMPSINF 2024"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Tampilan & Background
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur gambar latar belakang dan efek visual.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Background Image
                                </label>
                                <ImageUploader
                                    onUpload={handleImageUpload}
                                    showPreview={true}
                                    defaultPreview={formData.landing_video_bg_image}
                                    folder="site-settings"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Disarankan gambar gelap atau dengan kontras rendah agar teks terbaca.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Background Attachment
                                    </label>
                                    <select
                                        name="landing_video_bg_attachment"
                                        value={formData.landing_video_bg_attachment}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="scroll">Scroll (Normal)</option>
                                        <option value="fixed">Fixed (Parallax Effect)</option>
                                        <option value="local">Local</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Overlay Opacity (%)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            name="landing_video_overlay_opacity"
                                            max="100"
                                            step="5"
                                            value={formData.landing_video_overlay_opacity}
                                            onChange={handleInputChange}
                                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                                        />
                                    </div>
                                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                                        <span>0% (Transparan)</span>
                                        <span>{formData.landing_video_overlay_opacity}%</span>
                                        <span>100% (Gelap Pekat)</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Opasitas Pattern (%)
                                    </label>
                                    <input
                                        type="range"
                                        name="landing_video_pattern_opacity"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={formData.landing_video_pattern_opacity}
                                        onChange={handleInputChange}
                                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                                    />
                                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                                        <span>0% (Tidak Terlihat)</span>
                                        <span>{formData.landing_video_pattern_opacity}%</span>
                                        <span>100% (Sangat Jelas)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-brand-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 hover:shadow-brand-500/30 disabled:opacity-70"
                        >
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
