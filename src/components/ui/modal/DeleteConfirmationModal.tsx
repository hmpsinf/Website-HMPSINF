"use client";
import React from "react";
import { Modal } from "./index";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-md p-6"
            showCloseButton={false}
            overlayClassName="fixed inset-0 h-full w-full bg-black/50"
        >
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h3>

                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>

                <div className="flex w-full gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500/40 disabled:opacity-50"
                    >
                        {isLoading ? "Menghapus..." : "Hapus"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
