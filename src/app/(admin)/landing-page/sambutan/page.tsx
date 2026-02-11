"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useToast } from "@/components/ui/Toast";

interface SambutanFormData {
    sambutan_section_title: string;
    sambutan_section_subtitle: string;
    sambutan_content: string;
}

export default function SambutanSettingsPage() {
    const { settings, loading, refreshSettings } = useSiteSettings();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<SambutanFormData>({
        sambutan_section_title: "",
        sambutan_section_subtitle: "",
        sambutan_content: "",
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                sambutan_section_title: settings.sambutan_section_title || "",
                sambutan_section_subtitle: settings.sambutan_section_subtitle || "",
                sambutan_content: settings.sambutan_content || "",
            });
        }
    }, [settings]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                showToast("success", "Pengaturan sambutan berhasil disimpan");
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
                pageTitle="Sambutan Ketua Himpunan"
            />

            <div className="rounded-lg bg-white p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Content Settings */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                        <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Konten Sambutan
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur judul, subtitle, dan isi pesan sambutan. Foto dan informasi kontak akan diambil otomatis dari data pengurus inti (Ketua Himpunan) yang aktif.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Judul Section
                                </label>
                                <input
                                    type="text"
                                    name="sambutan_section_title"
                                    value={formData.sambutan_section_title}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Contoh: Sambutan Ketua Himpunan"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subtitle Section
                                </label>
                                <input
                                    type="text"
                                    name="sambutan_section_subtitle"
                                    value={formData.sambutan_section_subtitle}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Contoh: Pesan dari Ketua Himpunan Periode 2024/2025"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Isi Sambutan (Mendukung HTML)
                                </label>
                                <textarea
                                    name="sambutan_content"
                                    value={formData.sambutan_content}
                                    onChange={handleInputChange}
                                    rows={10}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="Tuliskan kata sambutan di sini..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Tips: Gunakan tag HTML seperti &lt;p&gt;, &lt;br&gt;, &lt;strong&gt; untuk format teks.
                                </p>
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
