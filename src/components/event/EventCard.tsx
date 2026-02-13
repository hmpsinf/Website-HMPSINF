import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { formatDate, formatTime, cn } from '@/lib/utils';;

interface Props {
    event: {
        id: string;
        title: string;
        slug: string;
        thumbnail_url: string;
        event_date: string;
        event_end_date?: string | null;
        event_time?: string | null;
        event_end_time?: string | null;
        location: string;
        description: string;
        is_open: boolean;
    };
}

export default function EventCard({ event }: Props) {
    const isExpired = new Date(event.event_date) < new Date();
    const isOpen = event.is_open && !isExpired;

    return (
        <Link
            href={`/event/${event.slug}`}
            className="group flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        >
            {/* Image Container - Aspect Ratio 4:5 */}
            <div className="relative aspect-4/5 overflow-hidden">
                <Image
                    src={event.thumbnail_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-sm",
                        isOpen
                            ? "bg-white/95 text-gray-950"
                            : "bg-white/95 text-gray-500"
                    )}>
                        {isOpen ? 'Pendaftaran Dibuka' : 'Ditutup'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col grow p-5">
                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                    {/* Date */}
                    <div className="flex items-start gap-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                        <span className="leading-5">
                            {formatDate(event.event_date, event.event_end_date)}
                        </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                        <span className="leading-5">
                            {event.event_time
                                ? formatTime(event.event_time, event.event_end_time)
                                : 'Menyesuaikan jadwal'}
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                        <span className="leading-5 line-clamp-1">{event.location}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors duration-300">
                    {event.title}
                </h3>

                {/* View Details Link */}
                <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform duration-300">
                    Lihat Detail
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
            </div>
        </Link>
    );
}
