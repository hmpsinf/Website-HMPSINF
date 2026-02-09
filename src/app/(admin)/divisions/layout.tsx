import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manajemen Divisi | HMPSINF",
    description: "Kelola divisi dan anggota HMPSINF",
};

export default function DivisionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
