"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { ToastProvider } from "@/components/ui/Toast";
import DynamicHead from "@/components/DynamicHead";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <SiteSettingsProvider>
                <DynamicHead />
                <AuthProvider>
                    <ToastProvider>
                        <SidebarProvider>{children}</SidebarProvider>
                    </ToastProvider>
                </AuthProvider>
            </SiteSettingsProvider>
        </ThemeProvider>
    );
}
