import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "lucide-react";

interface EventCardProps {
    id: string;
    title: string;
    thumbnail_url: string | null;
    event_date: string;
    event_end_date: string | null;
    event_time: string | null;
    location: string;
    description: string | null;
    link_url: string | null;
    link_text: string | null;
    is_open: boolean;
}

function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
        day: d.toLocaleDateString("id-ID", { day: "numeric" }),
        month: d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
    };
}

export default function EventCard({
    title,
    event_date,
    event_time,
    location,
    description,
    link_url,
    link_text,
    is_open,
}: EventCardProps) {
    const { day, month } = formatEventDate(event_date);

    return (
        <div className="group flex gap-5 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300">
            {/* Date Badge */}
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-brand-100 bg-brand-50">
                <span className="text-2xl font-bold leading-none text-brand-600">
                    {day}
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                    {month}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                    {title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    {event_time && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {event_time}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {location}
                    </span>
                </div>

                {description && (
                    <p className="mt-2 line-clamp-1 text-sm text-gray-400">
                        {description}
                    </p>
                )}
            </div>

            {/* CTA */}
            <div className="flex shrink-0 items-center">
                {is_open && link_url ? (
                    <Link
                        href={link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                    >
                        {link_text || "Daftar"}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-400">
                        Ditutup
                    </span>
                )}
            </div>
        </div>
    );
}
