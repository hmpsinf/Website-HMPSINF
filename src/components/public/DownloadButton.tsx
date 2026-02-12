"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface DownloadButtonProps {
    url: string;
    filename: string;
    label?: string;
}

export default function DownloadButton({ url, filename, label = "Download" }: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDownloading(true);

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback: open in new tab if fetch fails (e.g. CORS issues)
            window.open(url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <a
            href={url}
            onClick={handleDownload}
            className={`hero-btn hero-btn-primary inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-medium text-base transition-all group ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
        >
            <Download className={`w-5 h-5 transition-transform ${isDownloading ? 'animate-bounce' : 'group-hover:-translate-y-0.5'}`} />
            <span>{isDownloading ? 'Downloading...' : label}</span>
        </a>
    );
}
