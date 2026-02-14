'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Save, UploadCloud, X, LayoutTemplate,
    Type, Link as LinkIcon, FileText, Loader2,
    CheckCircle2, Eye
} from 'lucide-react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';

interface PopupSettings {
    is_active: boolean;
    image_url: string;
    title: string;
    description: string;
    btn_text: string;
    btn_link: string;
}

export default function PopupSettingsPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<PopupSettings>({
        is_active: false,
        image_url: '',
        title: '',
        description: '',
        btn_text: '',
        btn_link: ''
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/popup');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                if (data.image_url) setPreviewImage(data.image_url);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            showToast('error', 'Gagal memuat pengaturan popup');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                showToast('error', 'Ukuran file maksimal 2MB');
                return;
            }
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('is_active', String(settings.is_active));
            formData.append('title', settings.title);
            formData.append('description', settings.description);
            formData.append('btn_text', settings.btn_text);
            formData.append('btn_link', settings.btn_link);
            formData.append('image_url', settings.image_url); // Keep existing URL if no new file

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const res = await fetch('/api/popup', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || 'Gagal menyimpan');
            }

            const data = await res.json();
            if (data.success) {
                setSettings(prev => ({ ...prev, image_url: data.image_url }));
                showToast('success', 'Pengaturan popup berhasil disimpan');
                setSelectedFile(null); // Reset file selection
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan';
            showToast('error', message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <PageBreadcrumb pageTitle="Marketing Popup" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Creation Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5 shadow-sm">

                        {/* Toggle Status */}
                        <div className="mb-8 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <LayoutTemplate className="w-5 h-5 text-brand-600" />
                                    Status Popup
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Aktifkan untuk menampilkan popup promosi kepada pengunjung.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={settings.is_active}
                                onClick={() => setSettings({ ...settings, is_active: !settings.is_active })}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${settings.is_active ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`${settings.is_active ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                                />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Gambar Banner <span className="text-gray-400 font-normal">(Rekomendasi Ratio 1:1)</span>
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-all group overflow-hidden"
                                >
                                    {previewImage ? (
                                        <div className="relative h-full w-full min-h-[280px]">
                                            <Image
                                                src={previewImage}
                                                alt="Preview"
                                                fill
                                                className="object-contain object-center p-2"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm">
                                                    Ganti Gambar
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <div className="rounded-full bg-brand-50 p-4 mb-3 dark:bg-brand-900/20">
                                                <UploadCloud className="h-8 w-8 text-brand-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Klik untuk upload gambar</p>
                                            <p className="mt-1 text-xs text-gray-500">Maks. 1MB (PNG, JPG, WEBP) - Ratio 1:1</p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Type className="w-4 h-4 text-gray-400" /> Judul
                                </label>
                                <input
                                    type="text"
                                    value={settings.title}
                                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
                                    placeholder="Contoh: Diskon Spesial Akhir Tahun!"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FileText className="w-4 h-4 text-gray-400" /> Deskripsi
                                </label>
                                <textarea
                                    value={settings.description}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white resize-none"
                                    placeholder="Jelaskan detail informasi penting disini..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Button Text */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teks Tombol</label>
                                    <input
                                        type="text"
                                        value={settings.btn_text}
                                        onChange={(e) => setSettings({ ...settings, btn_text: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
                                        placeholder="Contoh: Daftar Sekarang"
                                    />
                                </div>

                                {/* Button Link */}
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <LinkIcon className="w-4 h-4 text-gray-400" /> Link Tujuan
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.btn_link}
                                        onChange={(e) => setSettings({ ...settings, btn_link: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-70 transition-all shadow-lg shadow-brand-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            <Eye className="w-4 h-4" /> Live Preview
                        </div>

                        {/* Simulation of the Popup Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800">
                            {/* Image Area */}
                            <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800">
                                {previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">
                                        <span className="text-xs">No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white font-heading leading-tight mb-2">
                                    {settings.title || 'Judul Disini'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                                    {settings.description || 'Deskripsi singkat mengenai informasi penting yang akan ditampilkan kepada pengunjung website.'}
                                </p>

                                <div className="flex items-center justify-end">
                                    <button className="rounded-full bg-gray-900 px-6 py-2.5 text-xs font-semibold text-white transition-transform hover:scale-105 dark:bg-white dark:text-gray-900">
                                        {settings.btn_text || 'Action Button'}
                                    </button>
                                </div>
                            </div>

                            {/* Decoration */}
                            <div className="absolute top-0 right-0 p-4">
                                <div className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <X className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-400 italic">
                                *Preview tampilan mungkin sedikit berbeda di halaman publik tergantung ukuran layar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
