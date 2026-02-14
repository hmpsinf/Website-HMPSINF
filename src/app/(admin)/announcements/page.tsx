'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, X, Edit2, Trash2, Calendar,
    ChevronLeft, ChevronRight, Filter, ExternalLink,
    CheckCircle, XCircle, Eye, User, FileText
} from 'lucide-react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';
import FormModal, { AnnouncementFormData } from '@/components/admin/pengumuman/FormModal';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    thumbnail_public_id: string | null;
    content: string;
    author: string;
    is_published: boolean;
    published_at: string;
    view_count: number;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Stats {
    total: number;
    published: number;
    draft: number;
}

const StatsCard = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
    </div>
);

const CardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 space-y-4 animate-pulse">
        <div className="aspect-4/5 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
    </div>
);

export default function AnnouncementPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    // Data State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });

    // Filter State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; announcement: Announcement | null }>({
        isOpen: false,
        announcement: null,
    });
    const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);

    // Form State
    const [formData, setFormData] = useState<AnnouncementFormData>({
        title: '',
        content: '',
        is_published: true,
        // published_at removed as per requirement
        published_at: '',
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [removeThumbnail, setRemoveThumbnail] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch Data
    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search,
                status: statusFilter,
            });

            const res = await fetch(`/api/announcements?${params}`);
            const data = await res.json();

            if (res.ok) {
                setAnnouncements(data.data);
                setPagination(prev => ({
                    ...prev,
                    total: data.meta.total,
                    totalPages: data.meta.totalPages
                }));
                setStats(data.stats);
            } else {
                showToast('error', data.error || 'Gagal memuat pengumuman');
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            showToast('error', 'Gagal memuat pengumuman');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter, showToast]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Reset Form
    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            is_published: true,
            published_at: '',
        });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setRemoveThumbnail(false);
        setEditingAnnouncement(null);
    };

    // Handle thumbnail change
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                showToast('error', 'Ukuran gambar maksimal 1MB');
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
            setRemoveThumbnail(false);
        }
    };

    // Handle Create
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            showToast('error', 'Judul wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('content', formData.content);
            fd.append('is_published', formData.is_published.toString());
            if (formData.published_at) fd.append('published_at', formData.published_at);
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

            const res = await fetch('/api/announcements', {
                method: 'POST',
                body: fd
            });

            if (res.ok) {
                showToast('success', 'Pengumuman berhasil ditambahkan');
                setShowCreateModal(false);
                resetForm();
                fetchAnnouncements();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menambah pengumuman');
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            showToast('error', 'Gagal menambah pengumuman');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            is_published: announcement.is_published,
            published_at: announcement.published_at ? new Date(announcement.published_at).toISOString().slice(0, 16) : '',
        });
        setThumbnailPreview(announcement.thumbnail_url);
        setThumbnailFile(null);
        setRemoveThumbnail(false);
        setShowEditModal(true);
    };

    // Handle Edit
    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnnouncement || !formData.title) {
            showToast('error', 'Judul wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('content', formData.content);
            fd.append('is_published', formData.is_published.toString());
            if (formData.published_at) fd.append('published_at', formData.published_at);
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
            if (removeThumbnail) fd.append('remove_thumbnail', 'true');

            const res = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
                method: 'PUT',
                body: fd
            });

            if (res.ok) {
                showToast('success', 'Pengumuman berhasil diperbarui');
                setShowEditModal(false);
                setEditingAnnouncement(null);
                resetForm();
                fetchAnnouncements();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal memperbarui pengumuman');
            }
        } catch (error) {
            console.error('Error updating announcement:', error);
            showToast('error', 'Gagal memperbarui pengumuman');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle Status
    const toggleStatus = async (announcement: Announcement) => {
        try {
            const res = await fetch(`/api/announcements/${announcement.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_published: !announcement.is_published })
            });

            if (res.ok) {
                showToast('success', announcement.is_published ? 'Pengumuman ditarik ke draft' : 'Pengumuman dipublikasikan');
                fetchAnnouncements();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal mengubah status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast('error', 'Gagal mengubah status');
        }
    };

    // Confirm Delete
    const confirmDelete = (announcement: Announcement) => {
        setDeleteModal({
            isOpen: true,
            announcement: announcement,
        });
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!deleteModal.announcement) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/announcements/${deleteModal.announcement.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('success', 'Pengumuman berhasil dihapus');
                setDeleteModal({ isOpen: false, announcement: null });
                fetchAnnouncements();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menghapus pengumuman');
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            showToast('error', 'Gagal menghapus pengumuman');
        } finally {
            setDeleting(false);
        }
    };

    // Page Change
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page }));
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Pengumuman" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatsCard
                        label="Total Pengumuman"
                        value={stats?.total ?? 0}
                        icon={<FileText className="h-5 w-5 text-brand-500" />}
                        color="bg-brand-100 dark:bg-brand-900/30"
                    />
                    <StatsCard
                        label="Dipublikasikan"
                        value={stats?.published ?? 0}
                        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                        color="bg-green-100 dark:bg-green-900/30"
                    />
                    <StatsCard
                        label="Draft"
                        value={stats?.draft ?? 0}
                        icon={<XCircle className="h-5 w-5 text-gray-500" />}
                        color="bg-gray-100 dark:bg-gray-700/50"
                    />
                </div>

                {/* Header & Actions */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                    <div className="flex flex-col gap-4 border-b px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Manajemen Pengumuman
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola pengumuman dan informasi publik
                            </p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pengumuman
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pengumuman..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-10 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="published">Dipublikasikan</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* List/Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                    Belum ada pengumuman
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {search || statusFilter ? 'Tidak ada pengumuman yang cocok dengan filter' : 'Mulai dengan membuat pengumuman baru'}
                                </p>
                                {!search && !statusFilter && (
                                    <button
                                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Buat Pengumuman Baru
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {announcements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 flex flex-col"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-4/5 bg-gray-100 dark:bg-gray-700">
                                            {announcement.thumbnail_url ? (
                                                <Image
                                                    src={announcement.thumbnail_url}
                                                    alt={announcement.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${announcement.is_published
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300'
                                                    }`}>
                                                    {announcement.is_published ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                    {announcement.is_published ? 'Published' : 'Draft'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-900/60 text-white w-fit backdrop-blur-sm">
                                                    <Eye className="h-3 w-3" />
                                                    {announcement.view_count}
                                                </span>
                                            </div>

                                            {/* Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                                <button
                                                    onClick={() => setPreviewAnnouncement(announcement)}
                                                    className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(announcement)}
                                                    className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(announcement)}
                                                    className={`p-2 rounded-lg transition-colors ${announcement.is_published
                                                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                                                        : 'bg-green-500 text-white hover:bg-green-600'
                                                        }`}
                                                    title={announcement.is_published ? 'Jadikan Draft' : 'Publikasikan'}
                                                >
                                                    {announcement.is_published ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(announcement)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <a
                                                    href={`/pengumuman/${announcement.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    title="Lihat di Website"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2" title={announcement.title}>
                                                {announcement.title}
                                            </h3>

                                            <div className="mt-auto space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 shrink-0" />
                                                    <span>{formatDate(announcement.published_at || announcement.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 shrink-0" />
                                                    <span className="line-clamp-1">{announcement.author}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pengumuman
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {pagination.page} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <FormModal
                    onSubmit={handleCreate}
                    onClose={() => { setShowCreateModal(false); resetForm(); }}
                    formData={formData}
                    setFormData={setFormData}
                    thumbnailPreview={thumbnailPreview}
                    setThumbnailPreview={setThumbnailPreview}
                    setThumbnailFile={setThumbnailFile}
                    handleThumbnailChange={handleThumbnailChange}
                    removeThumbnail={removeThumbnail}
                    setRemoveThumbnail={setRemoveThumbnail}
                    submitting={submitting}
                    authorName={user?.name || 'Administrator'}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingAnnouncement && (
                <FormModal
                    isEdit
                    onSubmit={handleEdit}
                    onClose={() => { setShowEditModal(false); setEditingAnnouncement(null); resetForm(); }}
                    formData={formData}
                    setFormData={setFormData}
                    thumbnailPreview={thumbnailPreview}
                    setThumbnailPreview={setThumbnailPreview}
                    setThumbnailFile={setThumbnailFile}
                    handleThumbnailChange={handleThumbnailChange}
                    removeThumbnail={removeThumbnail}
                    setRemoveThumbnail={setRemoveThumbnail}
                    submitting={submitting}
                    authorName={editingAnnouncement.author}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, announcement: null })}
                onConfirm={handleDelete}
                isLoading={deleting}
                title="Hapus Pengumuman"
                description={`Apakah Anda yakin ingin menghapus pengumuman "${deleteModal.announcement?.title}"? Tindakan ini tidak dapat dibatalkan.`}
            />

            {/* Announcement Preview Modal */}
            {previewAnnouncement && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 h-full w-full bg-black/50 backdrop-blur-sm"
                        onClick={() => setPreviewAnnouncement(null)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header with Image or Title */}
                        <div className="relative shrink-0">
                            {previewAnnouncement.thumbnail_url ? (
                                <div className="relative h-64 w-full">
                                    <Image
                                        src={previewAnnouncement.thumbnail_url}
                                        alt={previewAnnouncement.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(previewAnnouncement.published_at)}</span>
                                            <span className="mx-2">•</span>
                                            <User className="h-4 w-4" />
                                            <span>{previewAnnouncement.author}</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white drop-shadow-md line-clamp-2">
                                            {previewAnnouncement.title}
                                        </h2>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(previewAnnouncement.published_at)}</span>
                                        <span className="mx-2">•</span>
                                        <User className="h-4 w-4" />
                                        <span>{previewAnnouncement.author}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">
                                        {previewAnnouncement.title}
                                    </h2>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setPreviewAnnouncement(null)}
                                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md z-10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {previewAnnouncement.content ? (
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-brand-500 hover:prose-a:text-brand-600"
                                    dangerouslySetInnerHTML={{ __html: previewAnnouncement.content }}
                                />
                            ) : (
                                <p className="text-gray-500 italic">Tidak ada konten deskripsi.</p>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 shrink-0">
                            <a
                                href={`/pengumuman/${previewAnnouncement.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Buka di Website
                            </a>
                            <button
                                onClick={() => {
                                    setPreviewAnnouncement(null);
                                    openEditModal(previewAnnouncement);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Pengumuman
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

