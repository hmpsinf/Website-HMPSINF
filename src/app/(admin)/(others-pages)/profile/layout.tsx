import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profil Pengguna | HMPSINF",
    description: "Halaman profil pengguna - HMPSINF",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
