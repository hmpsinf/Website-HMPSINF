"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";
import { DEFAULT_HIMA_INTI_PATTERN_COLOR, generatePatternSvg } from "@/lib/pattern";

interface FormData {
    site_name: string;
    site_slogan: string;
    footer_text: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    instagram_url: string;
    tiktok_url: string;
    facebook_url: string;
    youtube_url: string;
    maps_embed_url: string;
}

export default function SiteSettingsPage() {
    const { settings, loading, refreshSettings } = useSiteSettings();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const logoDarkInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    // Removed hero inputs

    const [formData, setFormData] = useState<FormData>({
        site_name: "",
        site_slogan: "",
        footer_text: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        instagram_url: "",
        tiktok_url: "",
        facebook_url: "",
        youtube_url: "",
        maps_embed_url: "",
    });

    // HIMA Inti pattern color state
    const [patternColor, setPatternColor] = useState(DEFAULT_HIMA_INTI_PATTERN_COLOR);
    const [savingPatternColor, setSavingPatternColor] = useState(false);

    // Fetch pattern color from settings
    const fetchPatternColor = useCallback(async () => {
        try {
            const res = await fetch("/api/settings/hima_inti_pattern_color");
            if (res.ok) {
                const data = await res.json();
                if (data.value) {
                    setPatternColor(data.value);
                }
            }
        } catch (error) {
            console.error("Failed to fetch pattern color:", error);
        }
    }, []);

    useEffect(() => {
        if (settings) {
            setFormData({
                site_name: settings.site_name || "",
                site_slogan: settings.site_slogan || "",
                footer_text: settings.footer_text || "",
                contact_email: settings.contact_email || "",
                contact_phone: settings.contact_phone || "",
                address: settings.address || "",
                instagram_url: settings.instagram_url || "",
                tiktok_url: settings.tiktok_url || "",
                facebook_url: settings.facebook_url || "",
                youtube_url: settings.youtube_url || "",
                maps_embed_url: settings.maps_embed_url || "",
            });
        }
        fetchPatternColor();
    }, [settings, fetchPatternColor]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
                showToast("success", "Pengaturan berhasil disimpan");
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

    const handleLogoUpload = async (
        file: File,
        type: "logo" | "logo_dark" | "favicon"
    ) => {
        setUploadingLogo(type);

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("type", type);

        try {
            const res = await fetch("/api/settings/logo", {
                method: "POST",
                body: formDataUpload,
            });

            if (res.ok) {
                showToast(
                    "success",
                    `${type === "favicon" ? "Favicon" : "Logo"} berhasil diupload`
                );
                await refreshSettings();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Gagal mengupload logo");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setUploadingLogo(null);
        }
    };

    const handleDeleteLogo = async (type: "logo" | "logo_dark" | "favicon") => {
        if (!confirm("Apakah Anda yakin ingin menghapus logo ini?")) return;

        setUploadingLogo(type);

        try {
            const res = await fetch(`/api/settings/logo?type=${type}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("success", "Logo berhasil dihapus");
                await refreshSettings();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Gagal menghapus logo");
            }
        } catch {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setUploadingLogo(null);
        }
    };

    // Removed handleHeroBgUpload and handleDeleteHeroBg

    const Skeleton = ({ className }: { className?: string }) => (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        />
    );

    const LogoUploadCard = ({
        title,
        logoUrl,
        type,
        inputRef,
        description,
    }: {
        title: string;
        logoUrl: string | null;
        type: "logo" | "logo_dark" | "favicon";
        inputRef: React.RefObject<HTMLInputElement | null>;
        description: string;
    }) => (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>
            <div className="flex items-center gap-5">
                <div
                    className={`flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 ${type === "favicon" ? "h-16 w-16" : "h-24 w-40"
                        }`}
                >
                    {logoUrl ? (
                        <Image
                            src={logoUrl}
                            alt={title}
                            width={type === "favicon" ? 48 : 150}
                            height={type === "favicon" ? 48 : 80}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-gray-400">Tidak ada</span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file, type);
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploadingLogo === type}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                        {uploadingLogo === type ? "Mengupload..." : "Upload"}
                    </button>
                    {logoUrl && (
                        <button
                            type="button"
                            onClick={() => handleDeleteLogo(type)}
                            disabled={uploadingLogo === type}
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
            <PageBreadcrumb pageTitle="Pengaturan Situs" />

            <div className="space-y-6">
                {/* Logo Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Logo & Branding
                        </h3>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Skeleton className="h-40" />
                                <Skeleton className="h-40" />
                                <Skeleton className="h-40" />
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <LogoUploadCard
                                    title="Logo Light"
                                    logoUrl={settings?.logo_url || null}
                                    type="logo"
                                    inputRef={logoInputRef}
                                    description="Logo untuk mode terang. Format: PNG, JPG, WebP, SVG, GIF. Max 1MB."
                                />
                                <LogoUploadCard
                                    title="Logo Dark"
                                    logoUrl={settings?.logo_dark_url || null}
                                    type="logo_dark"
                                    inputRef={logoDarkInputRef}
                                    description="Logo untuk mode gelap. Format: PNG, JPG, WebP, SVG, GIF. Max 1MB."
                                />
                                <LogoUploadCard
                                    title="Favicon"
                                    logoUrl={settings?.favicon_url || null}
                                    type="favicon"
                                    inputRef={faviconInputRef}
                                    description="Ikon browser. Ukuran ideal: 32x32 atau 48x48 px. Format: PNG, ICO, SVG. Max 1MB."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* HIMA Inti Pattern Color */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Warna Pattern HIMA Inti
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Warna pattern untuk background foto anggota HIMA Inti
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={patternColor}
                                    onChange={(e) => setPatternColor(e.target.value)}
                                    className="h-12 w-16 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={patternColor}
                                    onChange={(e) => setPatternColor(e.target.value)}
                                    className="w-28 rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                    placeholder="#7C3AED"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    setSavingPatternColor(true);
                                    try {
                                        const res = await fetch("/api/settings", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ settings: { hima_inti_pattern_color: patternColor } }),
                                        });
                                        if (res.ok) {
                                            showToast("success", "Warna pattern berhasil disimpan");
                                        } else {
                                            showToast("error", "Gagal menyimpan warna pattern");
                                        }
                                    } catch {
                                        showToast("error", "Terjadi kesalahan");
                                    } finally {
                                        setSavingPatternColor(false);
                                    }
                                }}
                                disabled={savingPatternColor}
                                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                            >
                                {savingPatternColor ? "Menyimpan..." : "Simpan Warna"}
                            </button>
                        </div>
                        {/* Preview */}
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
                            <div
                                className="w-32 h-20 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                style={{
                                    backgroundImage: `url("${generatePatternSvg(patternColor)}")`,
                                    backgroundPosition: 'center center',
                                    backgroundRepeat: 'repeat',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* General Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Informasi Umum
                        </h3>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i}>
                                        <Skeleton className="mb-2 h-4 w-32" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleSaveSettings} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nama Situs
                                        </label>
                                        <input
                                            type="text"
                                            name="site_name"
                                            value={formData.site_name}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                            placeholder="HMPSINF"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Slogan
                                        </label>
                                        <input
                                            type="text"
                                            name="site_slogan"
                                            value={formData.site_slogan}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                            placeholder="Himpunan Mahasiswa..."
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Kontak
                                        </label>
                                        <input
                                            type="email"
                                            name="contact_email"
                                            value={formData.contact_email}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                            placeholder="info@hmpsinf.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Telepon Kontak
                                        </label>
                                        <input
                                            type="text"
                                            name="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                            placeholder="+62..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Alamat
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                        placeholder="Alamat lengkap..."
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Teks Footer
                                    </label>
                                    <input
                                        type="text"
                                        name="footer_text"
                                        value={formData.footer_text}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                        placeholder="© 2025 HMPSINF. All rights reserved."
                                    />
                                </div>

                                {/* Save button moved to bottom of page */}
                                <div className="hidden"></div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Social Media Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Social Media
                        </h3>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                <Skeleton className="h-10" />
                                <Skeleton className="h-10" />
                                <Skeleton className="h-10" />
                                <Skeleton className="h-10" />
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Instagram URL
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram_url"
                                        value={formData.instagram_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        TikTok URL
                                    </label>
                                    <input
                                        type="url"
                                        name="tiktok_url"
                                        value={formData.tiktok_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                        placeholder="https://tiktok.com/@..."
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Facebook URL
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook_url"
                                        value={formData.facebook_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        YouTube URL
                                    </label>
                                    <input
                                        type="url"
                                        name="youtube_url"
                                        value={formData.youtube_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Location / Maps Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Lokasi / Maps
                        </h3>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32" />
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2 items-start">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Google Maps Embed Code
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Paste kode embed (iframe) dari Google Maps di sini.
                                    </p>
                                    <textarea
                                        name="maps_embed_url"
                                        value={formData.maps_embed_url || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Extract src from iframe if pasted
                                            const srcMatch = val.match(/src="([^"]+)"/);
                                            if (srcMatch && srcMatch[1]) {
                                                handleInputChange({
                                                    target: { name: 'maps_embed_url', value: srcMatch[1] }
                                                } as any);
                                            } else {
                                                handleInputChange(e);
                                            }
                                        }}
                                        rows={8}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white font-mono text-xs"
                                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                                    />
                                </div>

                                {/* Map Preview */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Preview
                                    </label>
                                    {formData.maps_embed_url ? (
                                        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 aspect-video w-full">
                                            <iframe
                                                src={formData.maps_embed_url}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                                            <p className="text-sm text-gray-400">Preview akan muncul di sini</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hero section moved to specific page */}
                {/* Save Button (Global) */}
                <div className="sticky bottom-4 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="rounded-lg bg-brand-500 px-6 py-3 font-medium text-white shadow-lg hover:bg-brand-600 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    >
                        {saving ? "Menyimpan Pengaturan..." : "Simpan Semua Pengaturan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
