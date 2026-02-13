
import { Suspense } from "react";
import { getProgramKerja, getDivisions, getProgramKerjaDocuments } from "@/lib/queries/public";
import ProgramList from "@/components/program/ProgramList";
import { FileText, Download } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Program Kerja - HMPSINF",
    description: "Daftar Program Kerja Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.",
};

export default async function ProgramKerjaPage() {
    const [programs, divisions, documents] = await Promise.all([
        getProgramKerja(),
        getDivisions(),
        getProgramKerjaDocuments(),
    ]);

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            {/* Background Gradient - Matched from News/Event Page */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section - Centered & Clean */}
                <header className="mb-10 md:mb-14 text-center max-w-3xl mx-auto pt-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-outfit tracking-tight">
                        Program Kerja
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        Transparansi dan akuntabilitas dalam setiap langkah. Berikut adalah daftar program kerja yang telah, sedang, dan akan kami laksanakan.
                    </p>
                </header>

                <ProgramList programs={programs} divisions={divisions} documents={documents} />
            </div>
        </main>
    );
}

// Client Component for Search & Filter Logic
// I will place this in the same file for now for simplicity, or separate if it gets too large.
// Since it's a server component file, I need to extract the client part.
// Actually, let's create a separate Client Component `ProgramList.tsx` to handle state.
