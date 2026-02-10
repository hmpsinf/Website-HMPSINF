'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, X, Download, Edit2, Trash2,
    FileText, FileSpreadsheet, FileImage, FileArchive, File,
    ChevronLeft, ChevronRight, Upload, Filter, FolderOpen,
    Building2, Users
} from 'lucide-react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Division {
    id: string;
    name: string;
}

interface Document {
    id: string;
    name: string;
    category: Category | null;
    file_url: string;
    file_public_id: string;
    file_size: number | null;
    file_type: string | null;
    original_filename: string | null;
    download_count: number;
    published_at: string;
    owner_type: 'hima' | 'division';
    division_id: string | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Get file icon based on type
function getFileIcon(fileType: string | null, fileName: string | null) {
    const type = fileType?.toLowerCase() || fileName?.split('.').pop()?.toLowerCase() || '';

    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return <FileImage className="h-5 w-5 text-purple-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FileArchive className="h-5 w-5 text-yellow-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
}

// Format file size
function formatFileSize(bytes: number | null): string {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Table Skeleton
function TableSkeleton() {
    return (
        <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1">
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                    <div className="w-20 h-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="w-16 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
            ))}
        </div>
    );
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Filters
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOwner, setSelectedOwner] = useState(''); // '' (all), 'hima', 'division'
    const [selectedDivision, setSelectedDivision] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        document: Document | null;
    }>({
        isOpen: false,
        document: null,
    });

    // Form states
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadName, setUploadName] = useState('');
    const [uploadCategory, setUploadCategory] = useState('');
    const [uploadOwnerType, setUploadOwnerType] = useState('hima');
    const [uploadDivisionId, setUploadDivisionId] = useState('');
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');

    const { showToast } = useToast();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch categories and divisions
    const fetchMetadata = useCallback(async () => {
        try {
            const [catRes, divRes] = await Promise.all([
                fetch('/api/document-categories'),
                fetch('/api/divisions')
            ]);

            if (catRes.ok) {
                const data = await catRes.json();
                setCategories(data);
            }
            if (divRes.ok) {
                const data = await divRes.json();
                setDivisions(data);
            }
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    }, []);

    // Fetch documents
    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedOwner) params.append('owner_type', selectedOwner);
            if (selectedDivision) params.append('division_id', selectedDivision);

            const res = await fetch(`/api/documents?${params}`);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            showToast('error', 'Gagal memuat dokumen');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, debouncedSearch, selectedCategory, selectedOwner, selectedDivision, showToast]);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearch, selectedCategory, selectedOwner, selectedDivision]);

    // Handle file upload
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) {
            showToast('error', 'Pilih file untuk diupload');
            return;
        }

        if (uploadOwnerType === 'division' && !uploadDivisionId) {
            showToast('error', 'Pilih divisi untuk dokumen divisi');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            if (uploadName) formData.append('name', uploadName);
            if (uploadCategory) formData.append('category_id', uploadCategory);
            formData.append('owner_type', uploadOwnerType);
            if (uploadOwnerType === 'division' && uploadDivisionId) {
                formData.append('division_id', uploadDivisionId);
            }

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                showToast('success', 'Dokumen berhasil diupload');
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadName('');
                setUploadCategory('');
                setUploadOwnerType('hima');
                setUploadDivisionId('');
                fetchDocuments();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal mengupload dokumen');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            showToast('error', 'Gagal mengupload dokumen');
        } finally {
            setUploading(false);
        }
    };

    // Handle edit
    const openEditModal = (doc: Document) => {
        setEditingDocument(doc);
        setEditName(doc.name);
        setEditCategory(doc.category?.id || '');
        setShowEditModal(true);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDocument || !editName.trim()) return;

        setUploading(true);
        try {
            const res = await fetch(`/api/documents/${editingDocument.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    category_id: editCategory || null
                })
            });

            if (res.ok) {
                showToast('success', 'Dokumen berhasil diperbarui');
                setShowEditModal(false);
                setEditingDocument(null);
                fetchDocuments();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal memperbarui dokumen');
            }
        } catch (error) {
            console.error('Error updating document:', error);
            showToast('error', 'Gagal memperbarui dokumen');
        } finally {
            setUploading(false);
        }
    };

    // Confirm delete
    const confirmDelete = (doc: Document) => {
        setDeleteModal({
            isOpen: true,
            document: doc,
        });
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteModal.document) return;

        setDeletingId(deleteModal.document.id);
        try {
            const res = await fetch(`/api/documents/${deleteModal.document.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('success', 'Dokumen berhasil dihapus');
                setDeleteModal({ isOpen: false, document: null });
                fetchDocuments();
            } else {
                const error = await res.json();
                showToast('error', error.error || 'Gagal menghapus dokumen');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            showToast('error', 'Gagal menghapus dokumen');
        } finally {
            setDeletingId(null);
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
            <PageBreadcrumb pageTitle="Dokumen" />


            <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-4 border-b px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Manajemen Dokumen
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Upload dan kelola dokumen untuk dipublikasikan
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/documents/categories"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FolderOpen className="h-4 w-4" />
                                Kategori
                            </Link>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                            >
                                <Plus className="h-4 w-4" />
                                Upload Dokumen
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari dokumen..."
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
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[150px]"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Owner Filter */}
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedOwner}
                                    onChange={(e) => {
                                        setSelectedOwner(e.target.value);
                                        if (e.target.value !== 'division') setSelectedDivision('');
                                    }}
                                    className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[150px]"
                                >
                                    <option value="">Semua Pemilik</option>
                                    <option value="hima">HIMA Inti</option>
                                    <option value="division">Divisi</option>
                                </select>
                            </div>

                            {/* Division Filter */}
                            {selectedOwner === 'division' && (
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <select
                                        value={selectedDivision}
                                        onChange={(e) => setSelectedDivision(e.target.value)}
                                        className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[150px]"
                                    >
                                        <option value="">Semua Divisi</option>
                                        {divisions.map((div) => (
                                            <option key={div.id} value={div.id}>{div.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <div className="min-w-[700px]">
                                    <Table>
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-900/50">
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Nama File
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Kategori & Pemilik
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Tanggal Publish
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                                                    Download
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                                                    Aksi
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell className="p-0" colSpan={5}>
                                                        <TableSkeleton />
                                                    </TableCell>
                                                </TableRow>
                                            ) : documents.length === 0 ? (
                                                <TableRow>
                                                    <TableCell className="px-5 py-12 text-center" colSpan={5}>
                                                        <div className="flex flex-col items-center">
                                                            <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                                                <FileText className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {search || selectedCategory || selectedOwner ? 'Tidak ada dokumen yang cocok' : 'Belum ada dokumen'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                documents.map((doc) => (
                                                    <TableRow key={doc.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <TableCell className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                                    {getFileIcon(doc.file_type, doc.original_filename)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-gray-800 dark:text-white truncate">
                                                                        {doc.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {formatFileSize(doc.file_size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-4">
                                                            <div className="flex flex-col gap-1.5 items-start">
                                                                {doc.category ? (
                                                                    <span
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor: `${doc.category.color}15`,
                                                                            color: doc.category.color
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className="w-1.5 h-1.5 rounded-full"
                                                                            style={{ backgroundColor: doc.category.color }}
                                                                        />
                                                                        {doc.category.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">-</span>
                                                                )}

                                                                {/* Owner Badge */}
                                                                {doc.owner_type === 'hima' ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                                                        <Building2 className="w-3 h-3" />
                                                                        HIMA Inti
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
                                                                        <Users className="w-3 h-3" />
                                                                        {divisions.find(d => d.id === doc.division_id)?.name || 'Divisi'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(doc.published_at)}
                                                        </TableCell>
                                                        <TableCell className="px-5 py-4 text-center">
                                                            <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                                <Download className="h-3.5 w-3.5" />
                                                                {doc.download_count}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-4">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <a
                                                                    href={`/api/documents/${doc.id}/download`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                                                                    title="Download"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                                <button
                                                                    onClick={() => openEditModal(doc)}
                                                                    className="p-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmDelete(doc)}
                                                                    disabled={deletingId === doc.id}
                                                                    className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/[0.05] px-5 py-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} dokumen
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        {/* Page numbers */}
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page >= pagination.totalPages - 2) {
                                                    pageNum = pagination.totalPages - 4 + i;
                                                } else {
                                                    pageNum = pagination.page - 2 + i;
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => goToPage(pageNum)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.page === pageNum
                                                            ? 'bg-brand-500 text-white'
                                                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => goToPage(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Modal */}
                    {showUploadModal && (
                        <div className="fixed inset-0 z-99999 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <div className="fixed inset-0 h-full w-full bg-black/50" onClick={() => setShowUploadModal(false)} />
                                <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl">
                                    <div className="mb-5 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Upload Dokumen
                                        </h3>
                                        <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpload} className="space-y-5">
                                        {/* File Drop Zone */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                File <span className="text-red-500">*</span>
                                            </label>
                                            <div
                                                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploadFile
                                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                                    : 'border-gray-300 dark:border-gray-700 hover:border-brand-400'
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setUploadFile(file);
                                                            if (!uploadName) setUploadName(file.name.replace(/\.[^/.]+$/, ''));
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {uploadFile ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        {getFileIcon(uploadFile.type, uploadFile.name)}
                                                        <div className="text-left">
                                                            <p className="font-medium text-gray-800 dark:text-white truncate max-w-[200px]">
                                                                {uploadFile.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(uploadFile.size)}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setUploadFile(null);
                                                            }}
                                                            className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Klik atau drag file ke sini
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Semua format file didukung
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nama Dokumen
                                            </label>
                                            <input
                                                type="text"
                                                value={uploadName}
                                                onChange={(e) => setUploadName(e.target.value)}
                                                placeholder="Nama untuk ditampilkan"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Kategori
                                            </label>
                                            <select
                                                value={uploadCategory}
                                                onChange={(e) => setUploadCategory(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="">Pilih kategori (opsional)</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Owner Selection */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Pemilik Dokumen
                                            </label>
                                            <div className="flex items-center gap-4 mb-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="owner_type"
                                                        value="hima"
                                                        checked={uploadOwnerType === 'hima'}
                                                        onChange={() => setUploadOwnerType('hima')}
                                                        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">HIMA Inti</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="owner_type"
                                                        value="division"
                                                        checked={uploadOwnerType === 'division'}
                                                        onChange={() => setUploadOwnerType('division')}
                                                        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Divisi</span>
                                                </label>
                                            </div>

                                            {/* Division Dropdown */}
                                            {uploadOwnerType === 'division' && (
                                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <select
                                                        value={uploadDivisionId}
                                                        onChange={(e) => setUploadDivisionId(e.target.value)}
                                                        required
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    >
                                                        <option value="">Pilih Divisi</option>
                                                        {divisions.map((div) => (
                                                            <option key={div.id} value={div.id}>{div.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowUploadModal(false)}
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={uploading || !uploadFile}
                                                className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                                            >
                                                {uploading ? 'Mengupload...' : 'Upload'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {showEditModal && editingDocument && (
                        <div className="fixed inset-0 z-99999 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <div className="fixed inset-0 h-full w-full bg-black/50" onClick={() => setShowEditModal(false)} />
                                <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl">
                                    <div className="mb-5 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Edit Dokumen
                                        </h3>
                                        <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleEdit} className="space-y-5">
                                        {/* Name */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nama Dokumen <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Kategori
                                            </label>
                                            <select
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="">Tanpa kategori</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={uploading || !editName.trim()}
                                                className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                                            >
                                                {uploading ? 'Menyimpan...' : 'Simpan'}
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
                        onClose={() => setDeleteModal({ isOpen: false, document: null })}
                        onConfirm={handleDelete}
                        title="Hapus Dokumen"
                        description={`Apakah Anda yakin ingin menghapus dokumen "${deleteModal.document?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                        isLoading={deletingId === deleteModal.document?.id}
                    />
                </div>
            </div>
        </div>
    );
} 
