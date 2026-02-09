"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, FolderOpen } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/components/ui/Toast";
import { DeleteConfirmationModal } from "@/components/ui/modal/DeleteConfirmationModal";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    news_count: number;
    created_at: string;
}

export default function NewsCategoriesPage() {
    const { showToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        category: Category | null;
    }>({
        isOpen: false,
        category: null,
    });

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/news/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            showToast("error", "Gagal memuat kategori");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({ name: "", description: "" });
        setEditingCategory(null);
        setShowForm(false);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast("error", "Nama kategori harus diisi");
            return;
        }

        setIsSubmitting(true);
        try {
            const url = editingCategory
                ? `/api/news/categories/${editingCategory.id}`
                : "/api/news/categories";
            const method = editingCategory ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showToast("success", editingCategory ? "Kategori berhasil diperbarui" : "Kategori berhasil dibuat");
                resetForm();
                fetchCategories();
            } else {
                const error = await response.json();
                showToast("error", error.error || "Gagal menyimpan kategori");
            }
        } catch (error) {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/news/categories/${deleteModal.category.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showToast("success", "Kategori berhasil dihapus");
                setDeleteModal({ isOpen: false, category: null });
                fetchCategories();
            } else {
                const error = await response.json();
                showToast("error", error.error || "Gagal menghapus kategori");
            }
        } catch (error) {
            showToast("error", "Terjadi kesalahan");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Kategori Berita" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Kategori Berita
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Kelola kategori untuk berita
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Kategori
                </button>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
                    <FolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Belum ada kategori
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Tambahkan kategori pertama untuk mengorganisir berita
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Kategori
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {category.name}
                                </h3>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, category })}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {category.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                    {category.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Slug: <code className="text-brand-500">{category.slug}</code>
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                                    {category.news_count} berita
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                    <div className="fixed inset-0 h-full w-full bg-black/50" onClick={resetForm} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Kategori <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Contoh: Teknologi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Deskripsi singkat kategori (opsional)"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                                >
                                    {isSubmitting ? "Menyimpan..." : editingCategory ? "Perbarui" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, category: null })}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${deleteModal.category?.name}"? Kategori dengan berita tidak dapat dihapus.`}
            />
        </div>
    );
}
