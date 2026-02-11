'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, X, Edit2, Trash2, Calendar,
    ChevronLeft, ChevronRight, Filter, ExternalLink,
    CheckCircle, XCircle, Image as ImageIcon, Eye, FileText, Tag, MessageCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface News {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    thumbnail_url: string | null;
    thumbnail_public_id: string | null;
    category_id: string | null;
    category_name: string | null;
    category_slug: string | null;
    is_published: boolean;
    view_count: number;
    author_name: string | null;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    comment_count: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Stats {
    total: number;
    published: number;
    draft: number;
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
            <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
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

export default function NewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { user } = useAuth();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        news: News | null;
    }>({
        isOpen: false,
        news: null,
    });
    const [deleting, setDeleting] = useState(false);
    const [previewNews, setPreviewNews] = useState<News | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category_id: '',
        author_name: '',
        is_published: false,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
    });

    // Character limits
    const EXCERPT_LIMIT = 300;
    const CONTENT_LIMIT = 50000;
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [removeThumbnail, setRemoveThumbnail] = useState(false);

    const { showToast } = useToast();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/news/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Fetch news
    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);

            const res = await fetch(`/api/news?${params}`);
            if (res.ok) {
                const data = await res.json();
                setNews(data.news);
                setStats(data.stats);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            showToast('error', 'Gagal memuat data berita');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, categoryFilter, showToast]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearch, statusFilter, categoryFilter]);

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category_id: '',
            author_name: '',
            is_published: false,
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
        });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setRemoveThumbnail(false);
    };

    // Handle thumbnail file selection
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size (max 1MB for news)
            if (file.size > 1 * 1024 * 1024) {
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
        if (!formData.title || !formData.content) {
            showToast('error', 'Judul dan konten wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('content', formData.content);
            if (formData.excerpt) fd.append('excerpt', formData.excerpt);
            if (formData.category_id) fd.append('category_id', formData.category_id);

            // Auto-fill author name with fallback
            const authorName = user?.name || 'Admin HMPSINF';
            fd.append('author_name', authorName);

            fd.append('is_published', formData.is_published.toString());
            if (formData.meta_title) fd.append('meta_title', formData.meta_title);
            if (formData.meta_description) fd.append('meta_description', formData.meta_description);
            if (formData.meta_keywords) fd.append('meta_keywords', formData.meta_keywords);
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

            const res = await fetch('/api/news', {
                method: 'POST',
                body: fd
            });

            if (res.ok) {
                showToast('success', 'Berita berhasil ditambahkan');
                setShowCreateModal(false);
                resetForm();
                fetchNews();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menambah berita');
            }
        } catch (error) {
            console.error('Error creating news:', error);
            showToast('error', 'Gagal menambah berita');
        } finally {
            setSubmitting(false);
        }
    };

    // Open edit modal
    const openEditModal = (item: News) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            excerpt: item.excerpt || '',
            content: item.content,
            category_id: item.category_id || '',
            author_name: item.author_name || '',
            is_published: item.is_published,
            meta_title: item.meta_title || '',
            meta_description: item.meta_description || '',
            meta_keywords: (item as unknown as { meta_keywords?: string }).meta_keywords || '',
        });
        setThumbnailPreview(item.thumbnail_url);
        setThumbnailFile(null);
        setRemoveThumbnail(false);
        setShowEditModal(true);
    };

    // Handle edit
    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNews || !formData.title || !formData.content) {
            showToast('error', 'Judul dan konten wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('content', formData.content);
            if (formData.excerpt) fd.append('excerpt', formData.excerpt);
            if (formData.category_id) fd.append('category_id', formData.category_id);
            if (formData.author_name) fd.append('author_name', formData.author_name);
            fd.append('is_published', formData.is_published.toString());
            if (formData.meta_title) fd.append('meta_title', formData.meta_title);
            if (formData.meta_description) fd.append('meta_description', formData.meta_description);
            if (formData.meta_keywords) fd.append('meta_keywords', formData.meta_keywords);
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
            if (removeThumbnail) fd.append('remove_thumbnail', 'true');

            const res = await fetch(`/api/news/${editingNews.id}`, {
                method: 'PUT',
                body: fd
            });

            if (res.ok) {
                showToast('success', 'Berita berhasil diperbarui');
                setShowEditModal(false);
                setEditingNews(null);
                resetForm();
                fetchNews();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal memperbarui berita');
            }
        } catch (error) {
            console.error('Error updating news:', error);
            showToast('error', 'Gagal memperbarui berita');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle publish status
    const togglePublish = async (item: News) => {
        try {
            const res = await fetch(`/api/news/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_published: !item.is_published })
            });

            if (res.ok) {
                showToast('success', item.is_published ? 'Berita dijadikan draft' : 'Berita dipublikasikan');
                fetchNews();
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
    const confirmDelete = (item: News) => {
        setDeleteModal({
            isOpen: true,
            news: item,
        });
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteModal.news) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/news/${deleteModal.news.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('success', 'Berita berhasil dihapus');
                setDeleteModal({ isOpen: false, news: null });
                fetchNews();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menghapus berita');
            }
        } catch (error) {
            console.error('Error deleting news:', error);
            showToast('error', 'Gagal menghapus berita');
        } finally {
            setDeleting(false);
        }
    };

    // Form Modal Component
    const renderFormModal = (isEdit: boolean) => {
        const onSubmit = isEdit ? handleEdit : handleCreate;
        const onClose = () => {
            if (isEdit) {
                setShowEditModal(false);
                setEditingNews(null);
            } else {
                setShowCreateModal(false);
            }
            resetForm();
        };

        return (
            <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                <div className="fixed inset-0 h-full w-full bg-black/50" onClick={onClose} />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isEdit ? 'Edit Berita' : 'Tambah Berita'}
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Thumbnail (16:9)
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="relative w-64 aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                                    {thumbnailPreview ? (
                                        <>
                                            <Image
                                                src={thumbnailPreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setThumbnailFile(null);
                                                    setThumbnailPreview(null);
                                                    setRemoveThumbnail(true);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                        id="thumbnail-input"
                                    />
                                    <label
                                        htmlFor="thumbnail-input"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl cursor-pointer transition-colors"
                                    >
                                        <ImageIcon className="h-5 w-5" />
                                        {thumbnailPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                    </label>
                                    <p className="mt-2 text-sm text-gray-500">Maks. 1MB. Rasio 16:9.</p>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Judul <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                                placeholder="Judul berita"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kategori
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="">Tanpa Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>


                        {/* Excerpt */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ringkasan
                                </label>
                                <span className={`text-xs ${formData.excerpt.length > EXCERPT_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
                                    {formData.excerpt.length}/{EXCERPT_LIMIT}
                                </span>
                            </div>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => {
                                    if (e.target.value.length <= EXCERPT_LIMIT) {
                                        setFormData({ ...formData, excerpt: e.target.value });
                                    }
                                }}
                                rows={2}
                                maxLength={EXCERPT_LIMIT}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Ringkasan singkat berita (maks 300 karakter)"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Konten <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.content.length > CONTENT_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
                                    {formData.content.length.toLocaleString()}/{CONTENT_LIMIT.toLocaleString()}
                                </span>
                            </div>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(val) => setFormData({ ...formData, content: val })}
                                placeholder="Tulis konten berita..."
                            />
                        </div>

                        {/* SEO Section */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">SEO Metadata</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Meta title untuk SEO"
                                    maxLength={60}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    rows={2}
                                    maxLength={160}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Meta description untuk SEO (maks 160 karakter)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meta Keywords
                                </label>
                                <input
                                    type="text"
                                    value={formData.meta_keywords}
                                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Kata kunci, pisahkan dengan koma"
                                />
                            </div>
                        </div>

                        {/* Publish Status */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Publikasi</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {formData.is_published
                                            ? '✓ Berita akan dipublikasikan dan tampil di halaman publik'
                                            : 'Berita disimpan sebagai draft dan tidak tampil di publik'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_published ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${formData.is_published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                    {formData.is_published ? '● Publikasikan' : '○ Simpan Draft'}
                                </span>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            onClick={onSubmit}
                            disabled={submitting}
                            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                        >
                            {submitting ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Berita" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-4 border-b px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Kelola Berita</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Publikasikan berita dan artikel</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/news/categories"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Tag className="h-4 w-4" />
                            Kategori
                        </Link>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Berita
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatsCard
                            label="Total Berita"
                            value={stats.total}
                            icon={<FileText className="h-5 w-5 text-brand-500" />}
                            color="bg-brand-100 dark:bg-brand-900/30"
                        />
                        <StatsCard
                            label="Dipublikasikan"
                            value={stats.published}
                            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                            color="bg-green-100 dark:bg-green-900/30"
                        />
                        <StatsCard
                            label="Draft"
                            value={stats.draft}
                            icon={<XCircle className="h-5 w-5 text-amber-500" />}
                            color="bg-amber-100 dark:bg-amber-900/30"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berita..."
                                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[180px]"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[180px]"
                            >
                                <option value="">Semua Status</option>
                                <option value="published">Dipublikasikan</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* News Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    ) : news.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
                            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada berita</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Buat berita pertama untuk ditampilkan</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Tambah Berita
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {news.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                                        {item.thumbnail_url ? (
                                            <Image
                                                src={item.thumbnail_url}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}
                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${item.is_published
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                                                }`}>
                                                {item.is_published ? (
                                                    <><CheckCircle className="h-3 w-3" /> Dipublikasikan</>
                                                ) : (
                                                    <><XCircle className="h-3 w-3" /> Draft</>
                                                )}
                                            </span>
                                        </div>
                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setPreviewNews(item)}
                                                className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => togglePublish(item)}
                                                className={`p-2 rounded-lg transition-colors ${item.is_published
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                                    }`}
                                                title={item.is_published ? 'Jadikan Draft' : 'Publikasikan'}
                                            >
                                                {item.is_published ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(item)}
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                            {item.title}
                                        </h3>
                                        {item.excerpt && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {item.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <div className="flex items-center gap-3">
                                                {item.category_name && (
                                                    <span className="inline-flex items-center gap-1 text-brand-500">
                                                        <Tag className="h-3 w-3" />
                                                        {item.category_name}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {item.view_count}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    {item.comment_count}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(item.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                Halaman {pagination.page} dari {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Create Modal */}
                    {showCreateModal && renderFormModal(false)}

                    {/* Edit Modal */}
                    {showEditModal && renderFormModal(true)}

                    {/* Preview Modal */}
                    {previewNews && (
                        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                            <div className="fixed inset-0 h-full w-full bg-black/50" onClick={() => setPreviewNews(null)} />
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden mx-4">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Preview Berita</h2>
                                    <button
                                        onClick={() => setPreviewNews(null)}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {/* Content */}
                                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                                    {previewNews.thumbnail_url && (
                                        <div className="relative aspect-video">
                                            <Image
                                                src={previewNews.thumbnail_url}
                                                alt={previewNews.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${previewNews.is_published
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {previewNews.is_published ? 'Dipublikasikan' : 'Draft'}
                                            </span>
                                            {previewNews.category_name && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-700">
                                                    {previewNews.category_name}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                <Eye className="h-3 w-3" /> {previewNews.view_count} views
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                <MessageCircle className="h-3 w-3" /> {previewNews.comment_count} comments
                                            </span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {previewNews.title}
                                        </h1>
                                        {previewNews.excerpt && (
                                            <p className="text-gray-600 dark:text-gray-400 italic">
                                                {previewNews.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(previewNews.created_at)}
                                        </div>
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: previewNews.content }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    <DeleteConfirmationModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, news: null })}
                        onConfirm={handleDelete}
                        isLoading={deleting}
                        title="Hapus Berita"
                        description={`Apakah Anda yakin ingin menghapus berita "${deleteModal.news?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                    />
                </div>
            </div>
        </div>
    );
}