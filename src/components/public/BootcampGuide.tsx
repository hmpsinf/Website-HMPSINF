"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Menu, Download, Copy, Check, ChevronRight, BookOpen, Terminal, Database, Route, Monitor, Rocket, Hand, Lightbulb, CheckCircle2, AlertTriangle, Target, PartyPopper } from "lucide-react";

// ─── Table of Contents Data ───
interface TocItem {
    id: string;
    label: string;
    level: number; // 1 = session, 2 = step
    icon?: React.ReactNode;
}

const tocItems: TocItem[] = [
    { id: "intro", label: "Pendahuluan", level: 1, icon: <BookOpen className="w-4 h-4" /> },
    { id: "sesi-1", label: "Sesi 1 — Setup Project & Template", level: 1, icon: <Terminal className="w-4 h-4" /> },
    { id: "step-1-1", label: "1.1 Buat Project Laravel", level: 2 },
    { id: "step-1-2", label: "1.2 Konfigurasi Database", level: 2 },
    { id: "step-1-3", label: "1.3 Integrasi Template SB Admin 2", level: 2 },
    { id: "step-1-4", label: "1.4 Buat Layout Master (Starter)", level: 2 },
    { id: "step-1-5", label: "1.5 Link Storage", level: 2 },
    { id: "sesi-2", label: "Sesi 2 — Database", level: 1, icon: <Database className="w-4 h-4" /> },
    { id: "step-2-1", label: "2.1 Buat Migration & Model", level: 2 },
    { id: "step-2-2", label: "2.2 Struktur Tabel (Migration)", level: 2 },
    { id: "step-2-3", label: "2.3 Mass Assignment (Model)", level: 2 },
    { id: "step-2-4", label: "2.4 Data Dummy (Seeder)", level: 2 },
    { id: "sesi-3", label: "Sesi 3 — Route & Controller", level: 1, icon: <Route className="w-4 h-4" /> },
    { id: "step-3-1", label: "3.1 Buat Controller Resource", level: 2 },
    { id: "step-3-2", label: "3.2 Setup Route", level: 2 },
    { id: "sesi-4", label: "Sesi 4 — Membuat Tampilan (Views)", level: 1, icon: <Monitor className="w-4 h-4" /> },
    { id: "step-4-1", label: "4.1 Daftar Event (Index)", level: 2 },
    { id: "step-4-2", label: "4.2 Form Partial (_form)", level: 2 },
    { id: "step-4-3", label: "4.3 Simpan Data (Create & Store)", level: 2 },
    { id: "step-4-4", label: "4.4 Detail Event (Show)", level: 2 },
    { id: "step-4-5", label: "4.5 Edit & Hapus (Update & Destroy)", level: 2 },
    { id: "hasil-akhir", label: "Hasil Akhir", level: 1, icon: <Rocket className="w-4 h-4" /> },
];

// ─── Code Block Component ───
function CodeBlock({
    code,
    language,
    filename,
    allowCopy = false,
}: {
    code: string;
    language: string;
    filename?: string;
    allowCopy?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [code]);

    // Block copy/select events on protected code blocks
    const handlePreventCopy = useCallback((e: React.ClipboardEvent | React.MouseEvent) => {
        if (!allowCopy) {
            e.preventDefault();
        }
    }, [allowCopy]);

    const langLabel = filename || language;

    return (
        <div className="group relative my-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-800 bg-gray-900 px-4 py-2.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex gap-1.5 shrink-0">
                        <span className="h-3 w-3 rounded-full bg-red-500/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-400 truncate">{langLabel}</span>
                </div>
                {allowCopy && (
                    <button
                        onClick={handleCopy}
                        className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-gray-200"
                        title="Salin kode"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-green-400" />
                                <span className="text-green-400">Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                )}
            </div>
            {/* Code content */}
            <div
                className={`overflow-x-auto w-full p-4 ${!allowCopy ? "select-none" : ""}`}
                onCopy={handlePreventCopy}
                onMouseDown={!allowCopy ? (e) => { if (e.detail > 1) e.preventDefault(); } : undefined}
                style={!allowCopy ? { WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" } as React.CSSProperties : undefined}
            >
                <pre className="text-sm leading-relaxed">
                    <code className="font-mono text-gray-300 whitespace-pre">{code}</code>
                </pre>
            </div>
        </div>
    );
}

// ─── Section Heading ───
function SectionHeading({ id, children, badge }: { id: string; children: React.ReactNode; badge?: React.ReactNode }) {
    return (
        <h2 id={id} className="group mb-6 mt-16 flex flex-wrap items-center gap-3 scroll-mt-24 text-2xl font-bold tracking-tight text-gray-900 first:mt-0 sm:text-3xl">
            {badge && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                    {badge}
                </span>
            )}
            {children}
        </h2>
    );
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h3 id={id} className="mb-4 mt-10 scroll-mt-24 text-lg font-semibold text-gray-800 sm:text-xl">
            {children}
        </h3>
    );
}

function Paragraph({ children }: { children: React.ReactNode }) {
    return <p className="mb-4 text-base leading-relaxed text-gray-600">{children}</p>;
}

function InlineCode({ children }: { children: React.ReactNode }) {
    return (
        <code className="break-all rounded-md bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-brand-600 border border-gray-200">
            {children}
        </code>
    );
}

function InfoBox({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "tip" | "warning" }) {
    const styles = {
        info: "bg-brand-50 text-brand-800",
        tip: "bg-green-50 text-green-800",
        warning: "bg-orange-50 text-orange-800",
    };
    const icons = {
        info: <Lightbulb className="h-5 w-5 shrink-0 text-brand-600" />,
        tip: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />,
        warning: <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" />,
    };
    return (
        <div className={`my-4 flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed ${styles[type]}`}>
            {icons[type]}
            <div>{children}</div>
        </div>
    );
}

