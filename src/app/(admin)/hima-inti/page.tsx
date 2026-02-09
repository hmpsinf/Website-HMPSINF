"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Settings, Calendar } from "lucide-react";
import {
    PeriodSelector,
    HimaIntiCard,
    HimaIntiForm,
    HimaIntiSkeleton,
} from "@/components/hima-inti";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/components/ui/Toast";
import { DeleteConfirmationModal } from "@/components/ui/modal/DeleteConfirmationModal";
import { DEFAULT_HIMA_INTI_PATTERN_COLOR } from "@/lib/pattern";

// Label posisi HIMA Inti
const POSITION_LABELS: Record<string, string> = {
    dosen_pembimbing: "Dosen Pembimbing",
    ketua: "Ketua Himpunan",
    wakil_ketua: "Wakil Ketua Himpunan",
    sekretaris: "Sekretaris",
    bendahara: "Bendahara",
};

const POSITION_ORDER = [
    "dosen_pembimbing",
    "ketua",
    "wakil_ketua",
    "sekretaris",
    "bendahara",
];

interface Period {
    id: string;
    name: string;
    is_active: number;
}

interface HimaIntiMember {
    id: string;
    period_id: string;
    position: string;
    name: string;
    photo_url: string | null;
    instagram: string | null;
    whatsapp: string | null;
}

