"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Skeleton component for loading state
function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
}

export default function SettingsPage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Photo state
    const [photoLoading, setPhotoLoading] = useState(false);

    // Sync form with user data
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            setBio(user.bio || "");
        }
    }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, bio }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast("success", "Profil berhasil diperbarui");
                await refreshUser();
            } else {
                showToast("error", data.error || "Gagal memperbarui profil");
            }
        } catch {
            showToast("error", "Terjadi kesalahan jaringan");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);

        if (newPassword !== confirmPassword) {
            showToast("error", "Password baru tidak cocok");
            setPasswordLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            showToast("error", "Password minimal 6 karakter");
            setPasswordLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/profile/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast("success", "Password berhasil diubah");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                showToast("error", data.error || "Gagal mengubah password");
            }
        } catch {
            showToast("error", "Terjadi kesalahan jaringan");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (1MB max)
        if (file.size > 1024 * 1024) {
            showToast("error", "Ukuran file maksimal 1MB");
            return;
        }

        setPhotoLoading(true);

        const formData = new FormData();
        formData.append("photo", file);

        try {
            const res = await fetch("/api/profile/photo", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                showToast("success", "Foto berhasil diperbarui");
                await refreshUser();
            } else {
                showToast("error", data.error || "Gagal mengupload foto");
            }
        } catch {
            showToast("error", "Terjadi kesalahan jaringan");
        } finally {
            setPhotoLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeletePhoto = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;

        setPhotoLoading(true);

        try {
            const res = await fetch("/api/profile/photo", {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                showToast("success", "Foto berhasil dihapus");
                await refreshUser();
            } else {
                showToast("error", data.error || "Gagal menghapus foto");
            }
        } catch {
            showToast("error", "Terjadi kesalahan jaringan");
        } finally {
            setPhotoLoading(false);
        }
    };

    // Show loading skeleton while auth is loading
    if (authLoading) {
        return (
            <div className="space-y-6">
                <PageBreadcrumb pageTitle="Pengaturan" />

                {/* Photo Section Skeleton */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="flex items-center gap-5">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex gap-3">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-16" />
                        </div>
                    </div>
                </div>

                {/* Profile Form Skeleton */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-4">
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-28 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const photoUrl = user?.photoUrl || "/images/user/owner.jpg";

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Pengaturan" />

            {/* Photo Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
                    Foto Profil
                </h3>

                <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full">
                        <Image
                            src={photoUrl}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <Button
                            size="sm"
                            onClick={handlePhotoClick}
                            disabled={photoLoading}
                        >
                            {photoLoading ? "Mengupload..." : "Ubah Foto"}
                        </Button>
                        {user?.photoUrl && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDeletePhoto}
                                disabled={photoLoading}
                            >
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Format: JPG, PNG, GIF. Maksimal 1MB.
                </p>
            </div>

            {/* Profile Form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
                    Informasi Profil
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <Label>Nama Lengkap <span className="text-error-500">*</span></Label>
                        <Input
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={user?.email || ""}
                            disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah</p>
                    </div>
                    <div>
                        <Label>Nomor Telepon</Label>
                        <Input
                            type="text"
                            placeholder="Masukkan nomor telepon"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Bio</Label>
                        <textarea
                            className="w-full h-24 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            placeholder="Ceritakan tentang diri Anda"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button type="submit" size="sm" disabled={profileLoading}>
                            {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Password Form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
                    Ubah Password
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <Label>Password Saat Ini <span className="text-error-500">*</span></Label>
                        <Input
                            type="password"
                            placeholder="Masukkan password saat ini"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Password Baru <span className="text-error-500">*</span></Label>
                        <Input
                            type="password"
                            placeholder="Masukkan password baru (min. 6 karakter)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Konfirmasi Password Baru <span className="text-error-500">*</span></Label>
                        <Input
                            type="password"
                            placeholder="Masukkan ulang password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button type="submit" size="sm" disabled={passwordLoading}>
                            {passwordLoading ? "Mengubah..." : "Ubah Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
