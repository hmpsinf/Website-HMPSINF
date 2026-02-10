import { getSiteSettings } from "@/lib/queries/public";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSiteSettings();

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <PublicHeader
                logoUrl={settings.logo_url}
                siteName={settings.site_name}
            />
            <main className="flex-1">{children}</main>
            <PublicFooter
                siteName={settings.site_name}
                logoUrl={settings.logo_url}
                footerText={settings.footer_text}
                contactEmail={settings.contact_email}
                address={settings.address}
                instagramUrl={settings.instagram_url}
                tiktokUrl={settings.tiktok_url}
                facebookUrl={settings.facebook_url}
                youtubeUrl={settings.youtube_url}
            />
        </div>
    );
}
