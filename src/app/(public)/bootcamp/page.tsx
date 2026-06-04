import type { Metadata } from "next";
import BootcampGuide from "@/components/public/BootcampGuide";

export const metadata: Metadata = {
    title: "Panduan Bootcamp Laravel | HMPSINF Universitas Nurul Huda",
    description:
        "Panduan lengkap peserta Bootcamp Laravel Dasar — membangun Sistem Manajemen Event Kampus dengan Laravel 10, Bootstrap 4 (SB Admin 2), MySQL, dan SweetAlert2.",
    keywords: [
        "Bootcamp Laravel",
        "Tutorial Laravel",
        "CRUD Laravel",
        "SB Admin 2",
        "HMPSINF",
        "Panduan Peserta",
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/bootcamp`,
    },
};

export default function BootcampPage() {
    return <BootcampGuide />;
}
