import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, MapPin, Phone, Facebook, Youtube } from "lucide-react";
import { FadeIn } from "@/components/ui/MotionWrapper";

interface PublicFooterProps {
    siteName: string;
    logoUrl: string | null;
    footerText: string | null;
    contactEmail: string | null;
    address: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    facebookUrl: string | null;
    youtubeUrl: string | null;
}

const quickLinks = [
    { label: "Beranda", href: "/" },
    { label: "Berita", href: "/berita" },
    { label: "Pengumuman", href: "/pengumuman" },
    { label: "Galeri", href: "/galeri" },
    { label: "Unduhan", href: "/unduhan" },
    { label: "Kontak", href: "/kontak" },
];

const profilLinks = [
    { label: "Sejarah", href: "/profil/sejarah" },
    { label: "Visi dan Misi", href: "/profil/visi-misi" },
    { label: "Struktur Organisasi", href: "/profil/struktur-organisasi" },
];

// Simple TikTok icon since lucide doesn't have one
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.23 8.23 0 0 0 3.76.96V6.32a4.85 4.85 0 0 1-.01.37z" />
        </svg>
    );
}

export default function PublicFooter({
    siteName,
    logoUrl,
    footerText,
    contactEmail,
    address,
    instagramUrl,
    tiktokUrl,
    facebookUrl,
    youtubeUrl,
}: PublicFooterProps) {
    const socials = [
        instagramUrl && { icon: Instagram, href: instagramUrl, label: "Instagram" },
        tiktokUrl && { icon: TikTokIcon, href: tiktokUrl, label: "TikTok" },
        facebookUrl && { icon: Facebook, href: facebookUrl, label: "Facebook" },
        youtubeUrl && { icon: Youtube, href: youtubeUrl, label: "YouTube" },
    ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; href: string; label: string }[];

    return (
        <footer className="border-t border-gray-200 bg-gray-25">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <FadeIn direction="up">
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Kolom 1: Logo & Deskripsi */}
                        <div className="space-y-4">
                            <Link href="/" className="flex items-center gap-2.5">
                                {logoUrl ? (
                                    <Image
                                        src={logoUrl}
                                        alt={siteName}
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 object-contain"
                                    />
                                ) : null}
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    {siteName}
                                </span>
                            </Link>
                            <p className="text-sm leading-relaxed text-gray-500">
                                Wadah aspirasi dan pengembangan potensi mahasiswa informatika.
                            </p>
                        </div>

                        {/* Wrapper for Halaman & Profil - 2 columns on mobile */}
                        <div className="col-span-1 grid grid-cols-2 gap-8 sm:col-span-2 sm:gap-12 lg:col-span-2">
                            {/* Kolom 2: Link Cepat */}
                            <div>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">
                                    Halaman
                                </h3>
                                <ul className="space-y-3">
                                    {quickLinks.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-gray-500 transition-colors hover:text-brand-600"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Kolom 3: Profil */}
                            <div>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">
                                    Profil
                                </h3>
                                <ul className="space-y-3">
                                    {profilLinks.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-gray-500 transition-colors hover:text-brand-600"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Kolom 4: Kontak & Sosial */}
                        <div>
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">
                                Kontak
                            </h3>
                            <ul className="space-y-3">
                                {contactEmail && (
                                    <li className="flex items-start gap-2 text-sm text-gray-500">
                                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                        <span>{contactEmail}</span>
                                    </li>
                                )}
                                {address && (
                                    <li className="flex items-start gap-2 text-sm text-gray-500">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                        <span>{address}</span>
                                    </li>
                                )}
                            </ul>

                            {socials.length > 0 && (
                                <div className="mt-5 flex gap-3">
                                    {socials.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-brand-500 hover:text-brand-600"
                                            aria-label={social.label}
                                        >
                                            <social.icon className="h-4 w-4" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </FadeIn>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-200">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    <FadeIn delay={0.2}>
                        <p className="text-center text-sm text-gray-500">
                            {footerText || `© ${new Date().getFullYear()} ${siteName}. Hak Cipta Dilindungi.`}
                        </p>
                    </FadeIn>
                </div>
            </div>
        </footer>
    );
}
