
"use client";

import { useState, useMemo } from "react";
import ProgramFilter from "@/components/program/ProgramFilter";
import ProgramCard from "@/components/program/ProgramCard";
import { Search, FileText, Download } from "lucide-react";

interface Program {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    start_date: string | null;
    end_date: string | null;
    owner_type: string;
    division_id: string | null;
    division_name: string | null;
    division_color: string | null;
    document_url: string | null;
    document_name: string | null;
    location: string | null;
}

interface Division {
    id: string;
    name: string;
}

interface Document {
    id: string;
    name: string;
    file_url: string;
    file_type: string | null;
    file_size: number;
    created_at: string;
    owner_type: string;
    division_id: string | null;
}

interface ProgramListProps {
    programs: Program[];
    divisions: Division[];
    documents: Document[];
}

export default function ProgramList({ programs, divisions, documents }: ProgramListProps) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPrograms = useMemo(() => {
        return programs.filter((program) => {
            // Filter by Division/Owner
            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "hima" && program.owner_type === "hima") ||
                program.division_id === activeFilter;

            // Filter by Search
            const matchesSearch =
                program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (program.description && program.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesFilter && matchesSearch;
        });
    }, [programs, activeFilter, searchQuery]);

    const filteredDocuments = useMemo(() => {
        if (activeFilter === "all") {
            return documents;
        }
        if (activeFilter === "hima") {
            return documents.filter((d) => d.owner_type === "hima");
        }
        return documents.filter((d) => d.division_id === activeFilter);
    }, [documents, activeFilter]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content: Program List & Filter */}
            <div className="lg:col-span-3 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 md:p-2">
                    {/* Filter Tabs */}
                    <div className="flex-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <ProgramFilter
                            divisions={divisions}
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72 shrink-0 md:pr-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari program..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                        />
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPrograms.length > 0 ? (
                        filteredPrograms.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-900 mb-4 border border-gray-200 dark:border-gray-800">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                Tidak ada program ditemukan
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Coba sesuaikan filter atau kata kunci pencarian Anda.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar: General Documents */}
            <div className="lg:col-span-1 space-y-8 mb-12 lg:mb-0">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600 dark:text-brand-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            Dokumen Umum
                        </h3>
                    </div>

                    {filteredDocuments.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredDocuments.map((doc) => (
                                <li key={doc.id}>
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    >
                                        <div className="mt-1 text-gray-400 group-hover:text-brand-500 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate transition-colors">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(doc.created_at).toLocaleDateString("id-ID", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            Tidak ada dokumen
                            {activeFilter !== "all" && " untuk divisi ini"}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
