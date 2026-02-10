"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-gray-100 bg-white px-6 pb-6 pt-4 md:hidden">
                    <nav className="flex flex-col gap-0.5">
                        {navItems.map((item) =>
                            item.children ? (
                                // Mobile accordion dropdown
                                <div key={item.label}>
                                    <button
                                        onClick={() =>
                                            setMobileAccordion(
                                                mobileAccordion === item.label ? null : item.label
                                            )
                                        }
                                        className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isDropdownActive(item)
                                            ? "text-brand-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        {item.label}
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform duration-200 ${mobileAccordion === item.label ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>
                                    {mobileAccordion === item.label && (
                                        <div className="ml-4 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${isActive(child.href)
                                                        ? "bg-brand-50 font-medium text-brand-600"
                                                        : "text-gray-500 hover:text-gray-900"
                                                        }`}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Simple mobile link
                                <Link
                                    key={item.href}
                                    href={item.href!}
                                    onClick={() => setMobileOpen(false)}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(item.href!)
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
            )}
        </header>
    );
}
