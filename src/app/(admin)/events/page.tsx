'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, X, Edit2, Trash2, Calendar, MapPin,
    ChevronLeft, ChevronRight, Filter, ExternalLink, Clock,
    CheckCircle, XCircle, Image as ImageIcon, Eye, Phone
} from 'lucide-react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';
import RichTextEditor from '@/components/ui/RichTextEditor';
import FormModal from '@/components/admin/events/FormModal';

interface Event {
    id: string;
    title: string;
    thumbnail_url: string | null;
    thumbnail_public_id: string | null;
    event_date: string;
    event_end_date: string | null;
    event_time: string | null;
    timeline: string | null;
    location: string;
    description: string | null;
    kontak: string | null;
    link_url: string | null;
    link_text: string | null;
    is_open: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total: number;
    open: number;
    closed: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Card Skeleton
function CardSkeleton() {
    return (
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-600 rounded" />
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-600 rounded" />
            </div>
        </div>
    );
}

// Stats Card Component
function StatsCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, open: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        event: Event | null;
    }>({
        isOpen: false,
        event: null,
    });
    const [deleting, setDeleting] = useState(false);
    const [previewEvent, setPreviewEvent] = useState<Event | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        event_date: '',
        event_end_date: '',
        event_time: '',
        timeline: '',
        location: '',
        description: '',
        kontak: '',
        link_url: '',
        link_text: '',
        is_open: true,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [removeThumbnail, setRemoveThumbnail] = useState(false);

    const { showToast } = useToast();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch events
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/events?${params}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
                setStats(data.stats);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('error', 'Gagal memuat data event');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, showToast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearch, statusFilter]);

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            event_date: '',
            event_end_date: '',
            event_time: '',
            timeline: '',
            location: '',
            description: '',
            kontak: '',
            link_url: '',
            link_text: '',
            is_open: true,
        });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setRemoveThumbnail(false);
    };

    // Handle thumbnail file selection
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size (max 1MB)
            if (file.size > 1024 * 1024) {
                showToast('error', 'Ukuran gambar maksimal 1MB');
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
            setRemoveThumbnail(false);
        }
    };

    // Handle create
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.event_date || !formData.location) {
            showToast('error', 'Judul, tanggal, dan lokasi wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('event_date', formData.event_date);
            if (formData.event_end_date) fd.append('event_end_date', formData.event_end_date);
            if (formData.event_time) fd.append('event_time', formData.event_time);
            if (formData.timeline) fd.append('timeline', formData.timeline);
            fd.append('location', formData.location);
            if (formData.description) fd.append('description', formData.description);
            if (formData.kontak) fd.append('kontak', formData.kontak);
            if (formData.link_url) fd.append('link_url', formData.link_url);
            if (formData.link_text) fd.append('link_text', formData.link_text);
            fd.append('is_open', formData.is_open.toString());
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

            const res = await fetch('/api/events', {
                method: 'POST',
                body: fd
            });

            if (res.ok) {
                showToast('success', 'Event berhasil ditambahkan');
                setShowCreateModal(false);
                resetForm();
                fetchEvents();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menambah event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            showToast('error', 'Gagal menambah event');
        } finally {
            setSubmitting(false);
        }
    };

    // Open edit modal
    const openEditModal = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            event_date: event.event_date,
            event_end_date: event.event_end_date || '',
            event_time: event.event_time || '',
            timeline: event.timeline || '',
            location: event.location,
            description: event.description || '',
            kontak: event.kontak || '',
            link_url: event.link_url || '',
            link_text: event.link_text || '',
            is_open: event.is_open,
        });
        setThumbnailPreview(event.thumbnail_url);
        setThumbnailFile(null);
        setRemoveThumbnail(false);
        setShowEditModal(true);
    };

    // Handle edit
    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEvent || !formData.title || !formData.event_date || !formData.location) {
            showToast('error', 'Judul, tanggal, dan lokasi wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('event_date', formData.event_date);
            if (formData.event_end_date) fd.append('event_end_date', formData.event_end_date);
            if (formData.event_time) fd.append('event_time', formData.event_time);
            if (formData.timeline) fd.append('timeline', formData.timeline);
            fd.append('location', formData.location);
            if (formData.description) fd.append('description', formData.description);
            if (formData.kontak) fd.append('kontak', formData.kontak);
            if (formData.link_url) fd.append('link_url', formData.link_url);
            if (formData.link_text) fd.append('link_text', formData.link_text);
            fd.append('is_open', formData.is_open.toString());
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
            if (removeThumbnail) fd.append('remove_thumbnail', 'true');

            const res = await fetch(`/api/events/${editingEvent.id}`, {
                method: 'PUT',
                body: fd
            });

            if (res.ok) {
                showToast('success', 'Event berhasil diperbarui');
                setShowEditModal(false);
                setEditingEvent(null);
                resetForm();
                fetchEvents();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal memperbarui event');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            showToast('error', 'Gagal memperbarui event');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle status
    const toggleStatus = async (event: Event) => {
        try {
            const res = await fetch(`/api/events/${event.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_open: !event.is_open })
            });

            if (res.ok) {
                showToast('success', event.is_open ? 'Event ditutup' : 'Event dibuka');
                fetchEvents();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal mengubah status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast('error', 'Gagal mengubah status');
        }
    };

    // Confirm delete
    const confirmDelete = (event: Event) => {
        setDeleteModal({
            isOpen: true,
            event: event,
        });
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteModal.event) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/events/${deleteModal.event.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('success', 'Event berhasil dihapus');
                setDeleteModal({ isOpen: false, event: null });
                fetchEvents();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menghapus event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('error', 'Gagal menghapus event');
        } finally {
            setDeleting(false);
        }
    };

    // Page change
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page }));
        }
    };



    return (
        <div>
            <PageBreadcrumb pageTitle="Event" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatsCard
                        label="Total Event"
                        value={stats.total}
                        icon={<Calendar className="h-5 w-5 text-brand-500" />}
                        color="bg-brand-100 dark:bg-brand-900/30"
                    />
                    <StatsCard
                        label="Event Buka"
                        value={stats.open}
                        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                        color="bg-green-100 dark:bg-green-900/30"
                    />
                    <StatsCard
                        label="Event Tutup"
                        value={stats.closed}
                        icon={<XCircle className="h-5 w-5 text-red-500" />}
                        color="bg-red-100 dark:bg-red-900/30"
                    />
                </div>

                {/* Header & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Manajemen Event
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola event dan kegiatan HIMA
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Event
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari event..."
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
                            <option value="open">Buka</option>
                            <option value="closed">Tutup</option>
                        </select>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                            Belum ada event
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {search || statusFilter ? 'Tidak ada event yang cocok dengan filter' : 'Mulai dengan menambahkan event baru'}
                        </p>
                        {!search && !statusFilter && (
                            <button
                                onClick={() => { resetForm(); setShowCreateModal(true); }}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Event Pertama
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700">
                                    {event.thumbnail_url ? (
                                        <Image
                                            src={event.thumbnail_url}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${event.is_open
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                            }`}>
                                            {event.is_open ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {event.is_open ? 'Buka' : 'Tutup'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-900/60 text-white">
                                            <Eye className="h-3 w-3" />
                                            {event.view_count}
                                        </span>
                                    </div>
                                    {/* Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setPreviewEvent(event)}
                                            className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                                            title="Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(event)}
                                            className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(event)}
                                            className={`p-2 rounded-lg transition-colors ${event.is_open
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                            title={event.is_open ? 'Tutup' : 'Buka'}
                                        >
                                            {event.is_open ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(event)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                        <span>{formatDate(event.event_date)}</span>
                                        {event.event_time && (
                                            <>
                                                <Clock className="h-4 w-4 flex-shrink-0 ml-1" />
                                                <span>{event.event_time}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                        <span className="line-clamp-1">{event.location}</span>
                                    </div>
                                    {event.link_url && (
                                        <a
                                            href={event.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {event.link_text || 'Link Pendaftaran'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} event
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
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingEvent && (
                <FormModal
                    isEdit
                    onSubmit={handleEdit}
                    onClose={() => { setShowEditModal(false); setEditingEvent(null); resetForm(); }}
                    formData={formData}
                    setFormData={setFormData}
                    thumbnailPreview={thumbnailPreview}
                    setThumbnailPreview={setThumbnailPreview}
                    setThumbnailFile={setThumbnailFile}
                    handleThumbnailChange={handleThumbnailChange}
                    removeThumbnail={removeThumbnail}
                    setRemoveThumbnail={setRemoveThumbnail}
                    submitting={submitting}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, event: null })}
                onConfirm={handleDelete}
                isLoading={deleting}
                title="Hapus Event"
                description={`Apakah Anda yakin ingin menghapus event "${deleteModal.event?.title}"? Tindakan ini tidak dapat dibatalkan.`}
            />

            {/* Event Preview Modal */}
            {previewEvent && (
                <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 h-full w-full bg-black/50"
                        onClick={() => setPreviewEvent(null)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header with Image */}
                        <div className="relative">
                            {previewEvent.thumbnail_url ? (
                                <div className="relative h-64 w-full">
                                    <Image
                                        src={previewEvent.thumbnail_url}
                                        alt={previewEvent.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            ) : (
                                <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-600" />
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setPreviewEvent(null)}
                                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${previewEvent.is_open
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                    }`}>
                                    {previewEvent.is_open ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {previewEvent.is_open ? 'Event Buka' : 'Event Tutup'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-black/60 text-white">
                                    <Eye className="h-4 w-4" />
                                    {previewEvent.view_count} dilihat
                                </span>
                            </div>

                            {/* Title Overlay */}
                            {previewEvent.thumbnail_url && (
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                                        {previewEvent.title}
                                    </h2>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)] space-y-5">
                            {/* Title (if no thumbnail) */}
                            {!previewEvent.thumbnail_url && (
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {previewEvent.title}
                                </h2>
                            )}

                            {/* Date, Time, Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <Calendar className="h-5 w-5 text-brand-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Tanggal</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(previewEvent.event_date)}
                                            {previewEvent.event_end_date && previewEvent.event_end_date !== previewEvent.event_date && (
                                                <> - {formatDate(previewEvent.event_end_date)}</>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {previewEvent.event_time && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <Clock className="h-5 w-5 text-brand-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Waktu</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{previewEvent.event_time}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <MapPin className="h-5 w-5 text-brand-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Lokasi</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{previewEvent.location}</p>
                                    </div>
                                </div>

                                {previewEvent.kontak && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <Phone className="h-5 w-5 text-brand-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Kontak</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{previewEvent.kontak}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            {previewEvent.timeline && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Timeline</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">{previewEvent.timeline}</p>
                                </div>
                            )}

                            {/* Description */}
                            {previewEvent.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Deskripsi</h3>
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                                        dangerouslySetInnerHTML={{ __html: previewEvent.description }}
                                    />
                                </div>
                            )}

                            {/* Registration Link */}
                            {previewEvent.link_url && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <a
                                        href={previewEvent.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        {previewEvent.link_text || 'Link Pendaftaran'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
