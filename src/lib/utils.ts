import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { format, formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSmartDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return '';

    // DB dates from SQLite/Turso are UTC but may lack 'Z' suffix.
    // Without 'Z', new Date() parses them as local time — wrong for WIB (+7).
    let normalized = dateString;
    if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
        normalized = dateString.replace(' ', 'T') + 'Z';
    }

    const date = new Date(normalized);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    if (isAfter(date, sevenDaysAgo)) {
        return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } else {
        return format(date, 'd MMMM yyyy', { locale: id });
    }
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export function formatDate(dateString: string, endDateString?: string | null): string {
    const d = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

    if (endDateString && endDateString !== dateString) {
        const endD = new Date(endDateString);
        // Same year and month
        if (d.getFullYear() === endD.getFullYear() && d.getMonth() === endD.getMonth()) {
            return `${d.getDate()} - ${endD.getDate()} ${d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
        }
        // Same year different month
        if (d.getFullYear() === endD.getFullYear()) {
            return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })} - ${endD.getDate()} ${endD.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
        }
        // Different year
        return `${d.toLocaleDateString('id-ID', options)} - ${endD.toLocaleDateString('id-ID', options)}`;
    }
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

export function formatTime(timeStr: string | null, endTimeStr?: string | null) {
    if (!timeStr) return "";

    const cleanTime = (t: string) => t.replace(/\s*WIB/i, "").trim();
    const start = cleanTime(timeStr);

    if (endTimeStr) {
        const end = cleanTime(endTimeStr);
        return `${start} - ${end} WIB`;
    }

    return `${start} WIB`;
}

export function formatFileSize(bytes: number | null): string {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