function StepList({ items }: { items: string[] }) {
    return (
        <ol className="mb-4 ml-5 list-decimal space-y-2 text-base leading-relaxed text-gray-600">
            {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
        </ol>
    );
}

function FeatureList({ items }: { items: string[] }) {
    return (
        <ul className="mb-4 ml-5 list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
            {items.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>
    );
}

// ─── Starter code (admin.blade.php) ───
const STARTER_CODE = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Event Kampus | @yield('title', 'Dashboard')</title>

    {{-- SB Admin 2 CSS --}}
    <link href="{{ asset('vendor/fontawesome-free/css/all.min.css') }}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="{{ asset('css/sb-admin-2.min.css') }}" rel="stylesheet">
    
    {{-- Custom CSS untuk reduce sidebar spacing --}}
    <style>
        body, html { font-family: 'Outfit', sans-serif !important; }
        @media (min-width: 768px) { .sidebar .nav-item .nav-link { padding: 0.5rem 1rem !important; } }
        .sidebar .nav-item { margin-bottom: 0 !important; }
        .sidebar-brand { justify-content: flex-start !important; }
        .sidebar-brand-text { font-size: 0.85rem !important; }
        .sidebar.toggled .sidebar-brand { justify-content: center !important; }
        .topbar { box-shadow: none !important; border-bottom: 1px solid #e3e6f0; }
        .card { box-shadow: none !important; border: 1px solid #e3e6f0 !important; }
        .table-responsive { border: 1px solid #e3e6f0; }
    </style>
</head>

<body id="page-top">
<div id="wrapper">

    {{-- ===== SIDEBAR ===== --}}
    <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
        <a class="sidebar-brand d-flex align-items-center" href="{{ url('/') }}">
            <div class="sidebar-brand-icon rotate-n-15"><i class="fas fa-calendar-check"></i></div>
            <div class="sidebar-brand-text mx-3">Event Kampus</div>
        </a>
        <hr class="sidebar-divider">
        <div class="sidebar-heading">Data Master</div>
        <li class="nav-item {{ request()->routeIs('events.*') ? 'active' : '' }}">
            <a class="nav-link" href="{{ route('events.index') }}">
                <i class="fas fa-fw fa-calendar-alt"></i><span>Event</span>
            </a>
        </li>
        <hr class="sidebar-divider d-none d-md-block">
        <div class="text-center d-none d-md-inline">
            <button class="rounded-circle border-0" id="sidebarToggle"></button>
        </div>
    </ul>

    {{-- ===== CONTENT WRAPPER ===== --}}
    <div id="content-wrapper" class="d-flex flex-column">
        <div id="content">
            {{-- TOPBAR --}}
            <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top">
                <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3"><i class="fa fa-bars"></i></button>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item dropdown no-arrow">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown">
                            <span class="mr-2 d-none d-lg-inline text-gray-600 small">Administrator</span>
                            <img class="img-profile rounded-circle" src="https://ui-avatars.com/api/?name=Admin&color=7F9CF5&background=EBF4FF">
                        </a>
                    </li>
                </ul>
            </nav>

            {{-- MAIN CONTENT --}}
            <div class="container-fluid">
                <div class="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 class="h3 mb-0 text-gray-800">@yield('title', 'Dashboard')</h1>
                    @yield('action-button')
                </div>
                
                {{-- DYNAMIC CONTENT DARI BLADE LAIN --}}
                @yield('content')
            </div>
        </div>

        {{-- Footer --}}
        <footer class="sticky-footer bg-white">
            <div class="container my-auto">
                <div class="copyright text-center my-auto">
                    <span>Event Kampus &copy; {{ date('Y') }}</span>
                </div>
            </div>
        </footer>
    </div>
</div>

{{-- JS Scripts --}}
<script src="{{ asset('vendor/jquery/jquery.min.js') }}"></script>
<script src="{{ asset('vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('vendor/jquery-easing/jquery.easing.min.js') }}"></script>
<script src="{{ asset('js/sb-admin-2.min.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
    @if(session('success'))
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: '{{ session("success") }}', showConfirmButton: false, timer: 2000 });
    @endif

    // Script konfirmasi hapus otomatis untuk tombol class .btn-delete
    $('.btn-delete').on('click', function(e) {
        e.preventDefault();
        let form = $(this).closest('form');
        Swal.fire({
            title: 'Yakin hapus data?', text: "Data yang dihapus tidak bisa dikembalikan!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#e74a3b', cancelButtonColor: '#858796',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) form.submit();
        })
    });
</script>
</body>
</html>`;

// ─── Main Component ───
export default function BootcampGuide() {
    const [activeId, setActiveId] = useState("intro");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // IntersectionObserver for active TOC tracking
    useEffect(() => {
        if (!mounted) return;

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            // Find the first entry that is intersecting
            const visibleEntries = entries.filter((e) => e.isIntersecting);
            if (visibleEntries.length > 0) {
                // Pick the one closest to the top
                const topEntry = visibleEntries.reduce((prev, curr) =>
                    prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
                );
                setActiveId(topEntry.target.id);
            }
        };

        observerRef.current = new IntersectionObserver(handleIntersect, {
            rootMargin: "-80px 0px -60% 0px",
            threshold: 0,
        });

        // Observe all sections
        tocItems.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observerRef.current?.observe(el);
        });

        return () => observerRef.current?.disconnect();
    }, [mounted]);

    // Block copy on protected code blocks globally
    useEffect(() => {
        if (!mounted) return;

        const handleGlobalCopy = (e: ClipboardEvent) => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer as HTMLElement;
            const codeWrapper = (container.nodeType === 3 ? container.parentElement : container)?.closest("[data-protected='true']");
            if (codeWrapper) {
                e.preventDefault();
            }
        };

        document.addEventListener("copy", handleGlobalCopy);
        return () => document.removeEventListener("copy", handleGlobalCopy);
    }, [mounted]);

    const scrollToSection = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveId(id);
            setMobileMenuOpen(false);
        }
    }, []);

    // Lock body scroll when mobile menu open
    useEffect(() => {
        if (!mounted) return;
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileMenuOpen, mounted]);

    // ─── TOC Sidebar ───
    const TocContent = () => (
        <nav className="space-y-0.5">
            {tocItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                        item.level === 2 ? "ml-4 pl-3" : "font-semibold"
                    } ${
                        activeId === item.id
                            ? item.level === 1
                                ? "bg-brand-50 text-brand-700"
                                : "border-l-2 border-brand-500 bg-brand-25 text-brand-600"
                            : item.level === 1
                                ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                >
                    {item.icon && <span className={`shrink-0 ${activeId === item.id ? "text-brand-500" : "text-gray-400"}`}>{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                </button>
            ))}
        </nav>
    );

    return (
        <main className="min-h-screen bg-white">
            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-gray-900 via-gray-800 to-brand-950">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 text-center">
                    <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Panduan Bootcamp Laravel
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
                        Membangun <span className="text-white font-medium">CRUD Event Kampus</span> dari nol hingga CRUD lengkap dengan upload gambar, dan pagination.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {["Laravel", "MySQL", "SB Admin"].map((tech) => (
                            <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Layout: Sidebar + Content ── */}
            <div className="mx-auto max-w-7xl">
                <div className="flex">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 shrink-0 border-r border-gray-200">
                        <div className="sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar p-5">
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Daftar Isi
                                </h4>
                            </div>
                            <TocContent />
                        </div>
                    </aside>

                    {/* Content Area */}
                    <article className="min-w-0 flex-1 px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
                        {/* ── Intro ── */}
                        <section id="intro">
                            <div className="mb-8 rounded-xl bg-brand-50 p-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                    <Hand className="h-6 w-6 text-brand-600" /> Selamat Datang, Peserta!
                                </h2>
                                <Paragraph>
                                    Selamat datang di <strong>Bootcamp Laravel</strong>! Pada sesi ini, kamu akan belajar membangun sebuah <strong>CRUD Event Kampus</strong> — sebuah Admin Panel yang berfungsi mengelola data acara kampus secara dinamis.
                                </Paragraph>
                                <Paragraph>
                                    Ikuti setiap langkah secara berurutan sambil mendengarkan penjelasan dari instruktur. Ketik setiap baris kode secara manual (kecuali kode starter yang disediakan tombol copy) agar kamu benar-benar memahami alur kerjanya.
                                </Paragraph>
                                <p className="text-sm font-medium text-gray-700">Fitur yang akan kamu bangun:</p>
                                <FeatureList
                                    items={[
                                        "Tampilan tabel data dengan Pagination",
                                        "Upload Gambar (Poster Event)",
                                        "Validasi form yang aman",
                                    ]}
                                />
                            </div>
                        </section>

                        {/* ═══════════════════════════════════════════════ */}
                        {/* SESI 1 — SETUP PROJECT & TEMPLATE              */}
                        {/* ═══════════════════════════════════════════════ */}
                        <section>
                            <SectionHeading id="sesi-1" badge={<><Terminal className="h-4 w-4" /> Sesi 1</>}>
                                Setup Project & Template
                            </SectionHeading>
                            <Paragraph>
                                Di sesi pertama ini, kita akan melakukan instalasi awal Laravel, mengonfigurasi koneksi database, dan mengintegrasikan template admin SB Admin 2 ke dalam project.
                            </Paragraph>

                            {/* 1.1 */}
                            <SubHeading id="step-1-1">1.1 Buat Project Laravel</SubHeading>
                            <Paragraph>
                                Buka terminal atau Command Prompt di komputer kamu, lalu jalankan perintah berikut untuk membuat project Laravel baru. Ini akan membuat folder project bernama <InlineCode>event-kampus</InlineCode> dan secara otomatis menginstall semua dependensi yang diperlukan.
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="bash"
                                    code={`composer create-project laravel/laravel=^10.0 event-kampus\ncd event-kampus`}
                                />
                            </div>

                            {/* 1.2 */}
                            <SubHeading id="step-1-2">1.2 Buat Database & Konfigurasi Lingkungan</SubHeading>
                            <Paragraph>
                                Buka aplikasi <strong>phpMyAdmin</strong> melalui <strong>Laragon</strong> kamu, lalu buat satu database baru dengan nama:
                            </Paragraph>
                            <div className="my-3 inline-block rounded-lg bg-gray-100 px-4 py-2 text-base font-semibold text-gray-800 border border-gray-200">
                                event_kampus
                            </div>
                            <Paragraph>
                                Selanjutnya, buka file <InlineCode>.env</InlineCode> yang ada di dalam folder root project Laravel kamu. Cari bagian <em>Database Connection</em> dan sesuaikan konfigurasinya menjadi seperti berikut:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="env"
                                    filename=".env"
                                    code={`DB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=event_kampus\nDB_USERNAME=root\nDB_PASSWORD=`}
                                />
                            </div>
                            <InfoBox type="tip">
                                Pastikan server <strong>Laragon</strong> sudah berjalan, dan sesuaikan <InlineCode>DB_USERNAME</InlineCode> dan <InlineCode>DB_PASSWORD</InlineCode> jika kamu pernah mengubahnya dari setelan bawaan.
                            </InfoBox>

                            {/* 1.3 */}
                            <SubHeading id="step-1-3">1.3 Integrasi Template SB Admin 2</SubHeading>
                            <Paragraph>
                                Untuk membuat tampilan admin yang rapi dan profesional, kita menggunakan template siap pakai bernama <strong>SB Admin 2</strong>. Download file template yang sudah disiapkan oleh instruktur melalui tombol di bawah ini.
                            </Paragraph>

                            {/* Download Button */}
                            <a
                                href="/downloads/sbadmin-event-kampus.zip"
                                download
                                className="group mb-6 mt-2 inline-flex items-center gap-3 rounded-xl bg-brand-50 px-6 py-4 text-brand-700 transition-all hover:bg-brand-100 active:scale-[0.98]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white transition-transform group-hover:scale-110">
                                    <Download className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Download Template SB Admin 2</div>
                                    <div className="text-xs text-brand-500">sbadmin-event-kampus.zip</div>
                                </div>
                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>

                            <Paragraph>
                                Setelah file terdownload, ikuti langkah-langkah berikut:
                            </Paragraph>
                            <StepList
                                items={[
                                    "<strong>Ekstrak file ZIP</strong> — Di dalamnya akan ada folder <code>css/</code>, <code>js/</code>, dan <code>vendor/</code>.",
                                    "<strong>Copy ke Public</strong> — Salin ketiga folder tersebut (<code>css</code>, <code>js</code>, <code>vendor</code>) ke dalam folder <code>public/</code> di project Laravel kamu.",
                                ]}
                            />

                            {/* 1.4 */}
                            <SubHeading id="step-1-4">1.4 Buat Layout Master (Starter)</SubHeading>
                            <Paragraph>
                                Sekarang, buat file baru di <InlineCode>resources/views/layouts/admin.blade.php</InlineCode>. File ini akan menjadi &ldquo;kerangka utama&rdquo; (sidebar, navbar, footer) yang membungkus semua halaman aplikasi.
                            </Paragraph>
                            <InfoBox type="info">
                                Ini adalah satu-satunya kode yang boleh kamu <strong>Copy-Paste</strong>. Gunakan tombol <strong>&ldquo;Salin&rdquo;</strong> di pojok kanan atas blok kode berikut, lalu paste ke file <InlineCode>admin.blade.php</InlineCode>.
                            </InfoBox>
                            <CodeBlock
                                language="html"
                                filename="resources/views/layouts/admin.blade.php"
                                code={STARTER_CODE}
                                allowCopy={true}
                            />

                            {/* 1.5 */}
                            <SubHeading id="step-1-5">1.5 Link Storage (Untuk Upload Gambar)</SubHeading>
                            <Paragraph>
                                Agar gambar poster yang nanti kamu upload dapat diakses melalui URL public, jalankan perintah ini di terminal:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan storage:link" />
                            </div>
                        </section>

                        <hr className="my-12 border-gray-200" />

                        {/* ═══════════════════════════════════════════════ */}
                        {/* SESI 2 — DATABASE                              */}
                        {/* ═══════════════════════════════════════════════ */}
                        <section>
                            <SectionHeading id="sesi-2" badge={<><Database className="h-4 w-4" /> Sesi 2</>}>
                                Database (Migration, Model, & Seeder)
                            </SectionHeading>
                            <Paragraph>
                                Di sesi ini, kita akan merancang struktur tabel database dan membuat data awalan (dummy) agar aplikasi punya data contoh saat pertama kali dijalankan.
                            </Paragraph>

                            {/* 2.1 */}
                            <SubHeading id="step-2-1">2.1 Buat Migration & Model</SubHeading>
                            <Paragraph>
                                Jalankan perintah berikut untuk membuat Model <InlineCode>Event</InlineCode> beserta file Migration-nya secara otomatis. Flag <InlineCode>-m</InlineCode> artinya &ldquo;sekalian buatkan migration.&rdquo;
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan make:model Event -m" />
                            </div>

                            {/* 2.2 */}
                            <SubHeading id="step-2-2">2.2 Atur Struktur Tabel (Migration)</SubHeading>
                            <Paragraph>
                                Buka folder <InlineCode>database/migrations/</InlineCode> dan cari file yang berakhiran <InlineCode>_create_events_table.php</InlineCode>. Buka file tersebut dan ubah isi method <InlineCode>up()</InlineCode> menjadi seperti berikut:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="database/migrations/xxxx_create_events_table.php"
                                    code={`public function up(): void\n{\n    Schema::create('events', function (Blueprint $table) {\n        $table->id();\n        $table->string('nama_event');\n        $table->string('poster')->nullable();\n        $table->text('deskripsi')->nullable();\n        $table->date('tanggal');\n        $table->string('tempat');\n        $table->integer('kuota');\n        $table->integer('peserta_terdaftar')->default(0);\n        $table->timestamps();\n    });\n}`}
                                />
                            </div>
                            <Paragraph>
                                Setelah itu, jalankan migrasi untuk membuat tabel di MySQL:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan migrate" />
                            </div>

                            {/* 2.3 */}
                            <SubHeading id="step-2-3">2.3 Atur Mass Assignment (Model)</SubHeading>
                            <Paragraph>
                                Buka file <InlineCode>app/Models/Event.php</InlineCode>. Tambahkan properti <InlineCode>$fillable</InlineCode> agar Laravel mengizinkan proses simpan data secara massal. Ubah seluruh isinya menjadi:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="app/Models/Event.php"
                                    code={`namespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Factories\\HasFactory;\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass Event extends Model\n{\n    use HasFactory;\n\n    protected $fillable = [\n        'nama_event', 'poster', 'deskripsi', 'tanggal', \n        'tempat', 'kuota', 'peserta_terdaftar'\n    ];\n}`}
                                />
                            </div>

                            {/* 2.4 */}
                            <SubHeading id="step-2-4">2.4 Buat Data Dummy (Seeder)</SubHeading>
                            <Paragraph>
                                Buat file seeder untuk mengisi data contoh secara otomatis:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan make:seeder EventSeeder" />
                            </div>

                            <Paragraph>
                                Buka file <InlineCode>database/seeders/EventSeeder.php</InlineCode> dan isi dengan data dummy berikut:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="database/seeders/EventSeeder.php"
                                    code={`namespace Database\\Seeders;\n\nuse Illuminate\\Database\\Seeder;\nuse App\\Models\\Event;\n\nclass EventSeeder extends Seeder\n{\n    public function run(): void\n    {\n        Event::create([\n            'nama_event' => 'Bootcamp Laravel Dasar',\n            'deskripsi' => 'Belajar membuat sistem informasi event kampus.',\n            'tanggal' => '2024-10-25',\n            'tempat' => 'Lab Komputer A',\n            'kuota' => 50,\n            'peserta_terdaftar' => 10,\n            'poster' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80',\n        ]);\n\n        Event::create([\n            'nama_event' => 'Workshop UI/UX Design',\n            'deskripsi' => 'Mengenal dasar-dasar desain antarmuka.',\n            'tanggal' => '2024-10-28',\n            'tempat' => 'Aula Utama',\n            'kuota' => 100,\n            'peserta_terdaftar' => 100,\n            'poster' => 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&q=80',\n        ]);\n    }\n}`}
                                />
                            </div>

                            <Paragraph>
                                Daftarkan <InlineCode>EventSeeder</InlineCode> ke dalam file induk <InlineCode>database/seeders/DatabaseSeeder.php</InlineCode>:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="database/seeders/DatabaseSeeder.php"
                                    code={`namespace Database\\Seeders;\n\nuse Illuminate\\Database\\Seeder;\n\nclass DatabaseSeeder extends Seeder\n{\n    public function run(): void\n    {\n        $this->call([\n            EventSeeder::class,\n        ]);\n    }\n}`}
                                />
                            </div>

                            <Paragraph>
                                Jalankan perintah berikut untuk mengeksekusi Seeder dan mengisi database dengan data contoh:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan db:seed" />
                            </div>
                        </section>

                        <hr className="my-12 border-gray-200" />

                        {/* ═══════════════════════════════════════════════ */}
                        {/* SESI 3 — ROUTE & CONTROLLER                    */}
                        {/* ═══════════════════════════════════════════════ */}
                        <section>
                            <SectionHeading id="sesi-3" badge={<><Route className="h-4 w-4" /> Sesi 3</>}>
                                Route & Controller Dasar
                            </SectionHeading>
                            <Paragraph>
                                Sekarang saatnya menyiapkan jalur URL (Route) dan logika pengelolaan data (Controller) agar aplikasi kita bisa merespons permintaan dari browser.
                            </Paragraph>

                            {/* 3.1 */}
                            <SubHeading id="step-3-1">3.1 Buat Controller Resource</SubHeading>
                            <Paragraph>
                                Gunakan opsi <InlineCode>--resource</InlineCode> untuk membuat controller yang sudah berisi method CRUD lengkap secara otomatis (index, create, store, show, edit, update, destroy):
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan make:controller EventController --resource" />
                            </div>

                            {/* 3.2 */}
                            <SubHeading id="step-3-2">3.2 Setup Route</SubHeading>
                            <Paragraph>
                                Buka file <InlineCode>routes/web.php</InlineCode>, hapus seluruh isinya, lalu ganti dengan kode berikut. Kode ini mendaftarkan semua route CRUD secara otomatis menggunakan <InlineCode>Route::resource</InlineCode>:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="routes/web.php"
                                    code={`<?php\n\nuse Illuminate\\Support\\Facades\\Route;\nuse App\\Http\\Controllers\\EventController;\n\n// Arahkan halaman utama langsung ke daftar event\nRoute::get('/', function () {\n    return redirect()->route('events.index');\n});\n\nRoute::resource('events', EventController::class);`}
                                />
                            </div>
                        </section>

                        <hr className="my-12 border-gray-200" />

                        {/* ═══════════════════════════════════════════════ */}
                        {/* SESI 4 — MEMBUAT TAMPILAN (VIEWS)              */}
                        {/* ═══════════════════════════════════════════════ */}
                        <section>
                            <SectionHeading id="sesi-4" badge={<><Monitor className="h-4 w-4" /> Sesi 4</>}>
                                Membuat Tampilan (Views)
                            </SectionHeading>
                            <Paragraph>
                                Di sesi terakhir ini, kita akan merakit halaman-halaman aplikasi menggunakan Blade — template engine bawaan Laravel. Ingat: <strong>struktur HTML dasar bisa kamu ambil dari file HTML mentah (dummy) di dalam ZIP instruktur</strong>, lalu kita konversi menjadi Blade syntax.
                            </Paragraph>

                            {/* 4.1 */}
                            <SubHeading id="step-4-1">4.1 Menampilkan Daftar Event (Index)</SubHeading>
                            <Paragraph>
                                Buka <InlineCode>app/Http/Controllers/EventController.php</InlineCode> dan update method <InlineCode>index</InlineCode> menjadi:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="EventController.php → index()"
                                    code={`use App\\Models\\Event;\n\npublic function index()\n{\n    $events = Event::latest()->paginate(10);\n    return view('events.index', compact('events'));\n}`}
                                />
                            </div>

                            <Paragraph>
                                Buat file <InlineCode>resources/views/events/index.blade.php</InlineCode> dan ketikkan kode berikut. File ini menampilkan tabel daftar event dengan data dinamis dari database:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="html"
                                    filename="resources/views/events/index.blade.php"
                                    code={`@extends('layouts.admin')\n\n@section('title', 'Data Event')\n\n@section('action-button')
    <a href="{{ route('events.create') }}" class="btn btn-primary btn-sm">
        <i class="fas fa-plus fa-sm text-white-50 mr-1"></i> Tambah Event
    </a>
@endsection

@section('content')
<div class="card border mb-4">
    <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Daftar Event</h6>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-bordered table-hover" width="100%" cellspacing="0">
                <thead class="thead-light">
                    <tr>
                        <th width="5%">#</th>
                        <th width="10%">Poster</th>
                        <th>Nama Event</th>
                        <th>Tanggal</th>
                        <th>Tempat</th>
                        <th width="10%">Kuota</th>
                        <th width="10%">Daftar</th>
                        <th width="18%">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($events as $event)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td class="text-center">
                            @if($event->poster)
                                <img src="{{ asset('storage/posters/' . $event->poster) }}" alt="Poster" class="img-thumbnail" width="50">
                            @else
                                <span class="text-muted small">Tidak ada</span>
                            @endif
                        </td>
                        <td>{{ $event->nama_event }}</td>
                        <td>{{ \\Carbon\\Carbon::parse($event->tanggal)->locale('id')->isoFormat('dddd, DD MMM YYYY') }}</td>
                        <td>{{ $event->tempat }}</td>
                        <td class="text-center">{{ $event->kuota }}</td>
                        <td class="text-center">
                            <span class="badge badge-{{ $event->peserta_terdaftar >= $event->kuota ? 'danger' : 'success' }}">
                                {{ $event->peserta_terdaftar }}/{{ $event->kuota }}
                            </span>
                        </td>
                        <td>
                            <a href="{{ route('events.show', $event) }}" class="btn btn-info btn-sm"><i class="fas fa-eye"></i></a>
                            <a href="{{ route('events.edit', $event) }}" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></a>
                            <form action="{{ route('events.destroy', $event) }}" method="POST" class="d-inline">
                                @csrf @method('DELETE')
                                <button class="btn btn-danger btn-sm btn-delete" type="submit"><i class="fas fa-trash"></i></button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="text-center text-muted">Belum ada event. Tambahkan Sekarang</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-end mt-3 ml-3">
            {{ $events->links('pagination::bootstrap-5') }}
        </div>
    </div>
</div>
@endsection`}
                                />
                            </div>

                            {/* 4.2 */}
                            <SubHeading id="step-4-2">4.2 Form Input Dinamis (Partial)</SubHeading>
                            <Paragraph>
                                Karena form <strong>Tambah</strong> dan <strong>Edit</strong> isinya sama, kita buat satu file form yang bisa dipakai dua kali — prinsip <em>Don&apos;t Repeat Yourself (DRY)</em>.
                            </Paragraph>
                            <Paragraph>
                                Buat file <InlineCode>resources/views/events/_form.blade.php</InlineCode>:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="html"
                                    filename="resources/views/events/_form.blade.php"
                                    code={`<div class="row">\n    <div class="col-md-8">\n        <div class="form-group">\n            <label for="nama_event">Nama Event <span class="text-danger">*</span></label>\n            <input type="text" name="nama_event" id="nama_event"\n                class="form-control @error('nama_event') is-invalid @enderror"\n                value="{{ old('nama_event', $event->nama_event ?? '') }}"\n                placeholder="Contoh: Seminar Nasional IT 2024">\n            @error('nama_event')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n        </div>\n    </div>\n\n    <div class="col-md-4">\n        <div class="form-group">\n            <label for="tanggal">Tanggal <span class="text-danger">*</span></label>\n            <input type="date" name="tanggal" id="tanggal" class="form-control @error('tanggal') is-invalid @enderror"\n                value="{{ old('tanggal', $event->tanggal ?? '') }}">\n            @error('tanggal')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n        </div>\n    </div>\n\n    <div class="col-md-6">\n        <div class="form-group">\n            <label for="tempat">Tempat <span class="text-danger">*</span></label>\n            <input type="text" name="tempat" id="tempat" class="form-control @error('tempat') is-invalid @enderror"\n                value="{{ old('tempat', $event->tempat ?? '') }}" placeholder="Contoh: Aula Gedung A">\n            @error('tempat')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n        </div>\n    </div>\n\n    <div class="col-md-3">\n        <div class="form-group">\n            <label for="kuota">Kuota <span class="text-danger">*</span></label>\n            <input type="number" name="kuota" id="kuota" class="form-control @error('kuota') is-invalid @enderror"\n                value="{{ old('kuota', $event->kuota ?? '') }}" min="1" placeholder="100">\n            @error('kuota')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n        </div>\n    </div>\n\n    <div class="col-md-3">\n        <div class="form-group">\n            <label for="peserta_terdaftar">Pendaftar</label>\n            <input type="number" name="peserta_terdaftar" id="peserta_terdaftar" class="form-control @error('peserta_terdaftar') is-invalid @enderror"\n                value="{{ old('peserta_terdaftar', $event->peserta_terdaftar ?? '0') }}" min="0" placeholder="0">\n            @error('peserta_terdaftar')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n        </div>\n    </div>\n\n    <div class="col-md-12">\n        <div class="form-group">\n            <label for="deskripsi">Deskripsi</label>\n            <textarea name="deskripsi" id="deskripsi" rows="3"\n                class="form-control @error('deskripsi') is-invalid @enderror"\n                placeholder="Deskripsi singkat event...">{{ old('deskripsi', $event->deskripsi ?? '') }}</textarea>\n            @error('deskripsi')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n        </div>\n    </div>\n\n    <div class="col-md-12">\n        <div class="form-group">\n            <label for="poster">Poster Event <small class="text-muted">(Opsional, Format: JPG,PNG,JPEG | Max 2MB)</small></label>\n            <input type="file" name="poster" id="poster" class="form-control-file @error('poster') is-invalid @enderror" accept="image/*">\n            @error('poster')\n                <div class="invalid-feedback">{{ $message }}</div>\n            @enderror\n            @if($event->poster ?? false)\n                <div class="mt-2">\n                    <img src="{{ asset('storage/posters/' . $event->poster) }}" alt="Poster" class="img-thumbnail" width="150">\n                </div>\n            @endif\n        </div>\n    </div>\n</div>`}
                                />
                            </div>

                            {/* 4.3 */}
                            <SubHeading id="step-4-3">4.3 Simpan Data (Create & Store)</SubHeading>
                            <Paragraph>
                                Kembali ke <InlineCode>EventController.php</InlineCode>, update method <InlineCode>create</InlineCode> dan <InlineCode>store</InlineCode>. Method <InlineCode>create</InlineCode> menampilkan halaman form, sedangkan <InlineCode>store</InlineCode> memproses penyimpanan data ke database:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="EventController.php → create() & store()"
                                    code={`use App\\Models\\Event;\nuse Illuminate\\Http\\Request;\n\npublic function create()\n{\n    return view('events.create');\n}\n\npublic function store(Request $request)\n{\n    // Validasi data yang masuk\n    $validated = $request->validate([\n        'nama_event' => 'required|string|max:255',\n        'poster'     => 'nullable|image|mimes:jpeg,png,jpg|max:2048',\n        'tanggal'    => 'required|date',\n        'tempat'     => 'required|string',\n        'kuota'      => 'required|integer|min:1',\n        'peserta_terdaftar' => 'nullable|integer|min:0',\n        'deskripsi'  => 'nullable|string',\n    ]);\n\n    // Proses upload gambar\n    if ($request->hasFile('poster')) {\n        $image = $request->file('poster');\n        $image->storeAs('public/posters', $image->hashName());\n        $validated['poster'] = $image->hashName();\n    }\n\n    Event::create($validated);\n    return redirect()->route('events.index')->with('success', 'Event berhasil ditambahkan!');\n}`}
                                />
                            </div>

                            <Paragraph>
                                Buat file halaman form-nya di <InlineCode>resources/views/events/create.blade.php</InlineCode>:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="html"
                                    filename="resources/views/events/create.blade.php"
                                    code={`@extends('layouts.admin')\n@section('title', 'Tambah Event')\n@section('content')\n\n<div class="card border mb-4">\n    <div class="card-header py-3">\n        <h6 class="m-0 font-weight-bold text-primary">Form Tambah Event</h6>\n    </div>\n    <div class="card-body">\n        <form action="{{ route('events.store') }}" method="POST" enctype="multipart/form-data">\n            @csrf\n            \n            {{-- Panggil partial form yang sudah kita buat --}}\n            @include('events._form')\n            \n            <a href="{{ route('events.index') }}" class="btn btn-secondary">Batal</a>\n            <button type="submit" class="btn btn-primary">\n                <i class="fas fa-save mr-1"></i> Simpan\n            </button>\n        </form>\n    </div>\n</div>\n\n@endsection`}
                                />
                            </div>

                            {/* 4.4 */}
                            <SubHeading id="step-4-4">4.4 Detail Event (Show)</SubHeading>
                            <Paragraph>
                                Update method <InlineCode>show</InlineCode> di Controller:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="EventController.php → show()"
                                    code={`use App\\Models\\Event;\n\npublic function show(Event $event)\n{\n    return view('events.show', compact('event'));\n}`}
                                />
                            </div>

                            <Paragraph>
                                Buat file <InlineCode>resources/views/events/show.blade.php</InlineCode> untuk menampilkan detail satu event:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="html"
                                    filename="resources/views/events/show.blade.php"
                                    code={`@extends('layouts.admin')\n\n@section('title', 'Detail Event')\n\n@section('action-button')
    <a href="{{ route('events.index') }}" class="btn btn-secondary btn-sm">
        <i class="fas fa-arrow-left fa-sm text-white-50 mr-1"></i> Kembali
    </a>
@endsection

@section('content')
<div class="row">
    {{-- Kotak Poster --}}
    <div class="col-lg-4">
        <div class="card border mb-4">
            <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">Poster Event</h6>
            </div>
            <div class="card-body text-center">
                @if($event->poster)
                    <img src="{{ asset('storage/posters/' . $event->poster) }}" alt="Poster" class="img-fluid rounded mb-3" style="max-height: 250px;">
                @else
                    <div class="bg-light rounded p-4 mb-3 text-muted">
                        <i class="fas fa-image fa-3x mb-2"></i><br>Tidak ada poster
                    </div>
                @endif
            </div>
        </div>
    </div>

    {{-- Kotak Info --}}
    <div class="col-lg-8">
        <div class="card border mb-4">
            <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">Informasi Event</h6>
            </div>
            <div class="card-body">
                <table class="table table-borderless mb-0">
                    <tr>
                        <th width="25%">Nama Event</th>
                        <td>{{ $event->nama_event }}</td>
                    </tr>
                    <tr>
                        <th>Tanggal</th>
                        <td>{{ \\Carbon\\Carbon::parse($event->tanggal)->locale('id')->isoFormat('dddd, DD MMMM YYYY') }}</td>
                    </tr>
                    <tr>
                        <th>Tempat</th>
                        <td>{{ $event->tempat }}</td>
                    </tr>
                    <tr>
                        <th>Kuota</th>
                        <td><span class="badge badge-primary">{{ $event->kuota }} orang</span></td>
                    </tr>
                    <tr>
                        <th>Pendaftar</th>
                        <td><span class="badge badge-{{ $event->peserta_terdaftar >= $event->kuota ? 'danger' : 'success' }}">{{ $event->peserta_terdaftar }} orang</span></td>
                    </tr>
                    <tr>
                        <th>Deskripsi</th>
                        <td>{{ $event->deskripsi ?? '-' }}</td>
                    </tr>
                </table>
            </div>
            <div class="card-footer">
                <a href="{{ route('events.edit', $event) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit mr-1"></i> Edit
                </a>
                <form action="{{ route('events.destroy', $event) }}" method="POST" class="d-inline">
                    @csrf @method('DELETE')
                    <button class="btn btn-danger btn-sm btn-delete" type="submit">
                        <i class="fas fa-trash mr-1"></i> Hapus
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection`}
                                />
                            </div>

                            {/* 4.5 */}
                            <SubHeading id="step-4-5">4.5 Edit dan Hapus Data (Update & Destroy)</SubHeading>
                            <Paragraph>
                                Terakhir, lengkapi fitur Edit dan Hapus di Controller. Method <InlineCode>edit</InlineCode> menampilkan form yang sudah terisi data, <InlineCode>update</InlineCode> menyimpan perubahan, dan <InlineCode>destroy</InlineCode> menghapus data beserta file poster-nya:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="php"
                                    filename="EventController.php → edit(), update(), destroy()"
                                    code={`use App\\Models\\Event;\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Support\\Facades\\Storage;\n\npublic function edit(Event $event)\n{\n    return view('events.edit', compact('event'));\n}\n\npublic function update(Request $request, Event $event)\n{\n    $validated = $request->validate([\n        'nama_event' => 'required|string|max:255',\n        'poster'     => 'nullable|image|mimes:jpeg,png,jpg|max:2048',\n        'tanggal'    => 'required|date',\n        'tempat'     => 'required|string',\n        'kuota'      => 'required|integer|min:1',\n        'peserta_terdaftar' => 'nullable|integer|min:0',\n        'deskripsi'  => 'nullable|string',\n    ]);\n\n    if ($request->hasFile('poster')) {\n        // Hapus file lama di server jika ada\n        if ($event->poster) {\n            Storage::disk('public')->delete('posters/' . $event->poster);\n        }\n        \n        $image = $request->file('poster');\n        $image->storeAs('public/posters', $image->hashName());\n        $validated['poster'] = $image->hashName();\n    }\n\n    $event->update($validated);\n    return redirect()->route('events.index')->with('success', 'Event berhasil diperbarui!');\n}\n\npublic function destroy(Event $event)\n{\n    if ($event->poster) {\n        Storage::disk('public')->delete('posters/' . $event->poster);\n    }\n\n    $event->delete();\n    return redirect()->route('events.index')->with('success', 'Event dihapus!');\n}`}
                                />
                            </div>

                            <Paragraph>
                                Buat file halaman edit di <InlineCode>resources/views/events/edit.blade.php</InlineCode>:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock
                                    language="html"
                                    filename="resources/views/events/edit.blade.php"
                                    code={`@extends('layouts.admin')\n@section('title', 'Edit Event')\n@section('content')\n\n<div class="card border mb-4">\n    <div class="card-header py-3">\n        <h6 class="m-0 font-weight-bold text-warning">Form Edit Event</h6>\n    </div>\n    <div class="card-body">\n        <form action="{{ route('events.update', $event) }}" method="POST" enctype="multipart/form-data">\n            @csrf \n            @method('PUT')\n            \n            {{-- Panggil partial form --}}\n            @include('events._form')\n            \n            <a href="{{ route('events.index') }}" class="btn btn-secondary">Batal</a>\n            <button type="submit" class="btn btn-warning">\n                <i class="fas fa-sync mr-1"></i> Update\n            </button>\n        </form>\n    </div>\n</div>\n\n@endsection`}
                                />
                            </div>
                        </section>

                        <hr className="my-12 border-gray-200" />

                        {/* ═══════════════════════════════════════════════ */}
                        {/* HASIL AKHIR                                     */}
                        {/* ═══════════════════════════════════════════════ */}
                        <section>
                            <SectionHeading id="hasil-akhir" badge={<Target className="h-4 w-4" />}>
                                Hasil Akhir
                            </SectionHeading>
                            <Paragraph>
                                Selamat! Kamu sudah berhasil membangun aplikasi <strong>Sistem Manajemen Event Kampus</strong> dengan fitur CRUD lengkap. Sekarang jalankan server lokal untuk melihat hasilnya:
                            </Paragraph>
                            <div data-protected="true">
                                <CodeBlock language="bash" code="php artisan serve" />
                            </div>
                            <Paragraph>
                                Buka <strong>http://127.0.0.1:8000</strong> di browser kamu. Aplikasi Manajemen Event Kampus sudah siap digunakan! <PartyPopper className="inline-block h-4 w-4 ml-1 text-yellow-500" />
                            </Paragraph>

                            <div className="mt-8 rounded-xl bg-green-50 p-6">
                                <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-green-800">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Fitur yang Sudah Dibangun:
                                </h4>
                                <ul className="ml-5 list-disc space-y-2 text-green-700">
                                    <li>CRUD lengkap (Create, Read, Update, Delete) untuk data Event</li>
                                    <li>Upload gambar poster event</li>
                                    <li>Tampilan tabel dengan pagination</li>
                                    <li>Validasi form input</li>
                                    <li>Konfirmasi hapus interaktif dengan SweetAlert2</li>
                                    <li>Template admin profesional dengan SB Admin 2</li>
                                </ul>
                            </div>

                            <div className="mt-6 rounded-xl bg-brand-50 p-6">
                                <h4 className="mb-2 flex items-center gap-2 text-lg font-bold text-brand-800">
                                    <Rocket className="h-5 w-5 text-brand-600" /> Tantangan Selanjutnya (Opsional):
                                </h4>
                                <p className="text-sm leading-relaxed text-brand-700">
                                    Setelah bootcamp ini selesai, kamu bisa mencoba mengembangkan aplikasi lebih lanjut — misalnya menambahkan fitur login admin, filter/pencarian event, atau statistik dashboard. Selamat berkreasi!
                                </p>
                            </div>
                        </section>

                        {/* Bottom spacer */}
                        <div className="h-20" />
                    </article>
                </div>
            </div>

            {/* ── Mobile FAB: TOC Toggle ── */}
            <button
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white border border-brand-700 transition-all hover:bg-brand-700 active:scale-95 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Buka Daftar Isi"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* ── Mobile TOC Drawer ── */}
            {mounted && (
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <div className="lg:hidden">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-[998] bg-gray-900/50 backdrop-blur-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                            {/* Panel */}
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                className="fixed inset-y-0 right-0 z-[999] w-full max-w-[320px] overflow-y-auto bg-white border-l border-gray-200"
                            >
                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                    <h3 className="text-base font-bold text-gray-900">Daftar Isi</h3>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                                        aria-label="Tutup menu"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <TocContent />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            )}
        </main>
    );
}
