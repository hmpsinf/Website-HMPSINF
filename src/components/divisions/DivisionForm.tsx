"use client";

import React, { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";

interface DivisionFormProps {
    division?: {
        id: string;
        name: string;
        description: string | null;
        color: string;
    };
    onSubmit: (data: {
        name: string;
        description: string;
        color: string;
    }) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function DivisionForm({
    division,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: DivisionFormProps) {
    const [name, setName] = useState(division?.name || "");
    const [description, setDescription] = useState(division?.description || "");
    const [color, setColor] = useState(division?.color || "#3B82F6");

    useEffect(() => {
        if (division) {
            setName(division.name);
            setDescription(division.description || "");
            setColor(division.color);
        }
    }, [division]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ name, description, color });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Division Name */}
            <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Nama Divisi <span className="text-meta-1">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama divisi"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none focus:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-brand-500"
                />
            </div>

            {/* Description */}
            <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Deskripsi
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masukkan deskripsi divisi (opsional)"
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none focus:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-brand-500"
                />
            </div>

            {/* Color Picker */}
            <ColorPicker selectedColor={color} onColorChange={setColor} />

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-md border border-stroke px-5 py-3 text-center font-medium text-black hover:shadow-1 disabled:cursor-default disabled:opacity-50 dark:border-strokedark dark:text-white"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:cursor-default disabled:opacity-50"
                >
                    {isSubmitting ? "Menyimpan..." : division ? "Perbarui" : "Tambahkan"}
                </button>
            </div>
        </form>
    );
}
