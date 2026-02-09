'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, X, Edit2, Trash2, Calendar,
    ImageIcon, Filter, ExternalLink, MoreVertical
} from 'lucide-react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';
import FormModal, { GalleryFormData } from '@/components/admin/galleries/FormModal';

interface Gallery {
    id: string;
    title: string;
    description: string;
    event_id: string | null;
    program_kerja_id: string | null;
    linked_to: string;
    type: 'Event' | 'Program Kerja';
    created_at: string;
    images: { id: string; url: string; public_id: string; caption: string }[];
}

export default function GalleriesPage() {
    const { showToast } = useToast();
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'Event' | 'Program Kerja'>('all');

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<GalleryFormData>({
        title: '',
        description: '',
        event_id: null,
        program_kerja_id: null,
        images: []
    });

    const fetchGalleries = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/galleries');
            if (!res.ok) throw new Error('Failed to fetch galleries');
            const data = await res.json();
            setGalleries(data);
        } catch (error) {
            console.error(error);
            showToast('error', 'Gagal memuat data galeri');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            event_id: null,
            program_kerja_id: null,
            images: []
        });
        setSelectedGallery(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Prepare FormData for file upload
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.event_id) data.append('event_id', formData.event_id);
            if (formData.program_kerja_id) data.append('program_kerja_id', formData.program_kerja_id);

            // Append images
            formData.images.forEach((img, index) => {
                if (img.file) {
                    data.append('images', img.file);
                }
                // We don't support partial updates of captions yet in create, but could be added
            });

            const res = await fetch('/api/galleries', {
                method: 'POST',
                body: data
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Gagal membuat galeri');
            }

            showToast('success', 'Galeri berhasil dibuat');
            setShowCreateModal(false);
            resetForm();
            fetchGalleries();
        } catch (error: any) {
            showToast('error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setFormData({
            title: gallery.title,
            description: gallery.description || '',
            event_id: gallery.event_id,
            program_kerja_id: gallery.program_kerja_id,
            images: gallery.images.map(img => ({
                url: img.url,
                public_id: img.public_id,
                caption: img.caption,
                id: img.id
            }))
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGallery) return;
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.event_id) data.append('event_id', formData.event_id);
            if (formData.program_kerja_id) data.append('program_kerja_id', formData.program_kerja_id);

            // Handle images:
            // 1. Existing images (pass metadata mainly to keep them)
            const existingImages = formData.images.filter(img => !img.file);
            data.append('existing_images', JSON.stringify(existingImages));

            // 2. New images
            const newFiles = formData.images.filter(img => img.file);
            newFiles.forEach(img => {
                if (img.file) data.append('new_images', img.file);
            });

            const res = await fetch(`/api/galleries/${selectedGallery.id}`, {
                method: 'PUT',
                body: data
            });

            if (!res.ok) throw new Error('Gagal memperbarui galeri');

            showToast('success', 'Galeri berhasil diperbarui');
            setShowEditModal(false);
            resetForm();
            fetchGalleries();
        } catch (error: any) {
            showToast('error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedGallery) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/galleries/${selectedGallery.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Gagal menghapus galeri');

            showToast('success', 'Galeri berhasil dihapus');
            setShowDeleteModal(false);
            setSelectedGallery(null);
            fetchGalleries();
        } catch (error: any) {
            showToast('error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Filtering
    const filteredGalleries = galleries.filter(gallery => {
        const matchesSearch = gallery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gallery.linked_to.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || gallery.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Galeri Kegiatan" />

            {/* Header & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Manajemen Galeri
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Kelola dokumentasi kegiatan dan program kerja
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Galeri</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari galeri..."
                        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Type */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[150px]"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="Event">Event</option>
                        <option value="Program Kerja">Program Kerja</option>
                    </select>
                </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
            ) : filteredGalleries.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Belum ada galeri</h3>
                    <p className="text-gray-500 dark:text-gray-400">Mulai dengan menambahkan galeri kegiatan baru</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGalleries.map((gallery) => (
                        <div key={gallery.id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                {gallery.images.length > 0 ? (
                                    <Image
                                        src={gallery.images[0].url}
                                        alt={gallery.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <ImageIcon className="h-10 w-10" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
                                    {gallery.images.length} Foto
                                </div>
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${gallery.type === 'Event'
                                        ? 'bg-blue-500/90 text-white'
                                        : 'bg-purple-500/90 text-white'
                                        }`}>
                                        {gallery.type}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                            {gallery.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {new Date(gallery.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <ExternalLink className="h-3 w-3 text-gray-400" />
                                    <span className="truncate">{gallery.linked_to}</span>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleEditClick(gallery)}
                                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => { setSelectedGallery(gallery); setShowDeleteModal(true); }}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <FormModal
                    onSubmit={handleCreate}
                    onClose={() => setShowCreateModal(false)}
                    formData={formData}
                    setFormData={setFormData}
                    submitting={submitting}
                />
            )}

            {showEditModal && (
                <FormModal
                    isEdit
                    onSubmit={handleUpdate}
                    onClose={() => setShowEditModal(false)}
                    formData={formData}
                    setFormData={setFormData}
                    submitting={submitting}
                />
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Galeri"
                description={`Apakah Anda yakin ingin menghapus galeri "${selectedGallery?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={submitting}
            />
        </div>
    );
}
