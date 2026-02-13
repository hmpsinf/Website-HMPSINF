import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, User, ArrowUpRight } from 'lucide-react';
import { cn, formatSmartDate } from '@/lib/utils';

interface NewsCardProps {
    news: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        thumbnail_url: string | null;
        published_at: string | null;
        author_name: string | null;
        category_name: string | null;
        view_count: number;
    };
}

export default function NewsCard({ news }: NewsCardProps) {
    return (
        <Link
            href={`/berita/${news.slug}`}
            className="group flex flex-col h-full bg-transparent"
        >
            {/* Image Container - Clean, no shadow, subtle zoom on hover */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 mb-6">
                {news.thumbnail_url ? (
                    <Image
                        src={news.thumbnail_url}
                        alt={news.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <span className="text-sm font-medium">No Image</span>
                    </div>
                )}

                {/* Category Badge - Absolute for modern look */}
                {news.category_name && (
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-sm">
                            {news.category_name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content - Spacious, focus on typography */}
            <div className="flex-1 flex flex-col">
                {/* Meta data */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                    {news.published_at && (
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            <time dateTime={news.published_at}>
                                {formatSmartDate(news.published_at)}
                            </time>
                        </div>
                    )}
                    {news.author_name && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span>{news.author_name}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 font-outfit leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {news.title}
                </h3>

                {/* Excerpt */}
                {news.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {news.excerpt}
                    </p>
                )}

                {/* Read More Link (Decoration) */}
                <div className="mt-auto flex items-center text-brand-600 dark:text-brand-400 font-medium group/link">
                    <span className="text-sm">Baca Selengkapnya</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </div>
            </div>
        </Link>
    );
}
