
import { notFound } from 'next/navigation';
import { getGallery } from '@/lib/queries/gallery';
import GalleryDetailClient from '@/components/gallery/GalleryDetailClient';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const gallery = await getGallery(resolvedParams.id);

    if (!gallery) {
        return {
            title: 'Galeri Tidak Ditemukan',
            description: 'Galeri yang Anda cari tidak tersedia.',
        };
    }

    const description = gallery.description || `Dokumentasi kegiatan ${gallery.title} - HMPSINF Universitas Nurul Huda`;
    const keywords = ["Galeri HMPSINF", "Foto Kegiatan", "Dokumentasi", "Informatika UNUHA", ...gallery.title.split(" ")];

    // Create OG images array from gallery images (up to 4)
    const ogImages = gallery.images.slice(0, 4).map(img => ({
        url: img.image_url,
        width: 1200,
        height: 630,
        alt: img.caption || gallery.title,
    }));

    return {
        title: `${gallery.title} | Galeri HMPSINF`,
        description,
        keywords,
        openGraph: {
            title: `${gallery.title} | Galeri HMPSINF`,
            description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri/${gallery.id}`,
            siteName: 'HMPSINF Universitas Nurul Huda',
            locale: 'id_ID',
            type: 'article',
            images: ogImages,
            publishedTime: gallery.created_at,
            authors: ['HMPSINF'],
        },
        twitter: {
            card: "summary_large_image",
            title: `${gallery.title} | Galeri HMPSINF`,
            description,
            images: ogImages,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri/${gallery.id}`,
        },
    };
}

export default async function GalleryDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const gallery = await getGallery(resolvedParams.id);

    if (!gallery) {
        notFound();
    }

    return (
        <main>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "ImageGallery",
                    name: gallery.title,
                    description: gallery.description || `Dokumentasi kegiatan ${gallery.title}`,
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri/${gallery.id}`,
                    image: gallery.images.map(img => img.image_url),
                    datePublished: gallery.created_at,
                    author: {
                        "@type": "Organization",
                        name: "HMPSINF Universitas Nurul Huda",
                    },
                    breadcrumb: {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Beranda",
                                item: process.env.NEXT_PUBLIC_SITE_URL,
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Galeri",
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri`,
                            },
                            {
                                "@type": "ListItem",
                                position: 3,
                                name: gallery.title,
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri/${gallery.id}`,
                            },
                        ],
                    },
                }}
            />
            < GalleryDetailClient gallery={gallery} />
        </main >
    );
}

