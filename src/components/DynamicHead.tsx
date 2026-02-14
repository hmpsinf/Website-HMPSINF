"use client";

import { useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

/**
 * DynamicHead component that updates favicon and document title dynamically.
 */
export default function DynamicHead() {
    const { settings, loading } = useSiteSettings();

    useEffect(() => {
        // console.log('[DynamicHead] Settings:', settings, 'Loading:', loading);

        if (loading || !settings || !settings.favicon_url) return;

        // Use a stable ID for our managed favicon link
        const FAVICON_ID = 'app-favicon';
        const APPLE_ICON_ID = 'app-apple-icon';

        const faviconUrl = settings.favicon_url;
        // console.log('[DynamicHead] Updating favicon to:', faviconUrl);

        // Find existing favicon link managed by us OR by Next.js
        let faviconLink = document.getElementById(FAVICON_ID) as HTMLLinkElement;

        // If not found by ID, try to find any existing icon link to update (safer than removing)
        if (!faviconLink) {
            const existingLink = document.querySelector('link[rel="icon"]');
            if (existingLink) {
                faviconLink = existingLink as HTMLLinkElement;
                // Add our ID so we find it easily next time
                faviconLink.id = FAVICON_ID;
            }
        }

        // If still not found, create new one
        if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.id = FAVICON_ID;
            faviconLink.rel = "icon";
            // Ensure it's appended to head
            document.head.appendChild(faviconLink);
        }

        // Update attributes
        // Use setAttribute for better compatibility in some cases, but direct prop is usually fine
        faviconLink.href = faviconUrl;
        faviconLink.type = "image/png";

        // Handle apple-touch-icon
        let appleLink = document.getElementById(APPLE_ICON_ID) as HTMLLinkElement;

        if (!appleLink) {
            const existingAppleLink = document.querySelector('link[rel="apple-touch-icon"]');
            if (existingAppleLink) {
                appleLink = existingAppleLink as HTMLLinkElement;
                appleLink.id = APPLE_ICON_ID;
            }
        }

        if (!appleLink) {
            appleLink = document.createElement("link");
            appleLink.id = APPLE_ICON_ID;
            appleLink.rel = "apple-touch-icon";
            document.head.appendChild(appleLink);
        }
        appleLink.href = faviconUrl;

    }, [settings, loading]);

    // Update document title
    useEffect(() => {
        if (loading || !settings || !settings.site_name) return;

        const currentTitle = document.title;
        if (!currentTitle || currentTitle === "HMPSINF" || currentTitle === "TailAdmin") {
            document.title = settings.site_name;
        }
    }, [settings, loading]);

    return null;
}
