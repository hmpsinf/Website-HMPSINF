
import DocumentCard from './DocumentCard';
import { Document } from '@/lib/queries/documents';
import { FileQuestion } from 'lucide-react';

interface DocumentGridProps {
    documents: Document[];
}

export default function DocumentGrid({ documents }: DocumentGridProps) {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                    <FileQuestion className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tidak ada dokumen
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">
                    Belum ada dokumen yang tersedia untuk filter yang dipilih.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
            ))}
        </div>
    );
}