export default function HimaIntiPage() {
    const { showToast } = useToast();

    // State untuk periode
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [loadingPeriods, setLoadingPeriods] = useState(true);

    // State untuk anggota
    const [members, setMembers] = useState<HimaIntiMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    // State untuk modal
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [editingMember, setEditingMember] = useState<HimaIntiMember | null>(null);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [newPeriodName, setNewPeriodName] = useState("");
    const [isCreatingPeriod, setIsCreatingPeriod] = useState(false);

    // State untuk delete modal
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        memberId: string | null;
        memberName: string;
    }>({
        isOpen: false,
        memberId: null,
        memberName: "",
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // State untuk pattern color
    const [patternColor, setPatternColor] = useState(DEFAULT_HIMA_INTI_PATTERN_COLOR);

    // Fetch periods
    const fetchPeriods = useCallback(async () => {
        try {
            const response = await fetch("/api/hima-periods");
            if (response.ok) {
                const data = await response.json();
                setPeriods(data);

                // Auto-select active period
                const activePeriod = data.find((p: Period) => p.is_active === 1);
                if (activePeriod && !selectedPeriodId) {
                    setSelectedPeriodId(activePeriod.id);
                }
            }
        } catch (error) {
            console.error("Error fetching periods:", error);
        } finally {
            setLoadingPeriods(false);
        }
    }, [selectedPeriodId]);

    // Fetch pattern color from settings
    const fetchPatternColor = useCallback(async () => {
        try {
            const response = await fetch("/api/settings/hima_inti_pattern_color");
            if (response.ok) {
                const data = await response.json();
                if (data.value) {
                    setPatternColor(data.value);
                }
            }
        } catch (error) {
            console.error("Failed to fetch pattern color:", error);
        }
    }, []);
    const fetchMembers = useCallback(async () => {
        if (!selectedPeriodId) {
            setMembers([]);
            setLoadingMembers(false);
            return;
        }

        setLoadingMembers(true);
        try {
            const response = await fetch(`/api/hima-inti?period_id=${selectedPeriodId}`);
            if (response.ok) {
                const data = await response.json();
                // Sort by position order
                const sorted = data.sort(
                    (a: HimaIntiMember, b: HimaIntiMember) =>
                        POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position)
                );
                setMembers(sorted);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoadingMembers(false);
        }
    }, [selectedPeriodId]);

    useEffect(() => {
        fetchPeriods();
        fetchPatternColor();
    }, [fetchPeriods, fetchPatternColor]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Create new period
    const handleCreatePeriod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPeriodName.trim()) return;

        setIsCreatingPeriod(true);
        try {
            const response = await fetch("/api/hima-periods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newPeriodName.trim(),
                    is_active: periods.length === 0, // Set aktif jika periode pertama
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal membuat periode");
            }

            showToast("success", "Periode berhasil dibuat");
            setNewPeriodName("");
            setShowPeriodModal(false);
            await fetchPeriods();

            // Select new period if it's the first one
            if (periods.length === 0) {
                setSelectedPeriodId(data.id);
            }
        } catch (error) {
            showToast("error", error instanceof Error ? error.message : "Gagal membuat periode");
        } finally {
            setIsCreatingPeriod(false);
        }
    };

    // Delete member
    const confirmDelete = (member: HimaIntiMember) => {
        setDeleteModal({
            isOpen: true,
            memberId: member.id,
            memberName: member.name,
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.memberId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/hima-inti/${deleteModal.memberId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Gagal menghapus anggota");
            }

            showToast("success", "Anggota berhasil dihapus");
            setDeleteModal((prev) => ({ ...prev, isOpen: false }));
            fetchMembers();
        } catch (error) {
            showToast("error", error instanceof Error ? error.message : "Gagal menghapus anggota");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle member form success
    const handleMemberSuccess = () => {
        setShowMemberForm(false);
        setEditingMember(null);
        fetchMembers();
    };

    return (
        <>
            <PageBreadcrumb pageTitle="HIMA Inti" />

            <div className="space-y-6">
                {/* Main Container */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    {/* Header */}
                    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Kepengurusan Inti HMPSINF
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola anggota inti kepengurusan HIMA
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Period Selector */}
                            <PeriodSelector
                                periods={periods}
                                selectedPeriodId={selectedPeriodId}
                                onSelect={setSelectedPeriodId}
                                isLoading={loadingPeriods}
                            />

                            {/* Manage Periods Button */}
                            <button
                                onClick={() => setShowPeriodModal(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                title="Kelola Periode"
                            >
                                <Settings className="h-4 w-4" />
                            </button>

                            {/* Add Member Button */}
                            {selectedPeriodId && (
                                <button
                                    onClick={() => setShowMemberForm(true)}
                                    className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Anggota</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* No period selected state */}
                        {!loadingPeriods && !selectedPeriodId && periods.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                                <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                    <Calendar className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Belum ada periode
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Mulai dengan membuat periode kepengurusan baru
                                </p>
                                <button
                                    onClick={() => setShowPeriodModal(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat Periode
                                </button>
                            </div>
                        )}

                        {/* Loading state */}
                        {loadingMembers && selectedPeriodId && (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {[...Array(5)].map((_, i) => (
                                    <HimaIntiSkeleton key={i} />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loadingMembers && selectedPeriodId && members.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                                <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                    <Plus className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Belum ada anggota
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Mulai dengan menambahkan anggota inti HIMA
                                </p>
                            </div>
                        )}

                        {/* Members Grid - 5 kolom untuk 5 posisi */}
                        {!loadingMembers && selectedPeriodId && members.length > 0 && (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {members.map((member) => (
                                    <HimaIntiCard
                                        key={member.id}
                                        member={member}
                                        positionLabel={POSITION_LABELS[member.position] || member.position}
                                        patternColor={patternColor}
                                        onEdit={(m) => {
                                            setEditingMember(m);
                                            setShowMemberForm(true);
                                        }}
                                        onDelete={confirmDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Form Modal */}
            {showMemberForm && selectedPeriodId && (
                <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                    <div
                        className="fixed inset-0 h-full w-full bg-black/50"
                        onClick={() => {
                            setShowMemberForm(false);
                            setEditingMember(null);
                        }}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 m-4 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl lg:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-black dark:text-white">
                                {editingMember ? "Edit Anggota" : "Tambah Anggota Baru"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowMemberForm(false);
                                    setEditingMember(null);
                                }}
                                className="text-body hover:text-black dark:text-bodydark dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <HimaIntiForm
                            periodId={selectedPeriodId}
                            member={editingMember}
                            onSuccess={handleMemberSuccess}
                            onCancel={() => {
                                setShowMemberForm(false);
                                setEditingMember(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Period Management Modal */}
            {showPeriodModal && (
                <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                    <div
                        className="fixed inset-0 h-full w-full bg-black/50"
                        onClick={() => setShowPeriodModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 m-4 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl lg:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-black dark:text-white">
                                Kelola Periode
                            </h3>
                            <button
                                onClick={() => setShowPeriodModal(false)}
                                className="text-body hover:text-black dark:text-bodydark dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Add new period form */}
                        <form onSubmit={handleCreatePeriod} className="mb-6">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Periode Baru
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPeriodName}
                                    onChange={(e) => setNewPeriodName(e.target.value)}
                                    placeholder="Contoh: 2024/2025"
                                    disabled={isCreatingPeriod}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isCreatingPeriod || !newPeriodName.trim()}
                                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isCreatingPeriod ? "..." : "Tambah"}
                                </button>
                            </div>
                        </form>

                        {/* Period list */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Daftar Periode
                            </h4>
                            {periods.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                                    Belum ada periode
                                </p>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {periods.map((period) => (
                                        <div
                                            key={period.id}
                                            className={`flex items-center justify-between rounded-lg border p-3 ${period.is_active === 1
                                                ? "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10"
                                                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800 dark:text-white">
                                                    {period.name}
                                                </span>
                                                {period.is_active === 1 && (
                                                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            {period.is_active !== 1 && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch(`/api/hima-periods/${period.id}`, {
                                                                method: "PUT",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ is_active: true }),
                                                            });
                                                            if (response.ok) {
                                                                showToast("success", "Periode diaktifkan");
                                                                fetchPeriods();
                                                            }
                                                        } catch {
                                                            showToast("error", "Gagal mengaktifkan periode");
                                                        }
                                                    }}
                                                    className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                                                >
                                                    Aktifkan
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleDelete}
                title="Hapus Anggota"
                description={`Apakah Anda yakin ingin menghapus "${deleteModal.memberName}"?`}
                isLoading={isDeleting}
            />
        </>
    );
}
