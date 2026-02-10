import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Particles from "@/components/ui/Particles";
import {
    getLatestNews,
    getUpcomingEvents,
    getVisiMisi,
    getSiteSettings,
} from "@/lib/queries/public";
import NewsCard from "@/components/public/NewsCard";
import EventCard from "@/components/public/EventCard";

export const metadata: Metadata = {
    title: "HMPSINF — Himpunan Mahasiswa Program Studi Informatika",
    description:
        "Wadah aspirasi dan pengembangan potensi mahasiswa Program Studi Informatika.",
};

export default async function LandingPage() {
    const [news, events, visiMisi, settings] = await Promise.all([
        getLatestNews(4),
        getUpcomingEvents(3),
        getVisiMisi(),
        getSiteSettings(),
    ]);

    return (
        <>
            {/* ─── HERO ─── */}
            <section className="relative pt-8 pb-10 md:pt-12 md:pb-16 lg:pt-16 lg:pb-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Rounded container with background image */}
                    <div
                        className="relative overflow-hidden rounded-3xl bg-gray-900"
                        style={
                            settings.hero_bg_image
                                ? {
                                    backgroundImage: `url(${settings.hero_bg_image})`,
                                    backgroundSize: settings.hero_bg_size || "cover",
                                    backgroundPosition: "center",
                                }
                                : undefined
                        }
                    >
                        {/* Gradient overlay */}
                        <div
                            className="pointer-events-none absolute inset-0 z-[1]"
                            style={{
                                background:
                                    "linear-gradient(to right, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)",
                            }}
                        />

                        {/* Particles Animation — above gradient, below content */}
                        <div className="absolute inset-0 z-[2]">
                            <Particles
                                particleColors={["#ffffff", "#a5b4fc", "#818cf8"]}
                                particleCount={250}
                                particleSpread={10}
                                speed={0.08}
                                particleBaseSize={120}
                                sizeRandomness={1}
                                moveParticlesOnHover={true}
                                particleHoverFactor={3}
                                alphaParticles={true}
                                disableRotation={false}
                                cameraDistance={20}
                                pixelRatio={2}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Inner content — above particles */}
                        <div className="relative z-10 grid grid-cols-1 items-center lg:grid-cols-5">
                            {/* Left Column: Text (60% width -> col-span-3) */}
                            <div className="px-6 py-14 text-center sm:px-10 sm:py-16 lg:col-span-3 lg:px-14 lg:py-20 lg:text-left">
                                <h1
                                    className="font-outfit text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl"
                                    dangerouslySetInnerHTML={{ __html: settings.hero_title }}
                                />
                                <p
                                    className="mt-4 text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-base lg:text-lg"
                                    dangerouslySetInnerHTML={{ __html: settings.hero_subtitle }}
                                />

                                {/* Buttons with fill-up animation */}
                                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8 lg:justify-start">
                                    <Link
                                        href={settings.hero_btn1_link}
                                        className="hero-btn hero-btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg shadow-black/10"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {settings.hero_btn1_text}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                    <Link
                                        href={settings.hero_btn2_link}
                                        className="hero-btn hero-btn-secondary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {settings.hero_btn2_text}
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Side Image with decorative ring (40% width -> col-span-2) */}
                            {settings.hero_side_image && (
                                <div className="relative hidden lg:col-span-2 lg:block lg:self-stretch">
                                    {/* Decorative ring removed — replaced by Particles overlay */}

                                    {/* Illustration image — top spacing, fills to bottom */}
                                    <img
                                        src={settings.hero_side_image}
                                        alt="Hero Illustration"
                                        className="absolute inset-x-0 bottom-0 top-8 h-[calc(100%-2rem)] w-full object-contain object-bottom"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </section >

            {/* ─── BERITA TERBARU ─── */}
            < section className="mx-auto max-w-7xl px-6 py-20 md:py-24" >
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                            Berita Terbaru
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Informasi dan kegiatan terkini dari HMPSINF.
                        </p>
                    </div>
                    <Link
                        href="/berita"
                        className="hidden items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 md:inline-flex"
                    >
                        Semua Berita
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {
                    news.length > 0 ? (
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {news.map((item, index) => (
                                <NewsCard
                                    key={item.id}
                                    {...item}
                                    featured={index === 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-xl border border-dashed border-gray-200 py-16 text-center">
                            <p className="text-sm text-gray-400">Belum ada berita saat ini.</p>
                        </div>
                    )
                }

                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/berita"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600"
                    >
                        Semua Berita
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </section >

            {/* ─── EVENT MENDATANG ─── */}
            < section className="border-t border-gray-100 bg-gray-25" >
                <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                                Event Mendatang
                            </h2>
                            <p className="mt-2 text-gray-500">
                                Kegiatan dan acara yang akan datang.
                            </p>
                        </div>
                        <Link
                            href="/events"
                            className="hidden items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 md:inline-flex"
                        >
                            Semua Event
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {events.length > 0 ? (
                        <div className="mt-10 space-y-4">
                            {events.map((event) => (
                                <EventCard key={event.id} {...event} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <p className="text-sm text-gray-400">
                                Tidak ada event mendatang saat ini.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600"
                        >
                            Semua Event
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </section >

            {/* ─── TENTANG KAMI ─── */}
            < section className="mx-auto max-w-7xl px-6 py-20 md:py-24" >
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                        Tentang HMPSINF
                    </h2>
                    {visiMisi ? (
                        <>
                            {visiMisi.visi && (
                                <div className="mt-8">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                                        Visi
                                    </h3>
                                    <p className="mt-3 text-lg leading-relaxed text-gray-600">
                                        {visiMisi.visi}
                                    </p>
                                </div>
                            )}
                            {visiMisi.misi && (
                                <div className="mt-8">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                                        Misi
                                    </h3>
                                    <p className="mt-3 text-base leading-relaxed text-gray-500 whitespace-pre-line">
                                        {visiMisi.misi}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="mt-6 text-gray-500">
                            Informasi tentang visi dan misi akan segera tersedia.
                        </p>
                    )}
                    <Link
                        href="/profil"
                        className="mt-10 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-300 hover:text-brand-600"
                    >
                        Selengkapnya
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section >
        </>
    );
}
