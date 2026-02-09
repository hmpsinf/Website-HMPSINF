"use client";

import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import DivisionCard from "@/components/divisions/DivisionCard";
import DivisionForm from "@/components/divisions/DivisionForm";
import DivisionSkeleton from "@/components/divisions/DivisionSkeleton";
import MemberManagement from "@/components/divisions/MemberManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/components/ui/Toast";
import { DeleteConfirmationModal } from "@/components/ui/modal/DeleteConfirmationModal";

interface Division {
    id: string;
    name: string;
    description: string | null;
    color: string;
    member_count: number;
}

interface DivisionWithMembers extends Division {
    members: {
        id: string;
        member_name: string;
        position: string;
        photo_url: string | null;
        instagram: string | null;
        whatsapp: string | null;
        created_at: string;
    }[];
}

export default function DivisionsPage() {
    const { showToast } = useToast();
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDivision, setEditingDivision] = useState<Division | null>(null);
    const [managingDivision, setManagingDivision] = useState<DivisionWithMembers | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        divisionId: string | null;
        divisionName: string;
    }>({
        isOpen: false,
        divisionId: null,
        divisionName: "",
    });

    const fetchDivisions = async () => {
        try {
            const response = await fetch("/api/divisions");
            if (response.ok) {
                const data = await response.json();
                setDivisions(data);
            }
        } catch (error) {
            console.error("Error fetching divisions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDivisions();
    }, []);

    const handleCreate = async (data: {
        name: string;
        description: string;
        color: string;
    }) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/divisions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setShowForm(false);
                fetchDivisions();
                showToast("success", "Divisi berhasil dibuat");
            } else {
                const error = await response.json();
                showToast("error", error.error || "Gagal membuat divisi");
            }
        } catch (error) {
            showToast("error", "Terjadi kesalahan saat membuat divisi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: {
        name: string;
        description: string;
        color: string;
    }) => {
        if (!editingDivision) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/divisions/${editingDivision.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setEditingDivision(null);
                fetchDivisions();
                showToast("success", "Divisi berhasil diperbarui");
            } else {
                const error = await response.json();
                showToast("error", error.error || "Gagal memperbarui divisi");
            }
        } catch (error) {
            showToast("error", "Terjadi kesalahan saat memperbarui divisi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (division: Division) => {
        setDeleteModal({
            isOpen: true,
            divisionId: division.id,
            divisionName: division.name,
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.divisionId) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/divisions/${deleteModal.divisionId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchDivisions();
                showToast("success", "Divisi berhasil dihapus");
                setDeleteModal((prev) => ({ ...prev, isOpen: false }));
            } else {
                const error = await response.json();
                showToast("error", error.error || "Gagal menghapus divisi");
            }
        } catch (error) {
            showToast("error", "Terjadi kesalahan saat menghapus divisi");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleManageMembers = async (division: Division) => {
        try {
            const response = await fetch(`/api/divisions/${division.id}`);
            if (response.ok) {
                const data = await response.json();
                setManagingDivision(data);
            }
        } catch (error) {
            showToast("error", "Gagal memuat data divisi");
        }
    };

    const refreshManagingDivision = async () => {
        if (!managingDivision) return;
        await handleManageMembers(managingDivision);
        // Also refresh the main list to update member counts
        fetchDivisions();
    };

    return (
        <>
            <PageBreadcrumb pageTitle="Manajemen Divisi" />

            <div className="space-y-6">
                {/* Main Container */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Daftar Divisi
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola divisi dan anggota HMPSINF
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Divisi</span>
                        </button>
                    </div>

                    <div className="p-6">

                        {/* Add/Edit Form Modal */}
                        {(showForm || editingDivision) && (
                            <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
                                <div className="fixed inset-0 h-full w-full bg-black/50" onClick={() => { setShowForm(false); setEditingDivision(null); }} />
                                <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 m-4 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl lg:p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-black dark:text-white">
                                            {editingDivision ? "Edit Divisi" : "Tambah Divisi Baru"}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingDivision(null);
                                            }}
                                            className="text-body hover:text-black dark:text-bodydark dark:hover:text-white"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <DivisionForm
                                        division={editingDivision || undefined}
                                        onSubmit={editingDivision ? handleUpdate : handleCreate}
                                        onCancel={() => {
                                            setShowForm(false);
                                            setEditingDivision(null);
                                        }}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Member Management Modal */}
                        {managingDivision && (
                            <div className="fixed inset-0 z-99999 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4">
                                    <div className="fixed inset-0 h-full w-full bg-black/50" onClick={() => setManagingDivision(null)} />
                                    <div
                                        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xl lg:p-6"
                                        style={{ scrollbarGutter: 'stable' }}
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-black dark:text-white">
                                                Kelola Anggota
                                            </h3>
                                            <button
                                                onClick={() => setManagingDivision(null)}
                                                className="text-body hover:text-black dark:text-bodydark dark:hover:text-white"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <MemberManagement
                                            divisionId={managingDivision.id}
                                            divisionName={managingDivision.name}
                                            divisionColor={managingDivision.color}
                                            members={managingDivision.members}
                                            onRefresh={refreshManagingDivision}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divisions Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <DivisionSkeleton />
                                <DivisionSkeleton />
                                <DivisionSkeleton />
                            </div>
                        ) : divisions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                                <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                    <Plus className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Belum ada divisi
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Mulai dengan menambahkan divisi baru
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {divisions.map((division) => (
                                    <DivisionCard
                                        key={division.id}
                                        division={division}
                                        onEdit={(div) => {
                                            setEditingDivision(div);
                                            setShowForm(true);
                                        }}
                                        onDelete={confirmDelete}
                                        onManageMembers={(div) => {
                                            handleManageMembers(div);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleDelete}
                title="Hapus Divisi"
                description={`Apakah Anda yakin ingin menghapus divisi "${deleteModal.divisionName}"? Tindakan ini tidak dapat dibatalkan dan semua anggota di dalamnya akan ikut terhapus.`}
                isLoading={isDeleting}
            />
        </>
    );
}
