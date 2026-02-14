"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface User {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    bio: string | null;
    photoUrl: string | null;
    photo_url: string | null;
    created_at: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const hasFetchedInitialRef = useRef(false);

    const shouldFetchAuth =
        pathname === "/profile" ||
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

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!shouldFetchAuth) {
            setLoading(false);
            return;
        }

        if (hasFetchedInitialRef.current) return;
        hasFetchedInitialRef.current = true;
        fetchUser();
    }, [fetchUser, shouldFetchAuth]);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                await fetchUser();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch {
            return { success: false, error: "Terjadi kesalahan jaringan" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
