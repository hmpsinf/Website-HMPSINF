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
