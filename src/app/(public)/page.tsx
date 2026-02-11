import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Particles from "@/components/ui/Particles";
import {
    getSiteSettings,
    getKetuaHimpunan,
} from "@/lib/queries/public";
import SambutanSection from "@/components/public/SambutanSection";
import NewsSection from "@/components/public/NewsSection";
import DivisionsSection from "@/components/public/DivisionsSection";
import EventsSection from "@/components/public/EventsSection";
import VideoSection from "@/components/public/VideoSection";
import CTASection from "@/components/public/CTASection";

export const metadata: Metadata = {
    title: "HMPSINF — Himpunan Mahasiswa Program Studi Informatika",
    description:
        "Wadah aspirasi dan pengembangan potensi mahasiswa Program Studi Informatika.",
};

export default async function LandingPage() {
    const [settings, ketua] = await Promise.all([
        getSiteSettings(),
        getKetuaHimpunan(),
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
                        {/* Gradient overlay - Mobile (Solid) */}
                        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/90 lg:hidden" />

                        {/* Gradient overlay - Desktop (Gradient) */}
                        <div
                            className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
                            style={{
                                background:
                                    "linear-gradient(to right, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)",
                            }}
                        />

                        {/* Particles Animation — above gradient, below content */}
                        <div className="absolute inset-0 z-[2]">
                            <Particles
                                particleColors={["#ffffff"]}
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
                            <div className="px-6 py-24 text-center sm:px-10 sm:py-20 lg:col-span-3 lg:px-14 lg:py-20 lg:text-left min-h-[500px] flex flex-col justify-center lg:min-h-0 lg:block">
                                <h1
                                    className="font-outfit text-2xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl"
                                    dangerouslySetInnerHTML={{ __html: settings.hero_title }}
                                />
                                <p
                                    className="mt-4 text-xs leading-relaxed text-white/75 sm:mt-5 sm:text-base lg:text-lg"
                                    dangerouslySetInnerHTML={{ __html: settings.hero_subtitle }}
                                />

                                {/* Buttons with fill-up animation - Stacked on Mobile */}
                                <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3 sm:mt-10 lg:justify-start">
                                    <Link
                                        href={settings.hero_btn1_link}
                                        className="hero-btn hero-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold shadow-lg shadow-black/10 sm:px-8 sm:py-3 sm:text-sm"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {settings.hero_btn1_text}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                    <Link
                                        href={settings.hero_btn2_link}
                                        className="hero-btn hero-btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold sm:px-8 sm:py-3 sm:text-sm"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {settings.hero_btn2_text}
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Side Image (40% width -> col-span-2) */}
                            {settings.hero_side_image && (
                                <div className="relative hidden w-full sm:h-80 lg:col-span-2 lg:block lg:h-auto lg:self-stretch">
                                    {/* Illustration image — responsive positioning */}
                                    <img
                                        src={settings.hero_side_image}
                                        alt="Hero Illustration"
                                        className="h-full w-full object-contain object-bottom lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-8 lg:h-[calc(100%-2rem)]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </section >

            {/* ─── SAMBUTAN KETUA ─── */}
            <SambutanSection settings={settings} ketua={ketua} />

            {/* ─── BIDANG & DIVISI ─── */}
            <DivisionsSection />

            {/* ─── BERITA TERBARU ─── */}
            <NewsSection />


            {/* ─── VIDEO PROFIL ─── */}
            <VideoSection />

            {/* ─── EVENT MENDATANG ─── */}
            <EventsSection />



            {/* ─── CTA ─── */}
            <CTASection />
        </>
    );
}
