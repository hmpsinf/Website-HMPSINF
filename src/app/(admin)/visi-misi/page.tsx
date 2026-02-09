'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Upload, ImageIcon, Save, Clock, Eye, Target } from 'lucide-react';

interface VisiMisiData {
    id: string;
    visi: string | null;
    misi: string | null;
    image_url: string | null;
    image_public_id: string | null;
    created_at: string;
    updated_at: string;
}

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function VisiMisiPage() {
    const { showToast } = useToast();
    const [data, setData] = useState<VisiMisiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [visi, setVisi] = useState('');
    const [misi, setMisi] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/visi-misi');
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
                if (json.data) {
                    setVisi(json.data.visi || '');
                    setMisi(json.data.misi || '');
                    setImagePreview(json.data.image_url || null);
                } else {
                    setVisi('');
                    setMisi('');
                    setImagePreview(null);
                }
            }
        } catch {
            showToast('error', 'Gagal mengambil data visi misi');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            showToast('error', 'Ukuran gambar maksimal 1MB');
            return;
        }

        setImageFile(file);
        setRemoveImage(false);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!visi?.trim() && !misi?.trim()) {
            showToast('error', 'Visi atau Misi wajib diisi');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('visi', visi || '');
            formData.append('misi', misi || '');
            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (removeImage) {
                formData.append('remove_image', 'true');
            }

            const res = await fetch('/api/visi-misi', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                showToast('success', data ? 'Visi & Misi berhasil diperbarui' : 'Visi & Misi berhasil dibuat');
                setImageFile(null);
                setRemoveImage(false);
                await fetchData();
            } else {
                const json = await res.json();
                showToast('error', json.error || 'Gagal menyimpan visi misi');
            }
        } catch {
            showToast('error', 'Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch('/api/visi-misi', { method: 'DELETE' });
            if (res.ok) {
                showToast('success', 'Visi & Misi berhasil dihapus');
                setData(null);
                setVisi('');
                setMisi('');
                setImageFile(null);
                setImagePreview(null);
                setRemoveImage(false);
                setShowDeleteModal(false);
            } else {
                const json = await res.json();
                showToast('error', json.error || 'Gagal menghapus visi misi');
            }
        } catch {
            showToast('error', 'Terjadi kesalahan');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Visi & Misi" />

            {/* Info Bar */}
            {data && !loading && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                        <Clock className="h-4 w-4" />
                        <span>Terakhir diperbarui: {formatDate(data.updated_at)}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus Visi & Misi
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {loading ? (
                    <>
                        {/* Skeleton */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Skeleton className="mb-2 h-4 w-32" />
                                    <Skeleton className="h-40 w-full" />
                                </div>
                                <div>
                                    <Skeleton className="mb-2 h-4 w-28" />
                                    <Skeleton className="h-48 w-full" />
                                </div>
                                <div>
                                    <Skeleton className="mb-2 h-4 w-24" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSave}>
                        {/* Image Upload Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-6">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Gambar (Opsional)
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Gambar ilustrasi untuk halaman visi misi
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <div className="flex h-32 w-full sm:w-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 overflow-hidden">
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                width={192}
                                                height={128}
                                                className="max-h-full max-w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                <ImageIcon className="h-8 w-8" />
                                                <span className="text-xs">Tidak ada gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            ref={imageInputRef}
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleImageChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Upload Gambar
                                        </button>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus Gambar
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Format: JPG, PNG, GIF, WebP. Maks 1MB.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visi Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-6">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Visi</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tujuan jangka panjang organisasi</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <RichTextEditor
                                    value={visi}
                                    onChange={setVisi}
                                    placeholder="Tulis visi organisasi di sini..."
                                />
                            </div>
                        </div>

                        {/* Misi Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-6">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Misi</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Langkah-langkah strategis untuk mencapai visi</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <RichTextEditor
                                    value={misi}
                                    onChange={setMisi}
                                    placeholder="Tulis misi organisasi di sini..."
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Menyimpan...' : data ? 'Perbarui Visi & Misi' : 'Simpan Visi & Misi'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Visi & Misi"
                description="Apakah Anda yakin ingin menghapus konten visi dan misi? Semua data termasuk gambar akan dihapus permanen."
                isLoading={deleting}
            />
        </div>
    );
}
