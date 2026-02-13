import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, MapPin, Terminal } from "lucide-react";
import { getUpcomingEvents } from "@/lib/queries/public";
import Image from "next/image";

export default async function EventsSection() {
    const events = await getUpcomingEvents(3);

    if (!events || events.length === 0) return null;

    // Split events for Bento Layout - Main event is first
    const mainEvent = events[0];
    const sideEvents = events.slice(1);

    const formatDate = (dateStr: string, endDateStr?: string | null) => {
        const d = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

        if (endDateStr && endDateStr !== dateStr) {
            const endD = new Date(endDateStr);
            // Same year and month
            if (d.getFullYear() === endD.getFullYear() && d.getMonth() === endD.getMonth()) {
                return `${d.getDate()} - ${endD.getDate()} ${d.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`;
            }
            // Same year different month
            if (d.getFullYear() === endD.getFullYear()) {
                return `${d.getDate()} ${d.toLocaleDateString("id-ID", { month: "short" })} - ${endD.getDate()} ${endD.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`;
            }
            // Different year
            return `${d.toLocaleDateString("id-ID", options)} - ${endD.toLocaleDateString("id-ID", options)}`;
        }

        return d.toLocaleDateString("id-ID", options);
    };

    const formatTime = (timeStr: string | null, endTimeStr?: string | null) => {
        if (!timeStr) return "TBA";

        const cleanTime = (t: string) => t.replace(/\s*WIB/i, "").trim();
        const start = cleanTime(timeStr);

        if (endTimeStr) {
            const end = cleanTime(endTimeStr);
            return `${start} - ${end} WIB`;
        }

        return `${start} WIB`;
    };

    return (
        <section className="py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                            <Terminal className="w-5 h-5" />
                            <span className="font-mono text-sm uppercase tracking-widest">
                                Agenda Himpunan
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight">
                            Event & Kegiatan
                        </h2>
                    </div>

                    <div className="hidden md:block">
                        <Link
                            href="/agenda"
                            className="group flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-brand-600 transition-colors"
                        >
                            <span>Lihat Semua Event</span>
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">

                    {/* Main Featured Event - Large Card */}
                    <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 min-h-[400px]">
                        {/* Background Image / Placeholder */}
                        <div className="absolute inset-0 z-0">
                            {mainEvent.thumbnail_url ? (
                                <Image
                                    src={mainEvent.thumbnail_url}
                                    alt={mainEvent.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-brand-50 to-white dark:from-gray-900 dark:to-gray-800" />
                            )}
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-900/60 to-transparent opacity-90" />
                        </div>

                        <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-mono text-white">
                                    <Calendar className="w-3 h-3 mr-2" />
                                    {formatDate(mainEvent.event_date, mainEvent.event_end_date)}
                                </span>
                                {mainEvent.is_open ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 bg-white/95 backdrop-blur-md text-xs font-bold text-gray-950 uppercase shadow-sm">
                                        Pendaftaran Dibuka
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 bg-white/95 backdrop-blur-md text-xs font-bold text-gray-500 uppercase shadow-sm">
                                        Ditutup
                                    </span>
                                )}
                            </div>

                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight group-hover:text-brand-100 transition-colors">
                                {mainEvent.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm font-mono mb-8">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(mainEvent.event_time, mainEvent.event_end_time)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{mainEvent.location}</span>
                                </div>
                            </div>

                            {mainEvent.link_url && (
                                <Link
                                    href={mainEvent.link_url}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-950 font-medium hover:bg-brand-50 hover:text-brand-700 transition-colors w-fit"
                                >
                                    <span>{mainEvent.link_text || "Daftar Sekarang"}</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Secondary Events Column */}
                    <div className="flex flex-col gap-6">
                        {sideEvents.length > 0 ? (
                            sideEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="group flex-1 flex flex-col justify-between p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 relative"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-5xl font-bold font-outfit text-gray-200 dark:text-gray-800 group-hover:text-brand-500/20 transition-colors">
                                                    {new Date(event.event_date).getDate().toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-xs font-mono text-gray-500 uppercase mt-1 tracking-widest">
                                                    {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                    {event.event_end_date && event.event_end_date !== event.event_date &&
                                                        (new Date(event.event_end_date).getMonth() !== new Date(event.event_date).getMonth() ||
                                                            new Date(event.event_end_date).getFullYear() !== new Date(event.event_date).getFullYear())
                                                        ? ` - ${new Date(event.event_end_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` : ''}
                                                </span>
                                            </div>
                                            {event.is_open && (
                                                <span className="flex h-3 w-3 relative">
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
                                            {event.title}
                                        </h4>

                                        <div className="flex flex-col gap-2 text-xs text-gray-500 font-mono">
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(event.event_time, event.event_end_time)}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate max-w-[200px]">{event.location}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {event.link_url && (
                                        <Link
                                            href={event.link_url}
                                            target="_blank"
                                            className="absolute inset-0 z-20"
                                            aria-label={`View details for ${event.title}`}
                                        />
                                    )}

                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                                        <span>{event.link_text || "Detail Event"}</span>
                                        <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Empty state filler if only 1 event exists
                            <div className="h-full flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 bg-gray-50/50 dark:bg-gray-900/50">
                                <Calendar className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" />
                                <span className="font-mono text-sm text-center">Tidak ada agenda lain.</span>
                            </div>
                        )}

                        {/* Fallback View More if less than 2 side events but we want to fill space? 
                            Actually let's just leave it responsive. If 1 side event, it takes full height.
                        */}
                    </div>
                </div>

                {/* Mobile View All Button */}
                <div className="mt-12 md:hidden text-center">
                    <Link
                        href="/agenda"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                        <span>Lihat Semua Agenda</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
