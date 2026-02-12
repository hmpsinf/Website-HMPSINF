"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown } from "lucide-react";

// ── Navigation structure with dropdowns ──
interface NavItem {
    label: string;
    href?: string;
    children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
    { label: "Beranda", href: "/" },
    {
        label: "Profil",
        children: [
            { label: "Sejarah", href: "/profil/sejarah" },
            { label: "Visi dan Misi", href: "/profil/visi-misi" },
            { label: "Struktur Organisasi", href: "/profil/struktur-organisasi" },
        ],
    },
    { label: "Berita", href: "/berita" },
    {
        label: "Informasi",
        children: [
            { label: "Galeri", href: "/galeri" },
            { label: "Unduhan", href: "/unduhan" },
        ],
    },
    { label: "Kontak", href: "/kontak" },
];

interface PublicHeaderProps {
    logoUrl: string | null;
    siteName: string;
}

export default function PublicHeader({ logoUrl, siteName }: PublicHeaderProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const isDropdownActive = (item: NavItem) => {
        if (item.children) {
            return item.children.some((child) => pathname.startsWith(child.href));
        }
        return false;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        setMounted(true);
        const handleClickOutside = () => setOpenDropdown(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleDropdownEnter = (label: string) => {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        setOpenDropdown(label);
    };

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    {logoUrl ? (
                        <Image
                            src={logoUrl}
                            alt={siteName}
                            width={36}
                            height={36}
                            className="h-9 w-9 object-contain"
                        />
                    ) : null}
                    <span className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
                        {siteName}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) =>
                        item.children ? (
                            // Dropdown item
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => handleDropdownEnter(item.label)}
                                onMouseLeave={handleDropdownLeave}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(
                                            openDropdown === item.label ? null : item.label
                                        );
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isDropdownActive(item)
                                        ? "text-brand-600"
                                        : "text-gray-600 hover:text-brand-600"
                                        }`}
                                >
                                    {item.label}
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Dropdown panel */}
                                <div
                                    className={`absolute left-0 top-full z-50 min-w-[180px] pt-1 transition-all duration-200 ${openDropdown === item.label
                                        ? "pointer-events-auto translate-y-0 opacity-100"
                                        : "pointer-events-none -translate-y-1 opacity-0"
                                        }`}
                                >
                                    <div className="rounded-xl border border-gray-200 bg-white py-1.5 shadow-sm">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`block px-4 py-2.5 text-sm transition-colors ${isActive(child.href)
                                                    ? "bg-brand-50 font-medium text-brand-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Simple link
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href!)
                                    ? "text-brand-600"
                                    : "text-gray-600 hover:text-brand-600"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>

                {/* Mobile Hamburger - Animated */}
                <button
                    className="group inline-flex h-12 w-12 items-center justify-center text-slate-800 transition md:hidden"
                    aria-pressed={mobileOpen}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6 fill-current pointer-events-none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <rect className="origin-center -translate-y-[5px] translate-x-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-[[aria-pressed=true]]:translate-x-0 group-[[aria-pressed=true]]:translate-y-0 group-[[aria-pressed=true]]:rotate-[315deg]" y="7" width="9" height="2" rx="1"></rect>
                        <rect className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-[[aria-pressed=true]]:rotate-45" y="7" width="16" height="2" rx="1"></rect>
                        <rect className="origin-center translate-y-[5px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-[[aria-pressed=true]]:translate-y-0 group-[[aria-pressed=true]]:rotate-[135deg]" y="7" width="9" height="2" rx="1"></rect>
                    </svg>
                </button>
            </div>

            {/* Mobile Sidebar (Portal to Body) */}
            {mounted && mobileOpen && createPortal(
                <div className="md:hidden">
                    <div
                        className="fixed inset-0 z-[999] bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div
                        className="fixed inset-y-0 right-0 z-[1000] h-full w-full max-w-[300px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    >
                        <div className="flex min-h-full flex-col">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <span className="text-lg font-bold text-gray-900">{siteName}</span>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 px-6 py-6">
                                <nav className="flex flex-col gap-1">
                                    {navItems.map((item) =>
                                        item.children ? (
                                            // Mobile accordion dropdown
                                            <div key={item.label} className="py-1">
                                                <button
                                                    onClick={() =>
                                                        setMobileAccordion(
                                                            mobileAccordion === item.label ? null : item.label
                                                        )
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all ${isDropdownActive(item)
                                                        ? "bg-brand-50 text-brand-600"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                        }`}
                                                >
                                                    {item.label}
                                                    <ChevronDown
                                                        className={`h-5 w-5 transition-transform duration-300 ${mobileAccordion === item.label ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>
                                                <div
                                                    className={`grid transition-all duration-300 ease-in-out ${mobileAccordion === item.label
                                                        ? "grid-rows-[1fr] opacity-100"
                                                        : "grid-rows-[0fr] opacity-0"
                                                        }`}
                                                >
                                                    <div className="overflow-hidden">
                                                        <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                                                            {item.children.map((child) => (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href}
                                                                    onClick={() => setMobileOpen(false)}
                                                                    className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive(child.href)
                                                                        ? "text-brand-600 font-medium"
                                                                        : "text-gray-500 hover:text-gray-900"
                                                                        }`}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Simple mobile link
                                            <Link
                                                key={item.href}
                                                href={item.href!}
                                                onClick={() => setMobileOpen(false)}
                                                className={`rounded-xl px-4 py-3 text-base font-medium transition-all ${isActive(item.href!)
                                                    ? "bg-brand-50 text-brand-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        )
                                    )}
                                </nav>
                            </div>

                            <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                                <p className="text-xs text-center text-gray-400">
                                    © {new Date().getFullYear()} {siteName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </header>
    );
}
