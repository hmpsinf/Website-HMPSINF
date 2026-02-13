import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Instagram, MessageCircle, User, Users, CalendarDays } from 'lucide-react';
import { getStrukturOrganisasi, getDivisionLeaders, getSiteSettings } from '@/lib/queries/public';
import { generatePatternSvg, DEFAULT_HIMA_INTI_PATTERN_COLOR } from '@/lib/pattern';
import JsonLd from '@/components/seo/JsonLd';
import DivisionTabs from './DivisionTabs';
import ScrollRow from './ScrollRow';

export const metadata = {
    title: 'Struktur Organisasi HMPSINF - Kepengurusan',
    description: 'Struktur organisasi dan kepengurusan Himpunan Mahasiswa Program Studi Informatika (HMPSINF) Universitas Nurul Huda. Ketua, Wakil, Sekretaris, Bendahara, dan Divisi.',
    keywords: ['Struktur Organisasi HMPSINF', 'Kepengurusan HMPSINF', 'Pengurus HMPSINF', 'Divisi HMPSINF', 'Informatika UNUHA'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/profil/struktur-organisasi`,
    },
};

// Position labels for display
const POSITION_LABELS: Record<string, string> = {
    penasehat: 'Penasehat',
    pembina: 'Pembina',
    ketua_umum: 'Ketua Umum',
    sekretaris_umum: 'Sekretaris Umum',
    wakil_ketua: 'Wakil Ketua',
    bendahara_umum: 'Bendahara Umum',
};

// Position color accents
const POSITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    penasehat: {
        bg: 'bg-slate-100 dark:bg-slate-500/10',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-500/30',
    },
    pembina: {
        bg: 'bg-purple-100 dark:bg-purple-500/10',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-500/30',
    },
    ketua_umum: {
        bg: 'bg-brand-100 dark:bg-brand-500/10',
        text: 'text-brand-700 dark:text-brand-400',
        border: 'border-brand-200 dark:border-brand-500/30',
    },
    sekretaris_umum: {
        bg: 'bg-amber-100 dark:bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-500/30',
    },
    wakil_ketua: {
        bg: 'bg-blue-100 dark:bg-blue-500/10',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-500/30',
    },
    bendahara_umum: {
        bg: 'bg-emerald-100 dark:bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-500/30',
    },
};

// Uniform member card — fixed width card with 2:3 photo, text never truncated
function MemberCard({
    name,
    position,
    positionLabel,
    photoUrl,
    instagram,
    whatsapp,
    patternColor,
    positionColors,
}: {
    name: string;
    position: string;
    positionLabel: string;
    photoUrl: string | null;
    instagram: string | null;
    whatsapp: string | null;
    patternColor: string;
    positionColors: { bg: string; text: string; border: string };
}) {
    const patternStyle = {
        backgroundImage: `url("${generatePatternSvg(patternColor)}")`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'repeat' as const,
    };

    return (
        <div className="w-[200px] sm:w-[220px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            {/* Photo — always 2:3 aspect ratio */}
            <div
                className="relative aspect-2/3 w-full overflow-hidden bg-white dark:bg-gray-900"
                style={patternStyle}
            >
                {photoUrl ? (
                    <Image
                        src={photoUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="220px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <User className="h-14 w-14 text-gray-300 dark:text-gray-600" />
                    </div>
                )}
            </div>

            {/* Content — no truncation */}
            <div className="p-3.5">
                {/* Position badge */}
                <div className="mb-2">
                    <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-relaxed ${positionColors.bg} ${positionColors.text} border ${positionColors.border}`}
                    >
                        {positionLabel}
                    </span>
                </div>

                {/* Name — wrap instead of truncate */}
                <h3 className="text-sm font-bold text-gray-800 dark:text-white font-outfit leading-snug wrap-break-word">
                    {name}
                </h3>

                {/* Social media links */}
                {(instagram || whatsapp) && (
                    <div className="mt-2 flex flex-col gap-1.5">
                        {instagram && (
                            <a
                                href={`https://instagram.com/${instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400"
                                title={`Instagram: @${instagram.replace('@', '')}`}
                            >
                                <Instagram className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs break-all leading-tight">@{instagram.replace('@', '')}</span>
                            </a>
                        )}
                        {whatsapp && (
                            <a
                                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                                title={`WhatsApp: ${whatsapp}`}
                            >
                                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs break-all leading-tight">{whatsapp}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple centered flex wrapper for sections — scrolling is handled by ScrollRow client component
function CenteredRow({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {children}
        </div>
    );
}

export default async function StrukturOrganisasiPage() {
    const [{ period, members }, divisions, settings] = await Promise.all([
        getStrukturOrganisasi(),
        getDivisionLeaders(),
        getSiteSettings(),
    ]);

    const patternColor = settings.hima_inti_pattern_color || DEFAULT_HIMA_INTI_PATTERN_COLOR;

    // Group members by position
    const penasehat = members.filter((m) => m.position === 'penasehat');
    const pembina = members.filter((m) => m.position === 'pembina');
    const ketuaUmum = members.filter((m) => m.position === 'ketua_umum');
    const sekretarisUmum = members.filter((m) => m.position === 'sekretaris_umum');
    const wakilKetua = members.filter((m) => m.position === 'wakil_ketua');
    const bendaharaUmum = members.filter((m) => m.position === 'bendahara_umum');

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Struktur Organisasi HMPSINF",
        "description": "Struktur organisasi dan kepengurusan Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/profil/struktur`,
        "publisher": {
            "@type": "Organization",
            "name": "HMPSINF Universitas Nurul Huda",
            "url": process.env.NEXT_PUBLIC_SITE_URL
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Beranda",
                    "item": process.env.NEXT_PUBLIC_SITE_URL,
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Profil",
                    "item": `${process.env.NEXT_PUBLIC_SITE_URL}/profil`,
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Struktur Organisasi",
                    "item": `${process.env.NEXT_PUBLIC_SITE_URL}/profil/struktur`,
                },
            ],
        },
    };

    const hasData = members.length > 0 || divisions.length > 0;

    if (!hasData) {
        return (
            <main className="min-h-screen bg-white dark:bg-gray-950">
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Data Belum Tersedia</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Belum ada data struktur organisasi yang ditambahkan. Silakan hubungi admin untuk memperbarui informasi ini.
                    </p>
                </div>
            </main>
        );
    }

    // Serialize division data for client component tabs
    const divisionsData = divisions.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        color: d.color,
        leaders: d.leaders.map((l) => ({
            id: l.id,
            member_name: l.member_name,
            position: l.position,
            photo_url: l.photo_url,
            instagram: l.instagram,
            whatsapp: l.whatsapp,
        })),
    }));

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd data={jsonLd} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 md:pt-10 md:pb-20 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/profil" className="hover:text-brand-600 transition-colors">Profil</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 dark:text-white font-medium">Struktur Organisasi</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8">
                        {/* Header */}
                        <header className="mb-6 text-center">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 font-outfit">
                                Struktur Organisasi
                            </h1>
                            {period && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Periode {period.name}</span>
                                </div>
                            )}
                        </header>

                        {/* ── HIMA INTI SECTION ── */}
                        {members.length > 0 && (
                            <div className="space-y-8">
                                {/* Tier 1a: Penasehat — centered */}
                                {penasehat.length > 0 && (
                                    <section>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 text-center">
                                            Penasehat
                                        </h2>
                                        <CenteredRow>
                                            {penasehat.map((m) => (
                                                <MemberCard
                                                    key={m.id}
                                                    name={m.name}
                                                    position={m.position}
                                                    positionLabel={POSITION_LABELS[m.position] || m.position}
                                                    photoUrl={m.photo_url}
                                                    instagram={m.instagram}
                                                    whatsapp={m.whatsapp}
                                                    patternColor={patternColor}
                                                    positionColors={POSITION_COLORS[m.position] || POSITION_COLORS.ketua_umum}
                                                />
                                            ))}
                                        </CenteredRow>
                                    </section>
                                )}

                                {/* Connector: Penasehat → Pembina */}
                                {penasehat.length > 0 && pembina.length > 0 && (
                                    <div className="flex justify-center">
                                        <div className="w-px h-8 bg-linear-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800" />
                                    </div>
                                )}

                                {/* Tier 1b: Pembina — centered */}
                                {pembina.length > 0 && (
                                    <section>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 text-center">
                                            Pembina
                                        </h2>
                                        <CenteredRow>
                                            {pembina.map((m) => (
                                                <MemberCard
                                                    key={m.id}
                                                    name={m.name}
                                                    position={m.position}
                                                    positionLabel={POSITION_LABELS[m.position] || m.position}
                                                    photoUrl={m.photo_url}
                                                    instagram={m.instagram}
                                                    whatsapp={m.whatsapp}
                                                    patternColor={patternColor}
                                                    positionColors={POSITION_COLORS[m.position] || POSITION_COLORS.ketua_umum}
                                                />
                                            ))}
                                        </CenteredRow>
                                    </section>
                                )}

                                {/* Connector: Pembina → Ketua Umum */}
                                {(penasehat.length > 0 || pembina.length > 0) && ketuaUmum.length > 0 && (
                                    <div className="flex justify-center">
                                        <div className="w-px h-8 bg-linear-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800" />
                                    </div>
                                )}

                                {/* Tier 2: Ketua Umum — centered */}
                                {ketuaUmum.length > 0 && (
                                    <section>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 text-center">
                                            Ketua Umum
                                        </h2>
                                        <CenteredRow>
                                            {ketuaUmum.map((m) => (
                                                <MemberCard
                                                    key={m.id}
                                                    name={m.name}
                                                    position={m.position}
                                                    positionLabel={POSITION_LABELS[m.position] || m.position}
                                                    photoUrl={m.photo_url}
                                                    instagram={m.instagram}
                                                    whatsapp={m.whatsapp}
                                                    patternColor={patternColor}
                                                    positionColors={POSITION_COLORS[m.position] || POSITION_COLORS.ketua_umum}
                                                />
                                            ))}
                                        </CenteredRow>
                                    </section>
                                )}

                                {/* Connector */}
                                {ketuaUmum.length > 0 && (sekretarisUmum.length > 0 || wakilKetua.length > 0 || bendaharaUmum.length > 0) && (
                                    <div className="flex justify-center">
                                        <div className="w-px h-8 bg-linear-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800" />
                                    </div>
                                )}

                                {/* Tier 3: Sekretaris Umum, Wakil Ketua & Bendahara Umum */}
                                {(sekretarisUmum.length > 0 || wakilKetua.length > 0 || bendaharaUmum.length > 0) && (
                                    <section>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 text-center">
                                            Sekretaris, Wakil Ketua &amp; Bendahara
                                        </h2>
                                        <ScrollRow>
                                            {sekretarisUmum.map((m) => (
                                                <MemberCard
                                                    key={m.id}
                                                    name={m.name}
                                                    position={m.position}
                                                    positionLabel={POSITION_LABELS[m.position] || m.position}
                                                    photoUrl={m.photo_url}
                                                    instagram={m.instagram}
                                                    whatsapp={m.whatsapp}
                                                    patternColor={patternColor}
                                                    positionColors={POSITION_COLORS[m.position] || POSITION_COLORS.ketua_umum}
                                                />
                                            ))}
                                            {wakilKetua.map((m) => (
                                                <MemberCard
                                                    key={m.id}
                                                    name={m.name}
                                                    position={m.position}
                                                    positionLabel={POSITION_LABELS[m.position] || m.position}
                                                    photoUrl={m.photo_url}
                                                    instagram={m.instagram}
                                                    whatsapp={m.whatsapp}
                                                    patternColor={patternColor}
                                                    positionColors={POSITION_COLORS[m.position] || POSITION_COLORS.ketua_umum}
                                                />
                                            ))}
                                            {bendaharaUmum.map((m) => (
                                                <MemberCard
                                                    key={m.id}
                                                    name={m.name}
                                                    position={m.position}
                                                    positionLabel={POSITION_LABELS[m.position] || m.position}
                                                    photoUrl={m.photo_url}
                                                    instagram={m.instagram}
                                                    whatsapp={m.whatsapp}
                                                    patternColor={patternColor}
                                                    positionColors={POSITION_COLORS[m.position] || POSITION_COLORS.ketua_umum}
                                                />
                                            ))}
                                        </ScrollRow>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* ── DIVISI SECTION (Tabs) ── */}
                        {divisions.length > 0 && (
                            <div className="mt-14">
                                {/* Connector from HIMA Inti to Divisions */}
                                {members.length > 0 && (
                                    <div className="flex justify-center mb-8">
                                        <div className="w-px h-10 bg-linear-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800" />
                                    </div>
                                )}

                                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6 text-center">
                                    Pimpinan Divisi
                                </h2>

                                <DivisionTabs divisions={divisionsData} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-24">
                        <div className="pl-8 border-l border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
                                Menu Profil
                            </h3>
                            <nav className="flex flex-col gap-4">
                                <Link href="/profil/sejarah" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Sejarah
                                </Link>
                                <Link href="/profil/visi-misi" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Visi &amp; Misi
                                </Link>
                                <Link href="/profil/struktur" className="text-brand-600 dark:text-brand-400 font-medium">
                                    Struktur Organisasi
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
