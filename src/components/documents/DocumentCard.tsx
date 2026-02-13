
import { FileText, FileSpreadsheet, FileImage, FileArchive, File, Download, Building2, Users, Calendar } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils'; // Assuming formatFileSize is in utils, if not I will add it or copy it.

interface DocumentCardProps {
    document: {
        id: string;
        name: string;
        category: {
            id: string;
            name: string;
            color: string;
        } | null;
        file_url: string;
        file_size: number | null;
        file_type: string | null;
        original_filename: string | null;
        download_count: number;
        published_at: string;
        owner_type: 'hima' | 'division';
        division: {
            id: string;
            name: string;
        } | null;
    };
}

// Helper to get file icon (adapted from admin page)
export function getFileIcon(fileType: string | null, fileName: string | null, className = "h-6 w-6") {
    const type = fileType?.toLowerCase() || fileName?.split('.').pop()?.toLowerCase() || '';

    if (type.includes('pdf')) return <FileText className={`${className} text-red-500`} />;
    if (type.includes('word') || type.includes('doc')) return <FileText className={`${className} text-blue-500`} />;
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return <FileSpreadsheet className={`${className} text-green-500`} />;
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return <FileImage className={`${className} text-purple-500`} />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FileArchive className={`${className} text-yellow-500`} />;
    return <File className={`${className} text-gray-500`} />;
}

export default function DocumentCard({ document }: DocumentCardProps) {
    return (
        <div className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/50">
            {/* Header: Icon & Category */}
            <div className="mb-4 flex items-start justify-between">
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                    {getFileIcon(document.file_type, document.original_filename, "h-8 w-8")}
                </div>
                {document.category && (
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                            backgroundColor: `${document.category.color}15`,
                            color: document.category.color
                        }}
                    >
                        {document.category.name}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="mb-4 flex-1">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors">
                    {document.name}
                </h3>

                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-gray-400">
                    {/* Owner */}
                    <div className="flex items-center gap-1.5">
                        {document.owner_type === 'hima' ? (
                            <>
                                <Building2 className="h-4 w-4" />
                                <span>HIMA Inti</span>
                            </>
                        ) : (
                            <>
                                <Users className="h-4 w-4" />
                                <span>{document.division?.name || 'Divisi'}</span>
                            </>
                        )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(document.published_at)}</span>
                    </div>

                    {/* Size */}
                    <div className="flex items-center gap-1.5">
                        <File className="h-4 w-4" />
                        <span>{formatFileSize(document.file_size)}</span>
                    </div>
                </div>
            </div>

            {/* Footer: Download Action */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <a
                    href={`/api/documents/${document.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-brand-600 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-600 dark:hover:text-white"
                >
                    <Download className="h-4 w-4" />
                    Download
                    {document.download_count > 0 && <span className="ml-1 opacity-70">({document.download_count})</span>}
                </a>
            </div>
        </div>
    );
}
