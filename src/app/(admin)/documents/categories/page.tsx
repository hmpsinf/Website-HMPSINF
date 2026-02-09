'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, FolderOpen } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';

interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string;
    document_count: number;
    created_at: string;
    updated_at: string;
}

interface FormData {
    name: string;
    description: string;
    color: string;
}

// Skeleton Component
function CategorySkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                </div>
            </div>
        </div>
    );
}

export default function DocumentCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        category: Category | null;
    }>({
        isOpen: false,
        category: null,
    });
    const { showToast } = useToast();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        color: '#3B82F6'
    });

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/document-categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('error', 'Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#3B82F6' });
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#3B82F6' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('error', 'Nama kategori wajib diisi');
            return;
        }

        setSaving(true);
        try {
            const url = editingCategory
                ? `/api/document-categories/${editingCategory.id}`
                : '/api/document-categories';

            const res = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast(
                    'success',
                    editingCategory ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan'
                );
                closeModal();
                fetchCategories();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menyimpan kategori');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            showToast('error', 'Gagal menyimpan kategori');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (category: Category) => {
        if (category.document_count > 0) {
            showToast('error', `Tidak dapat menghapus kategori yang memiliki ${category.document_count} dokumen`);
            return;
        }
        setDeleteModal({
            isOpen: true,
            category: category,
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;

        setDeletingId(deleteModal.category.id);
        try {
            const res = await fetch(`/api/document-categories/${deleteModal.category.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('success', 'Kategori berhasil dihapus');
                setDeleteModal({ isOpen: false, category: null });
                fetchCategories();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menghapus kategori');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('error', 'Gagal menghapus kategori');
        } finally {
            setDeletingId(null);
        }
    };

    // Preset colors
    const presetColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    return (
        <div>
            <PageBreadcrumb pageTitle="Kategori Dokumen" />


            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Kelola Kategori
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Organisir dokumen berdasarkan kategori
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Kategori
                    </button>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div className="grid gap-4">
                        <CategorySkeleton />
                        <CategorySkeleton />
                        <CategorySkeleton />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                            <FolderOpen className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-gray-800 dark:text-white">
                            Belum ada kategori
                        </h3>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Buat kategori untuk mengorganisir dokumen
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 transition-shadow hover:shadow-theme-md"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Color indicator */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${category.color}20` }}
                                    >
                                        <FolderOpen
                                            className="h-6 w-6"
                                            style={{ color: category.color }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate">
                                            {category.name}
                                        </h3>
                                        {category.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                {category.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                            {category.document_count} dokumen
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(category)}
                                            className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(category)}
                                            disabled={deletingId === category.id}
                                            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-99999 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 h-full w-full bg-black/50" onClick={closeModal} />
                        <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl">
                            {/* Header */}
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nama Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Masukkan nama kategori"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Deskripsi kategori (opsional)"
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 resize-none"
                                    />
                                </div>

                                {/* Color */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Warna
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {presetColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                                    >
                                        {saving ? 'Menyimpan...' : editingCategory ? 'Simpan' : 'Tambah'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, category: null })}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${deleteModal.category?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={deletingId === deleteModal.category?.id}
            />
        </div>
    );
}
