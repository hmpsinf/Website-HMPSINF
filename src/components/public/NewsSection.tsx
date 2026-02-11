import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Eye, MessageCircle, User } from "lucide-react";
import { getLatestNews } from "@/lib/queries/public";

export default async function NewsSection() {
    const news = await getLatestNews(3);

    if (!news || news.length === 0) return null;

    const featured = news[0];
    const others = news.slice(1);

    const getRelativeTime = (dateString: string | null) => {
        if (!dateString) return "Tanggal tidak tersedia";
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return "Baru saja";
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
            if (diffInSeconds < 172800) return "1 hari yang lalu"; // Less than 48 hours

            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <section className="bg-white py-16 md:py-24 overflow-hidden relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Berita & Artikel
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                            Informasi terbaru mengenai kegiatan, prestasi, dan wawasan seputar teknologi.
                        </p>
                    </div>
                    <div className="text-center md:text-right hidden md:block">
                        <Link href="/berita" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                            Lihat Semua Berita
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Featured Item (Big) - Spans 2 cols */}
                    <div className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200 transition-all duration-300 hover:ring-brand-200 hover:-translate-y-1 ${others.length === 0 ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                        <div className="relative h-full min-h-[400px] lg:min-h-[500px] w-full overflow-hidden">
                            {featured.thumbnail_url ? (
                                <img
                                    src={featured.thumbnail_url}
                                    alt={featured.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <span className="text-lg">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                                {featured.category_name && (
                                    <span className="inline-flex items-center rounded-full bg-brand-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                        {featured.category_name}
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full text-white">
                                {/* Author & Meta row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-gray-200 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4" />
                                        <span>{featured.author_name || "Admin HMPSINF"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>{getRelativeTime(featured.published_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        <span>{featured.view_count} dilihat</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{featured.comment_count} komentar</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 line-clamp-2 text-shadow-sm group-hover:text-brand-100 transition-colors">
                                    <Link href={`/berita/${featured.slug}`} className="hover:underline decoration-2 underline-offset-4 decoration-white/30 hover:decoration-white">
                                        {featured.title}
                                    </Link>
                                </h3>
                                <p className="text-gray-200 line-clamp-2 md:line-clamp-3 max-w-2xl text-base md:text-lg hidden sm:block">
                                    {featured.excerpt}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Items (Vertical List) - Spans 1 col */}
                    {others.length > 0 && (
                        <div className="flex flex-col gap-6 lg:gap-8 lg:col-span-1">
                            {others.map((item) => (
                                <div key={item.id} className="group relative flex flex-col bg-white rounded-3xl ring-1 ring-gray-200 overflow-hidden transition-all duration-300 hover:ring-brand-300 hover:-translate-y-1">
                                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                                        {item.thumbnail_url ? (
                                            <img
                                                src={item.thumbnail_url}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gray-100" />
                                        )}
                                        <div className="absolute top-3 left-3">
                                            {item.category_name && (
                                                <span className="inline-flex items-center rounded-full bg-brand-600/90 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm shadow-sm">
                                                    {item.category_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-5 sm:p-6 grow">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{getRelativeTime(item.published_at)}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                                            <Link href={`/berita/${item.slug}`}>
                                                {item.title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                            {item.excerpt}
                                        </p>
                                        <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                                            Baca Selengkapnya
                                            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/berita"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                        Lihat Semua Berita
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}