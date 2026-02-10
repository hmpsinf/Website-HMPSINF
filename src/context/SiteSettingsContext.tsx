"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

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
        fetchSettings();
    }, [fetchSettings]);

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
