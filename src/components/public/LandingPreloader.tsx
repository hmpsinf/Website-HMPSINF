"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import dotsLoaderAnimation from "@/assets/lottie/dots-loader.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const MIN_PRELOADER_DURATION_MS = 1300;

export default function LandingPreloader() {
    const [isVisible, setIsVisible] = useState(false);
    const [isReadyToClose, setIsReadyToClose] = useState(false);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        const shouldShowPreloader = (window as Window & { __SHOW_LANDING_PRELOADER__?: boolean }).__SHOW_LANDING_PRELOADER__ === true;

        if (!shouldShowPreloader) {
            document.documentElement.classList.remove("landing-preloader-pending");
            return;
        }

        setIsVisible(true);
        startTimeRef.current = Date.now();

        const onLoaded = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_PRELOADER_DURATION_MS - elapsed);
            window.setTimeout(() => setIsReadyToClose(true), remaining);
        };

        if (document.readyState === "complete") {
            onLoaded();
        } else {
            window.addEventListener("load", onLoaded, { once: true });
        }

        return () => window.removeEventListener("load", onLoaded);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence
            onExitComplete={() => {
                document.documentElement.classList.remove("landing-preloader-pending");
                (window as Window & { __SHOW_LANDING_PRELOADER__?: boolean }).__SHOW_LANDING_PRELOADER__ = false;
                setIsVisible(false);
            }}
        >
            {!isReadyToClose && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="fixed inset-0 z-1200 flex items-center justify-center bg-white"
                    aria-label="Preloader"
                >
                    <div className="h-28 w-28 sm:h-32 sm:w-32">
                        <Lottie animationData={dotsLoaderAnimation} loop autoplay />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
