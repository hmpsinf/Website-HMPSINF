import { notFound } from 'next/navigation';
import { getGallery } from '@/lib/queries/gallery';
import GalleryDetailClient from '@/components/gallery/GalleryDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const gallery = await getGallery(resolvedParams.id);

    if (!gallery) {
        return {
            title: 'Galeri Tidak Ditemukan',
        };
    }

    return {
        title: `${gallery.title} | Galeri HMPSINF`,
        description: gallery.description || `Dokumentasi kegiatan ${gallery.title}`,
    };
}

export default async function GalleryDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const gallery = await getGallery(resolvedParams.id);

    if (!gallery) {
        notFound();
    }

    return <GalleryDetailClient gallery={gallery} />;
}
