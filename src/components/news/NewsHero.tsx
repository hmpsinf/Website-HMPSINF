import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import { formatSmartDate } from '@/lib/utils';

interface NewsHeroProps {
    news: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        thumbnail_url: string | null;
        published_at: string | null;
        author_name: string | null;
        category_name: string | null;
        category_slug: string | null;
    };
}

export default function NewsHero({ news }: NewsHeroProps) {
    return (
        <section className="mb-20">
            <Link
                href={`/berita/${news.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
                {/* Image Section (Col 1-7) */}
                <div className="lg:col-span-7">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                        {news.thumbnail_url ? (
                            <Image
                                src={news.thumbnail_url}
                                alt={news.title}
                                fill
                                priority
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 60vw"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <span className="text-lg font-medium">No Image Available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section (Col 8-12) */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                    {/* Category & Date */}
                    <div className="flex items-center gap-3 mb-6">
                        {news.category_name && (
                            <span className="inline-flex items-center rounded-full bg-brand-50 dark:bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                {news.category_name}
                            </span>
                        )}
                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        {news.published_at && (
                            <time className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {formatSmartDate(news.published_at)}
                            </time>
                        )}
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-outfit leading-[1.1] tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {news.title}
                    </h2>

                    {news.excerpt && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl">
                            {news.excerpt}
                        </p>
                    )}

                    <div className="flex items-center text-gray-900 dark:text-white font-semibold group/btn">
                        <span className="border-b-2 border-gray-900 dark:border-white pb-0.5 group-hover/btn:border-brand-600 dark:group-hover/btn:border-brand-400 group-hover/btn:text-brand-600 dark:group-hover/btn:text-brand-400 transition-colors">
                            Baca Artikel
                        </span>
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1 group-hover/btn:text-brand-600 dark:group-hover/btn:text-brand-400" />
                    </div>
                </div>
            </Link>
        </section>
    );
}
