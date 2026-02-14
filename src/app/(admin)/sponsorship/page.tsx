'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, X, Edit2, Trash2, ShieldCheck,
    UploadCloud, MoreVertical, Check, Loader2, Info
} from 'lucide-react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';

interface SponsorshipLogo {
    id: string;
    image_url: string;
    public_id: string;
    caption: string | null;
    created_at: string;
}

interface SponsorshipSettings {
    id: string;
    title: string;
    subtitle: string | null;
    show_section: boolean;
}

export default function SponsorshipPage() {
    const { showToast } = useToast();
    const [logos, setLogos] = useState<SponsorshipLogo[]>([]);
    const [settings, setSettings] = useState<SponsorshipSettings>({
        id: 'default',
        title: 'Sponsorship',
        subtitle: '',
        show_section: true
    });

    const [loading, setLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoToDelete, setLogoToDelete] = useState<SponsorshipLogo | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Caption Editing
    const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
    const [tempCaption, setTempCaption] = useState('');
    const captionInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [settingsRes, logosRes] = await Promise.all([
                fetch('/api/sponsorship/settings'),
                fetch('/api/sponsorship/logos')
            ]);

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                setSettings(settingsData);
            }

            if (logosRes.ok) {
                const logosData = await logosRes.json();
                setLogos(logosData);
            }
        } catch (error) {
            console.error(error);
            showToast('error', 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSettingsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);
        try {
            const res = await fetch('/api/sponsorship/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Gagal menyimpan pengaturan');

            showToast('success', 'Pengaturan berhasil disimpan');
        } catch (error: any) {
            showToast('error', error.message);
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        // Reset input
        e.target.value = '';

        if (file.size > 1024 * 1024) {
            showToast('error', 'Ukuran file maksimal 1MB');
            return;
        }

        setUploading(true);
        const toastId = showToast('info', 'Mengupload logo...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/sponsorship/logos', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Gagal upload logo');

            const newLogo = await res.json();
            setLogos(prev => [newLogo, ...prev]);
            showToast('success', 'Logo berhasil ditambahkan');
        } catch (error: any) {
            showToast('error', error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCaptionUpdate = async (id: string) => {
        if (!tempCaption && tempCaption !== '') return;

        try {
            const res = await fetch(`/api/sponsorship/logos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caption: tempCaption })
            });

            if (!res.ok) throw new Error('Gagal update caption');

            setLogos(prev => prev.map(logo =>
                logo.id === id ? { ...logo, caption: tempCaption } : logo
            ));
            setEditingCaptionId(null);
            showToast('success', 'Caption diperbarui');
        } catch (error: any) {
            showToast('error', error.message);
        }
    };

    const handleDelete = async () => {
        if (!logoToDelete) return;

        try {
            const res = await fetch(`/api/sponsorship/logos/${logoToDelete.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Gagal menghapus logo');

            setLogos(prev => prev.filter(l => l.id !== logoToDelete.id));
            showToast('success', 'Logo berhasil dihapus');
            setShowDeleteModal(false);
            setLogoToDelete(null);
        } catch (error: any) {
            showToast('error', error.message);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <PageBreadcrumb pageTitle="Manajemen Sponsorship" />

            {/* SECTION 1: SETTINGS */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5">
                <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                        <ShieldCheck className="h-5 w-5 text-brand-500" />
                        Pengaturan Section
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Sesuaikan judul dan deskripsi section sponsorship di landing page.</p>
                </div>

                <form onSubmit={handleSettingsUpdate} className="p-6">
                    {/* Toggle Show Section */}
                    <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/5">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">Tampilkan Section</label>
                            <p className="text-xs text-gray-500">Aktifkan untuk menampilkan section sponsorship di halaman depan.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.show_section}
                            onClick={() => setSettings({ ...settings, show_section: !settings.show_section })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${settings.show_section ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span
                                className={`${settings.show_section ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Judul Section</label>
                            <input
                                type="text"
                                value={settings.title}
                                onChange={e => setSettings({ ...settings, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
                                placeholder="Contoh: Sponsorship"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Judul</label>
                            <input
                                type="text"
                                value={settings.subtitle || ''}
                                onChange={e => setSettings({ ...settings, subtitle: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
                                placeholder="Contoh: Didukung oleh mitra terbaik kami"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={settingsLoading}
                            className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-70"
                        >
                            {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: LOGOS */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Daftar Logo Sponsor</h2>
                        <p className="mt-1 text-sm text-gray-500">Logo akan ditampilkan dalam carousel otomatis.</p>
                    </div>

                    <div>
                        <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor="logo-upload"
                            className={`cursor-pointer inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all ${uploading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            Upload Logo Baru
                        </label>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                        </div>
                    ) : logos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/30">
                            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                <UploadCloud className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Belum ada logo sponsor</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload logo pertama Anda untuk memulai.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {logos.map((logo) => (
                                <div key={logo.id} className="flex flex-col gap-3">
                                    {/* Image Card Wrapper */}
                                    <div className="group relative aspect-square w-full">
                                        <div className="h-full w-full overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-gray-700">

                                            {/* Image */}
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={logo.image_url}
                                                    alt={logo.caption || "Sponsor Logo"}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            </div>

                                            {/* Hover Overlay Actions */}
                                            <div className="absolute inset-x-0 top-0 flex justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => { setLogoToDelete(logo); setShowDeleteModal(true); }}
                                                    className="rounded-full bg-red-500/90 p-1.5 text-white backdrop-blur-sm hover:bg-red-600 transition-colors shadow-sm"
                                                    title="Hapus Logo"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Caption Bubble Preview - Moved Outside overflow-hidden */}
                                        {logo.caption && (
                                            <div className="absolute bottom-full left-1/2 z-50 w-max max-w-[180px] -translate-x-1/2 scale-90 opacity-0 transition-all duration-300 mb-2 group-hover:mb-3 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
                                                <div className="relative rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-900 shadow-xl border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                                                    {logo.caption}
                                                    {/* Triangle Arrow - Rotated Square for Border effect */}
                                                    <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Caption Input Area */}
                                    <div className="relative">
                                        {editingCaptionId === logo.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    ref={captionInputRef}
                                                    type="text"
                                                    value={tempCaption}
                                                    onChange={(e) => setTempCaption(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleCaptionUpdate(logo.id);
                                                        if (e.key === 'Escape') setEditingCaptionId(null);
                                                    }}
                                                    onBlur={() => handleCaptionUpdate(logo.id)}
                                                    className="w-full rounded-md border border-brand-500 bg-white px-2 py-1 text-xs outline-none dark:bg-gray-800 dark:text-white"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingCaptionId(logo.id);
                                                    setTempCaption(logo.caption || '');
                                                }}
                                                className={`flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors ${logo.caption ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800' : 'text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-500 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                                            >
                                                {logo.caption ? (
                                                    <span className="truncate max-w-[120px]">{logo.caption}</span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Edit2 className="h-3 w-3" /> Tambah Keterangan
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Logo Sponsor"
                description="Logo yang dihapus tidak dapat dikembalikan. Lanjutkan?"
            />
        </div>
    );
}
