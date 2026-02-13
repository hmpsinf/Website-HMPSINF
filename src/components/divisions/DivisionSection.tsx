"use client";

import { motion } from "framer-motion";
import DivisionMemberCard from "./DivisionMemberCard";

interface DivisionSectionProps {
    division: {
        id: string;
        name: string;
        description: string | null;
        color: string;
        members: {
            id: string;
            member_name: string;
            position: string;
            photo_url: string | null;
            instagram: string | null;
            whatsapp: string | null;
        }[];
    };
    index: number;
}

export default function DivisionSection({ division, index }: DivisionSectionProps) {
    // Sort members to put Ketua/Koordinator first
    const sortedMembers = [...division.members].sort((a, b) => {
        const getRank = (position: string) => {
            const p = position.toLowerCase();
            if (p.includes("dosen pendamping") || p.includes("pembina")) return 0;
            if (p.includes("ketua") || p.includes("koordinator")) return 1;
            if (p.includes("wakil")) return 2;
            if (p.includes("sekretaris")) return 3;
            if (p.includes("bendahara")) return 4;
            return 5;
        };
        return getRank(a.position) - getRank(b.position);
    });

    return (
        <section
            id={`division-${division.id}`}
            className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800 first:border-0"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Division Search & Info - Sticky */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span
                                className="h-8 w-1 rounded-full"
                                style={{ backgroundColor: division.color }}
                            ></span>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-outfit">
                                {division.name}
                            </h2>
                        </div>

                        {division.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                                {division.description}
                            </p>
                        )}

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {sortedMembers.slice(0, 4).map((member) => ( // Show preview of up to 4 avatars
                                        <div
                                            key={member.id}
                                            className="relative h-10 w-10 rounded-full border-2 border-white dark:border-gray-950 overflow-hidden bg-gray-100"
                                        >
                                            {member.photo_url ? (
                                                <img src={member.photo_url} alt={member.member_name} className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                    ))}
                                    {sortedMembers.length > 4 && (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-950 dark:bg-gray-800">
                                            +{sortedMembers.length - 4}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {division.members.length} Anggota
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Division Members Grid */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedMembers.map((member, i) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <DivisionMemberCard
                                    member={member}
                                    divisionColor={division.color}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
