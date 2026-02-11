import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { ChangeEvent } from 'react';

export interface EventFormData {
    title: string;
    event_date: string;
    event_end_date: string;
    event_time: string;
    event_end_time: string;
    timeline: string;
    location: string;
    description: string;
    kontak: string;
    link_url: string;
    link_text: string;
    is_open: boolean;
}

interface FormModalProps {
    isEdit?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    formData: EventFormData;
    setFormData: (data: EventFormData) => void;
    thumbnailPreview: string | null;
    setThumbnailPreview: (url: string | null) => void;
    setThumbnailFile: (file: File | null) => void;
    handleThumbnailChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeThumbnail: boolean;
    setRemoveThumbnail: (remove: boolean) => void;
    submitting: boolean;
}

export default function FormModal({
    isEdit = false,
    onSubmit,
    onClose,
    formData,
    setFormData,
    thumbnailPreview,
    setThumbnailPreview,
    setThumbnailFile,
    handleThumbnailChange,
    removeThumbnail,
    setRemoveThumbnail,
    submitting
}: FormModalProps) {
    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Event' : 'Tambah Event'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-4 space-y-4">
                    {/* Thumbnail Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Thumbnail (4:5, Max 1MB)
                        </label>
                        <div className="flex items-start gap-4">
                            <div className="relative w-32 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                {thumbnailPreview && !removeThumbnail ? (
                                    <>
                                        <Image
                                            src={thumbnailPreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setThumbnailFile(null);
                                                setThumbnailPreview(null);
                                                setRemoveThumbnail(true);
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Format: JPG, PNG, WebP. Rasio 4:5 (will be cropped automatically)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Judul Event <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Nama event"
                            required
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tanggal Mulai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.event_date}
                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tanggal Selesai
                            </label>
                            <input
                                type="date"
                                value={formData.event_end_date}
                                onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                                min={formData.event_date}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                placeholder="Kosongkan jika hanya 1 hari"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Waktu Mulai
                            </label>
                            <input
                                type="time"
                                value={formData.event_time}
                                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Waktu Selesai
                            </label>
                            <input
                                type="time"
                                value={formData.event_end_time}
                                onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lokasi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Lokasi event"
                            required
                        />
                    </div>

                    {/* Timeline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Timeline
                        </label>
                        <textarea
                            value={formData.timeline}
                            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                            rows={2}
                            placeholder="Jadwal/timeline event (contoh: 08:00 - Registrasi, 09:00 - Opening)"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Deskripsi
                        </label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            placeholder="Deskripsi event"
                        />
                    </div>

                    {/* Kontak */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kontak
                        </label>
                        <input
                            type="text"
                            value={formData.kontak}
                            onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Nomor HP atau email untuk kontak"
                        />
                    </div>

                    {/* Link */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Link Pendaftaran
                            </label>
                            <input
                                type="url"
                                value={formData.link_url}
                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Teks Tombol
                            </label>
                            <input
                                type="text"
                                value={formData.link_text}
                                onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                placeholder="Daftar Sekarang"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_open}
                                onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                        </label>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Status: {formData.is_open ? 'Buka' : 'Tutup'}
                        </span>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>{isEdit ? 'Perbarui' : 'Tambah'} Event</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
