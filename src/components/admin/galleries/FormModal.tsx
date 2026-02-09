'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import GalleryImageUpload from './GalleryImageUpload';

export interface GalleryFormData {
    title: string;
    description: string;
    event_id: string | null;
    program_kerja_id: string | null;
    images: { file?: File; url: string; public_id?: string; caption?: string }[];
}

interface Option {
    id: string;
    title: string;
}

interface FormModalProps {
    isEdit?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    formData: GalleryFormData;
    setFormData: (data: GalleryFormData) => void;
    submitting: boolean;
}

export default function FormModal({
    isEdit = false,
    onSubmit,
    onClose,
    formData,
    setFormData,
    submitting
}: FormModalProps) {
    const [sourceType, setSourceType] = useState<'event' | 'program_kerja'>(
        formData.program_kerja_id ? 'program_kerja' : 'event'
    );
    const [options, setOptions] = useState<Option[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchOptions = async () => {
            setLoadingOptions(true);
            try {
                const endpoint = sourceType === 'event'
                    ? '/api/events/options'
                    : '/api/program-kerja/options';
                const res = await fetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    setOptions(data);
                }
            } catch (error) {
                console.error('Failed to fetch options', error);
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, [sourceType]);

    const filteredOptions = options.filter(opt =>
        opt.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSourceTypeChange = (type: 'event' | 'program_kerja') => {
        setSourceType(type);
        setFormData({
            ...formData,
            event_id: null,
            program_kerja_id: null
        });
        setSearchQuery('');
    };

    const selectedId = sourceType === 'event' ? formData.event_id : formData.program_kerja_id;

    const handleSelectOption = (id: string) => {
        if (sourceType === 'event') {
            setFormData({ ...formData, event_id: id, program_kerja_id: null });
        } else {
            setFormData({ ...formData, event_id: null, program_kerja_id: id });
        }
    };

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Galeri' : 'Tambah Galeri'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">

                    {/* Source Type & Source Select */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sumber <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={sourceType}
                                onChange={(e) => handleSourceTypeChange(e.target.value as 'event' | 'program_kerja')}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                            >
                                <option value="event">Event / Kegiatan</option>
                                <option value="program_kerja">Program Kerja</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pilih {sourceType === 'event' ? 'Event' : 'Program Kerja'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedId || ''}
                                    onChange={(e) => handleSelectOption(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">
                                        {loadingOptions ? 'Memuat...' : `Pilih ${sourceType === 'event' ? 'Event' : 'Proker'}`}
                                    </option>
                                    {options.map((opt) => (
                                        <option key={opt.id} value={opt.id}>{opt.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Judul Galeri <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                            placeholder="Nama galeri dokumentasi"
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
                            placeholder="Deskripsi singkat galeri"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <GalleryImageUpload
                            images={formData.images}
                            onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (!formData.event_id && !formData.program_kerja_id)}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Galeri'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
