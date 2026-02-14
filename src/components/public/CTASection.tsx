import Link from "next/link";
import { ArrowRight, Code2, Terminal, Cpu, Sparkles } from "lucide-react";
import { getSiteSettings } from "@/lib/queries/public";
import { FadeIn, ScaleIn } from "@/components/ui/MotionWrapper";

export default async function CTASection() {
    const settings = await getSiteSettings();

    // Don't render if no title is set (optional, but good practice)
    if (!settings.landing_cta_title) return null;

    return (
        <section className="py-24 bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* 
                  Wrapper: Rounded-3xl
                  Background: Solid Dark Brand (Modern, Professional, "Efficient")
                  No Gradient (per user request)
                */}
                <ScaleIn>
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 dark:bg-gray-950 border border-gray-800 px-6 py-12 sm:px-12 sm:py-16 text-center lg:px-16">

                        {/* Geometric/Tech Background Pattern (No Gradient, No AI Glow) */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" style={{ backgroundSize: '40px 40px' }}></div>

                            {/* Geometric Accents - Tech/Engineering Look */}
                            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 border-l border-b border-white rounded-bl-4xl md:rounded-bl-[4rem]"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 border-r border-t border-white rounded-tr-4xl md:rounded-tr-[4rem]"></div>

                            {/* Subtle Lines */}
                            <div className="absolute top-1/2 left-0 w-12 md:w-24 h-px bg-linear-to-r from-transparent to-white"></div>
                            <div className="absolute top-1/2 right-0 w-12 md:w-24 h-px bg-linear-to-l from-transparent to-white"></div>
                        </div>

                        {/* Content Container */}
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">

                            {/* Main Title */}
                            <FadeIn delay={0.2}>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-outfit text-white tracking-tight leading-tight">
                                    {settings.landing_cta_title}
                                </h2>
                            </FadeIn>

                            {/* Subtitle */}
                            <FadeIn delay={0.3}>
                                <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed">
                                    {settings.landing_cta_subtitle}
                                </p>
                            </FadeIn>

                            {/* Action Buttons */}
                            <FadeIn delay={0.4}>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                                    <Link
                                        href={settings.landing_cta_btn_link || "/contact"}
                                        className="group inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-950 rounded-xl font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <span>{settings.landing_cta_btn_text}</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </FadeIn>

                        </div>
                    </div>
                </ScaleIn>
            </div>
        </section>
    );
}
