"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export interface SiteSettings {
    site_name: string | null;
    site_slogan: string | null;
    logo_url: string | null;
    logo_public_id: string | null;
    logo_dark_url: string | null;
    logo_dark_public_id: string | null;
    favicon_url: string | null;
    footer_text: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    instagram_url: string | null;
    tiktok_url: string | null;
    facebook_url: string | null;
    youtube_url: string | null;
    maps_embed_url: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;
    hero_btn1_text: string | null;
    hero_btn1_link: string | null;
    hero_btn2_text: string | null;
    hero_btn2_link: string | null;
    hero_bg_image: string | null;
    hero_bg_size: string | null;
    hero_side_image: string | null;
    hero_side_image_public_id: string | null;
    sambutan_section_title: string | null;
    sambutan_section_subtitle: string | null;
    sambutan_content: string | null;
    hima_inti_pattern_color: string | null;

    // Video Section
    landing_video_title: string | null;
    landing_video_subtitle: string | null;
    landing_video_url: string | null;
    landing_video_description: string | null;
    landing_video_bg_image: string | null;
    landing_video_bg_attachment: string | null;
    landing_video_overlay_opacity: string | null;
    landing_video_pattern_opacity: string | null;
    landing_video_footer_text: string | null;

    // CTA Section
    landing_cta_title: string | null;
    landing_cta_subtitle: string | null;
    landing_cta_btn_text: string | null;
    landing_cta_btn_link: string | null;
}

interface SiteSettingsContextType {
    settings: SiteSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
    site_name: "HMPSINF",
    site_slogan: null,
    logo_url: null,
    logo_public_id: null,
    logo_dark_url: null,
    logo_dark_public_id: null,
    favicon_url: null,
    footer_text: null,
    contact_email: null,
    contact_phone: null,
    address: null,
    instagram_url: null,
    tiktok_url: null,
    facebook_url: null,
    youtube_url: null,
    maps_embed_url: null,
    hero_title: null,
    hero_subtitle: null,
    hero_btn1_text: null,
    hero_btn1_link: null,
    hero_btn2_text: null,
    hero_btn2_link: null,
    hero_bg_image: null,
    hero_bg_size: null,
    hero_side_image: null,
    hero_side_image_public_id: null,
    sambutan_section_title: null,
    sambutan_section_subtitle: null,
    sambutan_content: null,
    hima_inti_pattern_color: null,
    landing_video_title: null,
    landing_video_subtitle: null,
    landing_video_url: null,
    landing_video_description: null,
    landing_video_bg_image: null,
    landing_video_bg_attachment: null,
    landing_video_overlay_opacity: null,
    landing_video_pattern_opacity: null,
    landing_video_footer_text: null,
    landing_cta_title: null,
    landing_cta_subtitle: null,
    landing_cta_btn_text: null,
    landing_cta_btn_link: null,
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const hasFetchedInitialRef = useRef(false);
    const pathname = usePathname();

    const shouldFetchSettings =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/profile" ||
        pathname.startsWith("/berita") ||
        pathname.startsWith("/profil") ||
        pathname.startsWith("/logo") ||
        pathname.startsWith("/galeri") ||
        pathname.startsWith("/unduhan") ||
        pathname.startsWith("/kontak") ||
        pathname.startsWith("/event") ||
        pathname.startsWith("/pengumuman") ||
        pathname.startsWith("/program-kerja") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/announcements") ||
        pathname.startsWith("/divisions") ||
        pathname.startsWith("/documents") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/galleries") ||
        pathname.startsWith("/hima-inti") ||
        pathname.startsWith("/landing-page") ||
        pathname.startsWith("/news") ||
        pathname.startsWith("/popup") ||
        pathname.startsWith("/programs") ||
        pathname.startsWith("/sejarah") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/site-settings") ||
        pathname.startsWith("/sponsorship") ||
        pathname.startsWith("/visi-misi");

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings({ ...defaultSettings, ...data.settings });
            } else {
                setSettings(defaultSettings);
            }
        } catch {
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!shouldFetchSettings) {
            setSettings(defaultSettings);
            setLoading(false);
            return;
        }

        if (hasFetchedInitialRef.current) return;
        hasFetchedInitialRef.current = true;
        fetchSettings();
    }, [fetchSettings, shouldFetchSettings]);

    const refreshSettings = async () => {
        setLoading(true);
        await fetchSettings();
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
    }
    return context;
}
