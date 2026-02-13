import { Metadata } from "next";
import { getAllDivisionsWithMembers } from "@/lib/queries/public";
import DivisionSection from "@/components/divisions/DivisionSection";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Divisi & Anggota | HMPSINF Universitas Nurul Huda",
    description: "Kenali lebih dekat divisi-divisi di Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda beserta anggota-anggotanya.",
    keywords: ["Divisi HMINF", "Anggota HMINF", "Struktur Organisasi", "HMPSINF UNUHA", "Informatika Nurul Huda"],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/profil/divisi`,
    },
    openGraph: {
        title: "Divisi & Anggota | HMPSINF Universitas Nurul Huda",
        description: "Kenali lebih dekat divisi-divisi di Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda beserta anggota-anggotanya.",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/profil/divisi`,
        siteName: "HMPSINF Universitas Nurul Huda",
        images: [{ url: "/og-image.jpg" }], // Ensure this image exists or use a dynamic one
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Divisi & Anggota | HMPSINF Universitas Nurul Huda",
        description: "Kenali lebih dekat divisi-divisi di Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda beserta anggota-anggotanya.",
        images: ["/og-image.jpg"],
    },
};

export const revalidate = 60; // Revalidate every minute

export default async function DivisionsPage() {
    const divisions = await getAllDivisionsWithMembers();

    // JSON-LD for Breadcrumbs
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Beranda",
                item: `${process.env.NEXT_PUBLIC_SITE_URL}`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Profil",
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/profil`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: "Divisi",
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/profil/divisi`,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-24">
            <JsonLd data={breadcrumbJsonLd} />

            {/* Background elements for visual flair */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            {/* Hero Section */}
            <section className="relative px-6 pt-6 pb-12 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="font-outfit text-4xl mr-auto ml-auto font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-6">
                        Divisi & Anggota
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        Himpunan Mahasiswa Program Studi Informatika terdiri dari berbagai divisi yang saling bersinergi untuk menjalankan program kerja dan mencapai visi misi organisasi.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
                {divisions.length > 0 ? (
                    <div className="flex flex-col">
                        {divisions.map((division, index) => (
                            <DivisionSection
                                key={division.id}
                                division={division}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-center dark:border-gray-800 dark:bg-gray-900/50">
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Belum ada data divisi</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Silakan tambahkan data divisi melalui panel admin.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
