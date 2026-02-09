import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pengaturan | HMPSINF",
    description: "Pengaturan akun dan profil",
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
