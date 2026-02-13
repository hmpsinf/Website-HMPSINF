"use client";

import Image from "next/image";
import { User, Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";

interface DivisionMemberCardProps {
    member: {
        id: string;
        member_name: string;
        position: string;
        photo_url: string | null;
        instagram: string | null;
        whatsapp: string | null;
    };
    divisionColor: string;
}

export default function DivisionMemberCard({ member, divisionColor }: DivisionMemberCardProps) {
    // Function to format phone number for WhatsApp
    const getWhatsappUrl = (phone: string) => {
        let cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.startsWith("0")) {
            cleanPhone = "62" + cleanPhone.slice(1);
        }
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
            <div className="flex flex-row h-full">
                {/* Image Section - Fixed width on mobile, percentage on desktop */}
                <div className="relative w-28 shrink-0 overflow-hidden sm:w-1/3">
                    <div className="aspect-3/4 h-full w-full sm:aspect-square">
                        {member.photo_url ? (
                            <Image
                                src={member.photo_url}
                                alt={member.member_name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 112px, (max-width: 1024px) 33vw, 25vw"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
                                <User className="h-8 w-8 text-gray-300 dark:text-gray-600 sm:h-12 sm:w-12" />
                            </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                    </div>
                </div>

                {/* Content Section */}
                <div className="relative flex flex-1 flex-col justify-center p-3 sm:p-5">
                    <div className="mb-1.5 sm:mb-2">
                        <span
                            className="inline-block rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
                            style={{
                                backgroundColor: `${divisionColor}10`, // ~6% opacity
                                color: divisionColor,
                            }}
                        >
                            {member.position}
                        </span>
                    </div>

                    <h3 className="font-outfit text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 line-clamp-2 leading-tight">
                        {member.member_name}
                    </h3>

                    {/* Social Links */}
                    <div className="mt-2 sm:mt-4 flex items-center gap-1.5 sm:gap-2">
                        {member.instagram && (
                            <Link
                                href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-gray-50 p-1.5 text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-pink-900/20 dark:hover:text-pink-400"
                                aria-label={`Instagram ${member.member_name}`}
                            >
                                <Instagram className="h-4 w-4" />
                            </Link>
                        )}
                        {member.whatsapp && (
                            <Link
                                href={getWhatsappUrl(member.whatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-gray-50 p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                                aria-label={`Chat ${member.member_name}`}
                            >
                                <MessageCircle className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
