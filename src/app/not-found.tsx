import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white dark:bg-gray-950">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl font-outfit">
          ERROR
        </h1>

        <img
          src="/images/error/404.svg"
          alt="404"
          className="dark:hidden mx-auto"
          width={472}
          height={152}
        />
        <img
          src="/images/error/404-dark.svg"
          alt="404"
          className="hidden dark:block mx-auto"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg font-medium">
          Halaman yang Anda cari tidak ditemukan!
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
