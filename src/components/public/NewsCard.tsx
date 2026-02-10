"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";

interface NewsCardProps {
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    published_at: string | null;
    category_name: string | null;
    category_slug: string | null;
    featured?: boolean;
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    }).format(new Date(dateStr));
}

export default function NewsCard({
    title,
    slug,
    excerpt,
    thumbnail_url,
    published_at,
    category_name,
    featured = false,
}: NewsCardProps) {
    return (
        <Link
            href={`/berita/${slug}`}
            className={`group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-brand-300 ${featured ? "md:col-span-2 md:row-span-2" : ""
                }`}
        >
            {/* Image */}
            <div
                className={`relative overflow-hidden bg-gray-100 ${featured ? "aspect-[16/10]" : "aspect-[16/9]"
                    }`}
            >
                {thumbnail_url ? (
                    <Image
                        src={thumbnail_url}
                        alt={title}
                        fill
                        sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-gray-300">Tidak ada gambar</span>
                    </div>
                )}

                {/* Category Tag */}
                {category_name && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                        {category_name}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className={`p-5 ${featured ? "p-6 md:p-8" : ""}`}>
                <h3
                    className={`font-semibold leading-snug text-gray-900 group-hover:text-brand-600 transition-colors ${featured ? "text-xl md:text-2xl" : "text-base"
                        }`}
                >
                    {title}
                </h3>

                {excerpt && (
                    <p
                        className={`mt-2 text-gray-500 leading-relaxed ${featured
                            ? "line-clamp-3 text-sm md:text-base"
                            : "line-clamp-2 text-sm"
                            }`}
                    >
                        {excerpt}
                    </p>
                )}

                {published_at && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <time>{formatDate(published_at)}</time>
                    </div>
                )}
            </div>
        </Link>
    );
}
