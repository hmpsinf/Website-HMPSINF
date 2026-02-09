'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, X, Edit2, Trash2, Calendar,
    Target, Briefcase, Filter, ExternalLink,
    CheckCircle, Clock, AlertCircle, XCircle, FileText, Download
} from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmationModal } from '@/components/ui/modal/DeleteConfirmationModal';

interface ProgramKerja {
    id: string;
    title: string;
    description: string | null;
    owner_type: 'hima' | 'division';
    division_id: string | null;
    division_name: string | null;
    division_color: string | null;
    period_id: string;
    period_name: string | null;
    document_id: string | null;
    document_title: string | null;
    document_file_url: string | null;
    status: 'direncanakan' | 'berjalan' | 'selesai' | 'dibatalkan';
    priority: 'rendah' | 'sedang' | 'tinggi';
    start_date: string | null;
    end_date: string | null;
    created_at: string;
}

interface Division {
    id: string;
    name: string;
    color: string;
}

interface Period {
    id: string;
    name: string;
    is_active: boolean;
}

interface Stats {
    total: number;
    direncanakan: number;
    berjalan: number;
    selesai: number;
    dibatalkan: number;
}

const STATUS_CONFIG = {
    direncanakan: {
        label: 'Direncanakan',
        icon: Clock,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        borderColor: 'border-blue-300 dark:border-blue-700',
        headerBg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    berjalan: {
        label: 'Berjalan',
        icon: AlertCircle,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        borderColor: 'border-amber-300 dark:border-amber-700',
        headerBg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    selesai: {
        label: 'Selesai',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        borderColor: 'border-green-300 dark:border-green-700',
        headerBg: 'bg-green-50 dark:bg-green-900/30',
    },
    dibatalkan: {
        label: 'Dibatalkan',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        borderColor: 'border-red-300 dark:border-red-700',
        headerBg: 'bg-red-50 dark:bg-red-900/30',
    },
};

const PRIORITY_CONFIG = {
    tinggi: { label: 'Tinggi', color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
    sedang: { label: 'Sedang', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
    rendah: { label: 'Rendah', color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
};

function formatDate(dateString: string | null) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// Skeleton Components
function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
    );
}

export default function ProgramKerjaPage() {
    const { showToast } = useToast();

    // Data states
    const [programs, setPrograms] = useState<ProgramKerja[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [activePeriod, setActivePeriod] = useState<Period | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, direncanakan: 0, berjalan: 0, selesai: 0, dibatalkan: 0 });

    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'hima' | string>('hima');
    const [periodFilter, setPeriodFilter] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState<ProgramKerja | null>(null);
    const [deleteProgram, setDeleteProgram] = useState<ProgramKerja | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        owner_type: 'hima' as 'hima' | 'division',
        division_id: '',
        period_id: '',
        status: 'direncanakan' as ProgramKerja['status'],
        priority: 'sedang' as ProgramKerja['priority'],
        start_date: '',
        end_date: '',
    });

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (activeTab === 'hima') {
                params.set('owner_type', 'hima');
            } else {
                params.set('owner_type', 'division');
                params.set('division_id', activeTab);
            }

            if (periodFilter) {
                params.set('period_id', periodFilter);
            }

            if (search) {
                params.set('search', search);
            }

            const res = await fetch(`/api/program-kerja?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setPrograms(data.programs || []);
                setDivisions(data.divisions || []);
                setPeriods(data.periods || []);
                setActivePeriod(data.activePeriod || null);
                setStats(data.stats || { total: 0, direncanakan: 0, berjalan: 0, selesai: 0, dibatalkan: 0 });

                // Set default period filter to active period
                if (!periodFilter && data.activePeriod) {
                    setPeriodFilter(data.activePeriod.id);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('error', 'Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    }, [activeTab, periodFilter, search, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            owner_type: activeTab === 'hima' ? 'hima' : 'division',
            division_id: activeTab === 'hima' ? '' : activeTab,
            period_id: activePeriod?.id || '',
            status: 'direncanakan',
            priority: 'sedang',
            start_date: '',
            end_date: '',
        });
        setEditingProgram(null);
    };

    // Open create modal
    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = (program: ProgramKerja) => {
        setFormData({
            title: program.title,
            description: program.description || '',
            owner_type: program.owner_type,
            division_id: program.division_id || '',
            period_id: program.period_id,
            status: program.status,
            priority: program.priority,
            start_date: program.start_date || '',
            end_date: program.end_date || '',
        });
        setEditingProgram(program);
        setShowModal(true);
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = editingProgram ? 'PUT' : 'POST';
            const url = editingProgram
                ? `/api/program-kerja/${editingProgram.id}`
                : '/api/program-kerja';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                showToast(
                    'success',
                    editingProgram ? 'Program kerja berhasil diperbarui' : 'Program kerja berhasil dibuat'
                );
                setShowModal(false);
                fetchData();
            } else {
                showToast('error', data.error || 'Gagal menyimpan');
            }
        } catch (error) {
            console.error('Error saving:', error);
            showToast('error', 'Gagal menyimpan program kerja');
        } finally {
            setSaving(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (program: ProgramKerja, newStatus: ProgramKerja['status']) => {
        try {
            const res = await fetch(`/api/program-kerja/${program.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                showToast('success', 'Status berhasil diperbarui');
                fetchData();
            } else {
                const data = await res.json();
                showToast('error', data.error || 'Gagal mengubah status');
            }
        } catch (error) {
            console.error('Error changing status:', error);
            showToast('error', 'Gagal mengubah status');
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteProgram) return;

        try {
            const res = await fetch(`/api/program-kerja/${deleteProgram.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToast('success', 'Program kerja berhasil dihapus');
                setDeleteProgram(null);
                fetchData();
            } else {
                const data = await res.json();
                showToast('error', data.error || 'Gagal menghapus');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('error', 'Gagal menghapus program kerja');
        }
    };

    // Filter programs by status
    const getProgramsByStatus = (status: ProgramKerja['status']) => {
        return programs.filter((p) => p.status === status);
    };

    // Render program card
    const renderProgramCard = (program: ProgramKerja) => {
        const priorityConfig = PRIORITY_CONFIG[program.priority];

        return (
            <div
                key={program.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
                        {program.title}
                    </h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => openEditModal(program)}
                            className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setDeleteProgram(program)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Hapus"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Description */}
                {program.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {program.description}
                    </p>
                )}

                {/* Priority Badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${priorityConfig.color}`}></span>
                    <span className={`text-xs font-medium ${priorityConfig.textColor}`}>
                        Prioritas {priorityConfig.label}
                    </span>
                </div>

                {/* Date */}
                {(program.start_date || program.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                            {formatDate(program.start_date)}
                            {program.end_date && program.end_date !== program.start_date && (
                                <> - {formatDate(program.end_date)}</>
                            )}
                        </span>
                    </div>
                )}

                {/* Document Link */}
                {program.document_id && program.document_file_url && (
                    <a
                        href={`/api/documents/${program.document_id}/download`}
                        className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{program.document_title || 'Download Dokumen'}</span>
                    </a>
                )}

                {/* Status Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {(['direncanakan', 'berjalan', 'selesai', 'dibatalkan'] as const).map((status) => {
                        const config = STATUS_CONFIG[status];
                        const Icon = config.icon;
                        const isActive = program.status === status;

                        return (
                            <button
                                key={status}
                                onClick={() => !isActive && handleStatusChange(program, status)}
                                className={`p-1.5 rounded-lg transition-colors ${isActive
                                    ? config.color
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                title={config.label}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render status column
    const renderStatusColumn = (status: ProgramKerja['status']) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const statusPrograms = getProgramsByStatus(status);

        return (
            <div className={`flex-1 min-w-[280px] rounded-xl border ${config.borderColor} overflow-hidden`}>
                {/* Column Header */}
                <div className={`${config.headerBg} px-4 py-3 border-b ${config.borderColor}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {config.label}
                            </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            {statusPrograms.length}
                        </span>
                    </div>
                </div>

                {/* Column Content */}
                <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
                    {loading ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : statusPrograms.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Belum ada program</p>
                        </div>
                    ) : (
                        statusPrograms.map(renderProgramCard)
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Program Kerja" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Program Kerja</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activePeriod ? `Periode ${activePeriod.name}` : 'Kelola program kerja HIMA dan Divisi'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Program
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['direncanakan', 'berjalan', 'selesai', 'dibatalkan'] as const).map((status) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    return (
                        <div
                            key={status}
                            className={`${config.headerBg} rounded-xl p-4 border ${config.borderColor}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats[status]}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Tabs */}
                <div className="flex-1 flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('hima')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hima'
                            ? 'bg-brand-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Target className="h-4 w-4" />
                        HIMA Inti
                    </button>
                    {divisions.map((div) => (
                        <button
                            key={div.id}
                            onClick={() => setActiveTab(div.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === div.id
                                ? 'text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            style={activeTab === div.id ? { backgroundColor: div.color } : {}}
                        >
                            <Briefcase className="h-4 w-4" />
                            {div.name}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    {/* Period Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[160px]"
                        >
                            <option value="">Semua Periode</option>
                            {periods.map((period) => (
                                <option key={period.id} value={period.id}>
                                    {period.name} {period.is_active && '(Aktif)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari program..."
                            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 min-w-[200px]"
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
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                {(['direncanakan', 'berjalan', 'selesai', 'dibatalkan'] as const).map((status) => (
                    <div key={status}>
                        {renderStatusColumn(status)}
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingProgram ? 'Edit Program Kerja' : 'Tambah Program Kerja'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Judul Program <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    placeholder="Nama program kerja"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Deskripsi singkat program kerja"
                                />
                            </div>

                            {/* Owner Type & Division */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pemilik <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.owner_type}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            owner_type: e.target.value as 'hima' | 'division',
                                            division_id: e.target.value === 'hima' ? '' : formData.division_id
                                        })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    >
                                        <option value="hima">HIMA Inti</option>
                                        <option value="division">Divisi</option>
                                    </select>
                                </div>

                                {formData.owner_type === 'division' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Divisi <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.division_id}
                                            onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                            required
                                        >
                                            <option value="">Pilih Divisi</option>
                                            {divisions.map((div) => (
                                                <option key={div.id} value={div.id}>{div.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Period */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Periode <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.period_id}
                                    onChange={(e) => setFormData({ ...formData, period_id: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">Pilih Periode</option>
                                    {periods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name} {period.is_active && '(Aktif)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramKerja['status'] })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    >
                                        <option value="direncanakan">Direncanakan</option>
                                        <option value="berjalan">Berjalan</option>
                                        <option value="selesai">Selesai</option>
                                        <option value="dibatalkan">Dibatalkan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Prioritas
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProgramKerja['priority'] })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    >
                                        <option value="tinggi">Tinggi</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="rendah">Rendah</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tanggal Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {saving ? 'Menyimpan...' : editingProgram ? 'Simpan Perubahan' : 'Tambah Program'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deleteProgram}
                onClose={() => setDeleteProgram(null)}
                onConfirm={handleDelete}
                title="Hapus Program Kerja"
                description={`Apakah Anda yakin ingin menghapus program kerja "${deleteProgram?.title}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    );
}
