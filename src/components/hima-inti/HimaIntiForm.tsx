"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { User, Upload, X, Instagram, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Label posisi HIMA Inti
const POSITION_OPTIONS = [
    { value: "dosen_pembimbing", label: "Dosen Pembimbing" },
    { value: "ketua", label: "Ketua Himpunan" },
    { value: "wakil_ketua", label: "Wakil Ketua Himpunan" },
    { value: "sekretaris", label: "Sekretaris" },
    { value: "bendahara", label: "Bendahara" },
];

interface HimaIntiMember {
    id: string;
    period_id: string;
    position: string;
    name: string;
    photo_url: string | null;
    instagram: string | null;
    whatsapp: string | null;
}

interface HimaIntiFormProps {
    periodId: string;
    member?: HimaIntiMember | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function HimaIntiForm({
    periodId,
    member,
    onSuccess,
    onCancel,
}: HimaIntiFormProps) {
    const isEditing = !!member;
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [name, setName] = useState(member?.name || "");
    const [position, setPosition] = useState(member?.position || "ketua");
    const [instagram, setInstagram] = useState(member?.instagram || "");
    const [whatsapp, setWhatsapp] = useState(member?.whatsapp || "");
    const [photoUrl, setPhotoUrl] = useState(member?.photo_url || "");
    const [photoPreview, setPhotoPreview] = useState<string | null>(member?.photo_url || null);

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi tipe file
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            showToast("error", "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.");
            return;
        }

        // Validasi ukuran file (maks 1MB)
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
            if (member?.id) {
                formData.append("member_id", member.id);
            }

            const response = await fetch("/api/hima-inti/photo", {
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
            setPhotoPreview(member?.photo_url || null);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const payload = {
                period_id: periodId,
                position,
                name: name.trim(),
                photo_url: photoUrl || null,
                instagram: instagram.trim() || null,
                whatsapp: whatsapp.trim() || null,
            };

            let url = "/api/hima-inti";
            let method = "POST";

            // Jika edit, gunakan endpoint dengan ID
            if (isEditing && member) {
                url = `/api/hima-inti/${member.id}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal menyimpan data");
            }

            showToast("success", isEditing ? "Anggota berhasil diperbarui" : "Anggota berhasil ditambahkan");
            onSuccess();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(msg);
            showToast("error", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error display */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-error-600 dark:bg-error-900/10 dark:border-error-800 dark:text-error-400">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Photo upload area */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Foto (rasio 2:3, maks 1MB)
                </label>
                <div className="flex items-start gap-4">
                    {/* Photo preview */}
                    <div className="relative aspect-[2/3] h-48 w-32 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {photoPreview ? (
                            <>
                                <Image
                                    src={photoPreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    disabled={isUploadingPhoto}
                                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-error-500 text-white hover:bg-error-600 disabled:opacity-50"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                {/* Loading overlay */}
                                {isUploadingPhoto && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                                        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                <User className="h-10 w-10 mb-1" />
                                <span className="text-xs">2:3</span>
                            </div>
                        )}
                    </div>

                    {/* Upload button */}
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Upload className="h-4 w-4" />
                            {isUploadingPhoto ? "Mengupload..." : "Pilih Foto"}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG, GIF, WebP
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                    />
                </div>
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
                    {POSITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Name */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Lengkap <span className="text-error-500">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                />
            </div>

            {/* Social media row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Instagram */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-1.5">
                            <Instagram className="h-3.5 w-3.5" />
                            Instagram
                        </span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                        <input
                            type="text"
                            value={instagram.replace("@", "")}
                            onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                            placeholder="username"
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                        />
                    </div>
                </div>

                {/* WhatsApp */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                        </span>
                    </label>
                    <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                    {isSubmitting
                        ? "Menyimpan..."
                        : isEditing
                            ? "Simpan Perubahan"
                            : "Tambahkan Anggota"}
                </button>
            </div>
        </form>
    );
}
