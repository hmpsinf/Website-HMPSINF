"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { User, Instagram, MessageCircle, ChevronRight } from 'lucide-react';
import { generatePatternSvg } from '@/lib/pattern';
import ScrollRow from './ScrollRow';

interface DivisionLeader {
    id: string;
    member_name: string;
    position: string;
    photo_url: string | null;
    instagram: string | null;
    whatsapp: string | null;
}

interface Division {
    id: string;
    name: string;
    description: string | null;
    color: string;
    leaders: DivisionLeader[];
}

// Division leader card — uniform size matching HIMA Inti cards
function DivisionLeaderCard({
    memberName,
    position,
    photoUrl,
    instagram,
    whatsapp,
    divisionColor,
}: {
    memberName: string;
    position: string;
    photoUrl: string | null;
    instagram: string | null;
    whatsapp: string | null;
    divisionColor: string;
}) {
    const patternStyle = {
        backgroundImage: `url("${generatePatternSvg(divisionColor)}")`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'repeat' as const,
    };

    return (
        <div className="w-[200px] sm:w-[220px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            {/* Photo — 2:3 aspect ratio, same as HIMA Inti cards */}
            <div
                className="relative aspect-2/3 w-full overflow-hidden bg-white dark:bg-gray-900"
                style={patternStyle}
            >
                {photoUrl ? (
                    <Image
                        src={photoUrl}
                        alt={memberName}
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

            {/* Content */}
            <div className="p-3.5">
                <div className="mb-2">
                    <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-relaxed text-white"
                        style={{ backgroundColor: divisionColor }}
                    >
                        {position}
                    </span>
                </div>

                {/* Social Links */}
                {(instagram || whatsapp) && (
                    <div className="flex flex-col gap-1.5 mt-2">
                        {instagram && (
                            <a
                                href={`https://instagram.com/${instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Instagram: @${instagram.replace('@', '')}`}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-pink-500 transition-colors dark:text-gray-400 dark:hover:text-pink-400"
                            >
                                <Instagram className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs break-all leading-tight">@{instagram.replace('@', '')}</span>
                            </a>
                        )}
                        {whatsapp && (
                            <a
                                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp: ${whatsapp}`}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors dark:text-gray-400 dark:hover:text-green-400"
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

export default function DivisionTabs({ divisions }: { divisions: Division[] }) {
    const [activeTab, setActiveTab] = useState(0);
    const tabsRef = useRef<HTMLDivElement>(null);
    const [showScrollHint, setShowScrollHint] = useState(false);

    // Check if tabs are overflowing (scrollable) on mobile
    useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;

        const checkOverflow = () => {
            const isOverflowing = el.scrollWidth > el.clientWidth + 4;
            const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
            setShowScrollHint(isOverflowing && !isAtEnd);
        };

        checkOverflow();
        el.addEventListener('scroll', checkOverflow, { passive: true });
        window.addEventListener('resize', checkOverflow);
        return () => {
            el.removeEventListener('scroll', checkOverflow);
            window.removeEventListener('resize', checkOverflow);
        };
    }, [divisions.length]);

    if (divisions.length === 0) return null;

    const activeDivision = divisions[activeTab];

    // Filter leaders for hierarchy
    const dosenPendamping = activeDivision.leaders.find(
        (l) => l.position === 'Dosen Pendamping' || l.position === 'Dospem'
    );
    const otherLeaders = activeDivision.leaders.filter(
        (l) => l.position !== 'Dosen Pendamping' && l.position !== 'Dospem'
    );

    return (
        <div>
            {/* Tab buttons — horizontal scroll on mobile */}
            <div className="relative mb-8">
                <div
                    ref={tabsRef}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-center md:flex-wrap"
                >
                    {divisions.map((division, index) => (
                        <button
                            key={division.id}
                            onClick={() => setActiveTab(index)}
                            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all border ${activeTab === index
                                ? 'text-white border-transparent'
                                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            style={
                                activeTab === index
                                    ? { backgroundColor: division.color }
                                    : undefined
                            }
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full shrink-0 ${activeTab === index ? 'bg-white/50' : ''
                                    }`}
                                style={
                                    activeTab !== index
                                        ? { backgroundColor: division.color }
                                        : undefined
                                }
                            />
                            {division.name}
                        </button>
                    ))}
                </div>
                {/* Animated scroll hint — bouncing chevron on mobile */}
                {showScrollHint && (
                    <div className="pointer-events-none absolute right-0 top-0 bottom-2 flex items-center md:hidden">
                        <div className="animate-bounce-x flex items-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm p-1">
                            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Active tab content */}
            <div className="min-h-[200px]">
                {activeDivision.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
                        {activeDivision.description}
                    </p>
                )}

                {activeDivision.leaders.length > 0 ? (
                    <div className="flex flex-col items-center">
                        {/* Tier 1: Dosen Pendamping (Root) */}
                        {dosenPendamping && (
                            <DivisionLeaderCard
                                memberName={dosenPendamping.member_name}
                                position={dosenPendamping.position}
                                photoUrl={dosenPendamping.photo_url}
                                instagram={dosenPendamping.instagram}
                                whatsapp={dosenPendamping.whatsapp}
                                divisionColor={activeDivision.color}
                            />
                        )}

                        {/* Connector Line */}
                        {dosenPendamping && otherLeaders.length > 0 && (
                            <div className="flex flex-col items-center w-full py-6">
                                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
                            </div>
                        )}

                        {/* Tier 2: Division Leaders (Ketua/Wakil) */}
                        {otherLeaders.length > 0 && (
                            <div className="w-full">
                                {/* If we have a single leader and no Dospem, center it. If multiple, use scroll/grid */}
                                {otherLeaders.length === 1 && !dosenPendamping ? (
                                    <div className="flex justify-center">
                                        <DivisionLeaderCard
                                            memberName={otherLeaders[0].member_name}
                                            position={otherLeaders[0].position}
                                            photoUrl={otherLeaders[0].photo_url}
                                            instagram={otherLeaders[0].instagram}
                                            whatsapp={otherLeaders[0].whatsapp}
                                            divisionColor={activeDivision.color}
                                        />
                                    </div>
                                ) : (
                                    /* Use ScrollRow for multiple leaders or if under Dospem */
                                    <ScrollRow>
                                        {otherLeaders.map((leader) => (
                                            <DivisionLeaderCard
                                                key={leader.id}
                                                memberName={leader.member_name}
                                                position={leader.position}
                                                photoUrl={leader.photo_url}
                                                instagram={leader.instagram}
                                                whatsapp={leader.whatsapp}
                                                divisionColor={activeDivision.color}
                                            />
                                        ))}
                                    </ScrollRow>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 py-10 text-center">
                        <User className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Belum ada pimpinan divisi
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
