"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useToast } from "@/components/ui/Toast";

interface CTAFormData {
    landing_cta_title: string;
    landing_cta_subtitle: string;
    landing_cta_btn_text: string;
    landing_cta_btn_link: string;
}

export default function CTASectionSettingsPage() {
    const { settings, refreshSettings } = useSiteSettings();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CTAFormData>({
        landing_cta_title: "",
        landing_cta_subtitle: "",
        landing_cta_btn_text: "",
        landing_cta_btn_link: "",
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                landing_cta_title: settings.landing_cta_title || "",
                landing_cta_subtitle: settings.landing_cta_subtitle || "",
                landing_cta_btn_text: settings.landing_cta_btn_text || "",
                landing_cta_btn_link: settings.landing_cta_btn_link || "",
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
            // We reuse the existing /api/settings endpoint which accepts partial updates
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: formData }),
            });

            if (res.ok) {
                showToast("success", "Pengaturan CTA Section berhasil disimpan");
                await refreshSettings();
            } else {
                showToast("error", "Gagal menyimpan pengaturan");
            }
        } catch (error) {
            console.error(error);
            showToast("error", "Terjadi kesalahan koneksi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <PageBreadcrumb
                pageTitle="CTA Section Settings"
            />
            <div className="rounded-lg bg-white p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* CTA Content Settings */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                        <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Konten CTA
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur judul, deskripsi, dan tombol aksi untuk bagian CTA.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Judul CTA
                                </label>
                                <input
                                    type="text"
                                    name="landing_cta_title"
                                    value={formData.landing_cta_title}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Siap Berinovasi Bersama Kami?"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sub-Judul / Deskripsi
                                </label>
                                <textarea
                                    name="landing_cta_subtitle"
                                    rows={3}
                                    value={formData.landing_cta_subtitle}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Mari bergabung dan wujudkan masa depan teknologi bersama HMPSINF."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Button Text */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Teks Tombol
                                    </label>
                                    <input
                                        type="text"
                                        name="landing_cta_btn_text"
                                        value={formData.landing_cta_btn_text}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Hubungi Kami"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Button Link */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Link Tombol
                                    </label>
                                    <input
                                        type="text"
                                        name="landing_cta_btn_link"
                                        value={formData.landing_cta_btn_link}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: /contact"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Perubahan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
