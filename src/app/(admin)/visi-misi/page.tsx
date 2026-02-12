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
                } else {
                    setVisi('');
                    setMisi('');
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

            const res = await fetch('/api/visi-misi', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                showToast('success', data ? 'Visi & Misi berhasil diperbarui' : 'Visi & Misi berhasil dibuat');
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
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
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
                        {/* Visi Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 mb-6">
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
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 mb-6">
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
                description="Apakah Anda yakin ingin menghapus konten visi dan misi?"
                isLoading={deleting}
            />
        </div>
    );
}
