"use client";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, loading } = useSiteSettings();

  interface BrandingProps {
    loading: boolean;
    settings: any;
  }

  const BrandingContent = ({ loading, settings }: BrandingProps) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center max-w-xs">
        <Link href="/" className="flex items-center gap-3 mb-6">
          <Image
            width={48}
            height={48}
            src={settings?.logo_url || "/images/logo/auth-logo.svg"}
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
          <span className="text-2xl font-bold tracking-tight text-white whitespace-nowrap">
            {settings?.site_name || "HMPSINF"}
          </span>
        </Link>
        <p className="text-center text-gray-400 dark:text-white/60">
          Wadah aspirasi dan pengembangan potensi mahasiswa informatika.
        </p>
      </div>
    );
  };

  const MobileBrandingContent = ({ loading, settings }: BrandingProps) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center mb-8 animate-pulse w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <Image
            width={40}
            height={40}
            src={settings?.logo_url || "/images/logo/auth-logo.svg"}
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {settings?.site_name || "HMPSINF"}
          </span>
        </Link>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Wadah aspirasi dan pengembangan potensi mahasiswa informatika.
        </p>
      </div>
    );
  };

  return (
    <div className="relative bg-white dark:bg-gray-900">
      <ThemeProvider>
        {/* Mobile Layout - Single Column */}
        <div className="lg:hidden min-h-screen flex items-center justify-center p-6 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md">
            {/* Mobile Logo & Branding */}
            <MobileBrandingContent loading={loading} settings={settings} />

            {/* Mobile Form Content */}
            {children}
          </div>
        </div>

        {/* Desktop Layout - Two Columns */}
        <div className="hidden lg:flex w-full h-screen">
          {/* Left Side - Form */}
          <div className="w-1/2 flex items-center justify-center p-12 bg-white dark:bg-gray-900">
            {children}
          </div>

          {/* Right Side - Branding */}
          <div className="w-1/2 bg-brand-950 dark:bg-white/5 grid items-center">
            <div className="relative flex items-center justify-center z-1">
              <GridShape />
              <BrandingContent loading={loading} settings={settings} />
            </div>
          </div>

          {/* Theme Toggler - Desktop Only */}
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}