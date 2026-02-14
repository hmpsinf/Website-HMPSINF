import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight, Eye, FileText } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface Announcement {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    published_at: string;
    author: string;
    view_count: number;
    content: string; // Needed for excerpt if we want, but might be too heavy. Let's assume we pass truncated content or just use title.
}

interface Props {
    announcement: Announcement;
    priority?: boolean;
}

export default function AnnouncementCard({ announcement, priority = false }: Props) {
    // Generate excerpt from content (strip HTML tags and truncate)
    const strippedContent = announcement.content.replace(/<[^>]+>/g, '');
    const excerpt = strippedContent.length > 100
        ? strippedContent.substring(0, 100) + '...'
        : strippedContent;

    return (
        <Link
            href={`/pengumuman/${announcement.slug}`}
            className="group flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-brand-900/10"
        >
            {/* Image Container - Aspect Ratio 4:5 */}
            <div className="relative aspect-4/5 overflow-hidden bg-gray-100 dark:bg-gray-800">
                {announcement.thumbnail_url ? (
                    <Image
                        src={announcement.thumbnail_url}
                        alt={announcement.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-50 dark:bg-brand-900/10 transition-colors group-hover:bg-brand-100 dark:group-hover:bg-brand-900/20">
                        <FileText className="w-16 h-16 text-brand-200 dark:text-brand-800 group-hover:text-brand-300 dark:group-hover:text-brand-700 transition-colors duration-500" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* View Count Badge */}
                <div className="absolute top-4 right-4 z-10">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/20 shadow-sm bg-black/40 text-white">
                        <Eye className="w-3 h-3" />
                        {announcement.view_count}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col grow p-5">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        <span>{formatDate(announcement.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-500" />
                        <span className="line-clamp-1 max-w-[100px]">{announcement.author}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                    {announcement.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {excerpt}
                </p>

                {/* CTA */}
                <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform duration-300">
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
            </div>
        </Link>
    );
}
