"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, AlertTriangle, Users, Upload, X, Loader2, User, MessageCircle, Instagram } from "lucide-react";
import { ALL_POSITIONS, OFFICER_POSITIONS, MEMBER_POSITION, isPhotoPosition, PHOTO_POSITIONS, DOSEN_PENDAMPING_POSITION } from "@/lib/positions";
import { useToast } from "@/components/ui/Toast";
import { DeleteConfirmationModal } from "@/components/ui/modal/DeleteConfirmationModal";
import { generatePatternSvg } from "@/lib/pattern";

interface Member {
    id: string;
    member_name: string;
    position: string;
    photo_url: string | null;
    instagram: string | null;
    whatsapp: string | null;
    created_at: string;
}

interface MemberManagementProps {
    divisionId: string;
    divisionName: string;
    divisionColor: string;
    members: Member[];
    onRefresh: () => void;
}

export default function MemberManagement({
    divisionId,
    divisionName,
    divisionColor,
    members,
    onRefresh,
}: MemberManagementProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [memberName, setMemberName] = useState("");
    const [position, setPosition] = useState(MEMBER_POSITION);
    const [customPosition, setCustomPosition] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        memberId: string | null;
        memberName: string;
    }>({
        isOpen: false,
        memberId: null,
        memberName: "",
    });
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Photo state
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Social media state
    const [instagram, setInstagram] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    const selectedPosition =
        position === "custom" ? customPosition : position;

    const resetForm = () => {
        setMemberName("");
        setPosition(MEMBER_POSITION);
        setCustomPosition("");
        setPhotoUrl("");
        setPhotoPreview(null);
        setInstagram("");
        setWhatsapp("");
        setIsAdding(false);
        setEditingId(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/divisions/${divisionId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_name: memberName.trim(),
                    position: selectedPosition,
                    instagram: instagram.trim() || null,
                    whatsapp: whatsapp.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.error || "Gagal menambahkan anggota";
                setError(msg);
                showToast("error", msg);
                return;
            }

            resetForm();
            onRefresh();
            showToast("success", "Anggota berhasil ditambahkan");
        } catch (err) {
            const msg = "Terjadi kesalahan saat menambahkan anggota";
            setError(msg);
            showToast("error", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `/api/divisions/${divisionId}/members/${editingId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        member_name: memberName.trim(),
                        position: selectedPosition,
                        photo_url: photoUrl || null,
                        instagram: instagram.trim() || null,
                        whatsapp: whatsapp.trim() || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const msg = data.error || "Gagal memperbarui anggota";
                setError(msg);
                showToast("error", msg);
                return;
            }

            resetForm();
            onRefresh();
            showToast("success", "Anggota berhasil diperbarui");
        } catch (err) {
            const msg = "Terjadi kesalahan saat memperbarui anggota";
            setError(msg);
            showToast("error", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (member: Member) => {
        setDeleteModal({
            isOpen: true,
            memberId: member.id,
            memberName: member.member_name,
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.memberId) return;

        try {
            setIsDeleting(true);
            const response = await fetch(
                `/api/divisions/${divisionId}/members/${deleteModal.memberId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const data = await response.json();
                showToast("error", data.error || "Gagal menghapus anggota");
                return;
            }

            onRefresh();
            showToast("success", "Anggota berhasil dihapus");
            setDeleteModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
            showToast("error", "Terjadi kesalahan saat menghapus anggota");
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (member: Member) => {
        setMemberName(member.member_name);

        if ([...OFFICER_POSITIONS, ...ALL_POSITIONS, MEMBER_POSITION].includes(member.position as any)) {
            setPosition(member.position);
            setCustomPosition("");
        } else {
            setPosition("custom");
            setCustomPosition(member.position);
        }

        // Load photo if exists
        setPhotoUrl(member.photo_url || "");
        setPhotoPreview(member.photo_url || null);

        // Load social media
        setInstagram(member.instagram || "");
        setWhatsapp(member.whatsapp || "");

        setEditingId(member.id);
        setIsAdding(false);
        setError(null);
    };

    // Photo handling for Ketua Divisi positions
    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            showToast("error", "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.");
            return;
        }

        // Validate file size (max 1MB)
        if (file.size > 1 * 1024 * 1024) {
            showToast("error", "Ukuran file maksimal 1MB");
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = (event) => {
            setPhotoPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (editingId) {
                formData.append("member_id", editingId);
            }

            const response = await fetch(`/api/divisions/${divisionId}/members/photo`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal mengupload foto");
            }

            setPhotoUrl(data.url);
            showToast("success", "Foto berhasil diupload");
        } catch (err) {
            setPhotoPreview(null);
            showToast("error", err instanceof Error ? err.message : "Gagal mengupload foto");
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const removePhoto = () => {
        setPhotoUrl("");
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Kelola Anggota
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {divisionName}
                        </p>
                    </div>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </button>
                )}
            </div>

            {/* Error display */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-error-600 dark:bg-error-900/10 dark:border-error-800 dark:text-error-400">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <form
                    onSubmit={editingId ? handleEdit : handleAdd}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {editingId ? "Edit Anggota" : "Tambah Anggota Baru"}
                    </h4>

                    <div className="space-y-4">
                        {/* Member Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama Anggota <span className="text-error-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                placeholder="Masukkan nama anggota"
                                required
                                disabled={isSubmitting}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                            />
                        </div>

                        {/* Position */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Jabatan <span className="text-error-500">*</span>
                            </label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                            >
                                {ALL_POSITIONS.map((pos) => (
                                    <option key={pos} value={pos}>
                                        {pos}
                                    </option>
                                ))}
                                <option value="custom">Jabatan Lainnya...</option>
                            </select>
                        </div>

                        {/* Custom Position Input */}
                        {position === "custom" && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Jabatan Lainnya <span className="text-error-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customPosition}
                                    onChange={(e) => setCustomPosition(e.target.value)}
                                    placeholder="Masukkan nama jabatan"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                                />
                            </div>
                        )}

                        {/* Photo Upload - Only for Ketua Divisi Kampus B/C */}
                        {isPhotoPosition(selectedPosition) && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Foto (Opsional) <span className="text-xs text-gray-400">- Rasio 2:3</span>
                                </label>

                                {/* Photo Preview with 2:3 ratio */}
                                {photoPreview ? (
                                    <div className="relative mx-auto w-32">
                                        <div
                                            className="relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                            style={{ aspectRatio: "2/3" }}
                                        >
                                            <Image
                                                src={photoPreview}
                                                alt="Preview foto"
                                                fill
                                                className="object-cover"
                                            />
                                            {isUploadingPhoto && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removePhoto}
                                            disabled={isUploadingPhoto || isSubmitting}
                                            className="absolute -right-2 -top-2 rounded-full bg-error-500 p-1 text-white shadow-md hover:bg-error-600 disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className="flex cursor-pointer flex-col items-center justify-center mx-auto w-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500 dark:hover:bg-gray-800"
                                        style={{ aspectRatio: "2/3" }}
                                    >
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <User className="h-8 w-8 text-gray-400 mb-2" />
                                            <Upload className="h-5 w-5 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                Upload foto
                                            </span>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            className="hidden"
                                            onChange={handlePhotoSelect}
                                            disabled={isUploadingPhoto || isSubmitting}
                                        />
                                    </label>
                                )}
                                <p className="mt-1.5 text-xs text-gray-400 text-center">
                                    Maks 1MB. Format: JPG, PNG, GIF, WebP
                                </p>
                            </div>
                        )}

                        {/* Instagram */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Instagram <span className="text-xs text-gray-400">(Opsional)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Instagram className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    value={instagram.replace("@", "")}
                                    onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                                    placeholder="username"
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                                />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                WhatsApp <span className="text-xs text-gray-400">(Opsional)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <MessageCircle className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9+]/g, ""))}
                                    placeholder="628xxxxxxxxxx"
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Contoh: 628123456789</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !memberName.trim() || !selectedPosition.trim()}
                                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : editingId
                                        ? "Simpan Perubahan"
                                        : "Tambahkan Anggota"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Members List */}
            <div className="space-y-6">
                {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Belum ada anggota
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Silakan tambahkan anggota baru
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Leaders Section - Pimpinan Divisi with 2:3 photo cards */}
                        {(() => {
                            const leaders = members.filter((m) =>
                                PHOTO_POSITIONS.includes(m.position as any)
                            );
                            if (leaders.length === 0) return null;

                            const patternStyle = {
                                backgroundImage: `url("${generatePatternSvg(divisionColor)}")`,
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'repeat' as const,
                            };

                            return (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Pimpinan Divisi
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {leaders.map((leader) => (
                                            <div
                                                key={leader.id}
                                                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/3"
                                            >
                                                {/* Photo with 2:3 ratio + pattern background */}
                                                <div
                                                    className="relative aspect-2/3 w-full overflow-hidden bg-white dark:bg-gray-900"
                                                    style={patternStyle}
                                                >
                                                    {leader.photo_url ? (
                                                        <Image
                                                            src={leader.photo_url}
                                                            alt={leader.member_name}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                            sizes="(max-width: 640px) 100vw, 50vw"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <User className="h-14 w-14 text-gray-300 dark:text-gray-600" />
                                                        </div>
                                                    )}

                                                    {/* Edit/Delete buttons overlay */}
                                                    <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => startEdit(leader)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(leader)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-error-500 shadow-sm backdrop-blur-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-3.5">
                                                    <div className="mb-2">
                                                        <span
                                                            className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-relaxed text-white"
                                                            style={{ backgroundColor: divisionColor }}
                                                        >
                                                            {leader.position}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-white font-outfit leading-snug wrap-break-word">
                                                        {leader.member_name}
                                                    </p>
                                                    {/* Social Links */}
                                                    {(leader.instagram || leader.whatsapp) && (
                                                        <div className="flex flex-col gap-1.5 mt-2">
                                                            {leader.instagram && (
                                                                <a
                                                                    href={`https://instagram.com/${leader.instagram.replace("@", "")}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title={`Instagram: @${leader.instagram.replace("@", "")}`}
                                                                    className="flex items-center gap-1.5 text-gray-500 hover:text-pink-500 transition-colors dark:text-gray-400 dark:hover:text-pink-400"
                                                                >
                                                                    <Instagram className="h-3.5 w-3.5 shrink-0" />
                                                                    <span className="text-xs break-all leading-tight">@{leader.instagram.replace("@", "")}</span>
                                                                </a>
                                                            )}
                                                            {leader.whatsapp && (
                                                                <a
                                                                    href={`https://wa.me/${leader.whatsapp.replace(/[^0-9]/g, "")}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title={`WhatsApp: ${leader.whatsapp}`}
                                                                    className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors dark:text-gray-400 dark:hover:text-green-400"
                                                                >
                                                                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                                                    <span className="text-xs break-all leading-tight">{leader.whatsapp}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Other Staff/Members Section */}
                        {(() => {
                            const staffMembers = members.filter((m) =>
                                !PHOTO_POSITIONS.includes(m.position as any)
                            );
                            if (staffMembers.length === 0) return null;

                            return (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Staff & Anggota
                                    </h4>
                                    {staffMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Avatar - show photo if available, otherwise show initial */}
                                                {member.photo_url ? (
                                                    <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
                                                        <Image
                                                            src={member.photo_url}
                                                            alt={member.member_name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                        <span className="text-sm font-semibold">
                                                            {member.member_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {member.member_name}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-brand-500 font-medium">
                                                            {member.position}
                                                        </p>
                                                        {/* Social Media Links */}
                                                        {(member.instagram || member.whatsapp) && (
                                                            <div className="flex items-center gap-1.5 ml-2">
                                                                {member.instagram && (
                                                                    <a
                                                                        href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        title={`Instagram: @${member.instagram.replace("@", "")}`}
                                                                        className="text-gray-400 hover:text-pink-500 transition-colors"
                                                                    >
                                                                        <Instagram className="h-3.5 w-3.5" />
                                                                    </a>
                                                                )}
                                                                {member.whatsapp && (
                                                                    <a
                                                                        href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        title={`WhatsApp: ${member.whatsapp}`}
                                                                        className="text-gray-400 hover:text-green-500 transition-colors"
                                                                    >
                                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(member)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white hover:text-brand-600 transition-all dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
                                                    title="Edit anggota"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(member)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:border-error-200 hover:bg-error-50 hover:text-error-600 transition-all dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-error-900/50 dark:hover:bg-error-900/20 dark:hover:text-error-500"
                                                    title="Hapus anggota"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleDelete}
                title="Hapus Anggota"
                description={`Apakah Anda yakin ingin menghapus anggota "${deleteModal.memberName}"?`}
                isLoading={isDeleting}
            />
        </div>
    );
}
