import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pengaturan Situs | HMPSINF",
    description: "Kelola pengaturan situs HMPSINF",
};

export default function SiteSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
