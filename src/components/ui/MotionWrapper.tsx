"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

// Premium easing — gentle acceleration, very smooth deceleration
// This avoids the "jerk/snap" of aggressive easeOut curves
const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const; // smooth cubic-bezier

type Direction = "up" | "down" | "left" | "right";

// ─── FadeIn ─────────────────────────────────────────────────────────
interface FadeInProps extends HTMLMotionProps<"div"> {
    direction?: Direction;
    delay?: number;
    duration?: number;
    distance?: number;
    children: React.ReactNode;
    className?: string;
    once?: boolean;
}

export function FadeIn({
    direction = "up",
    delay = 0,
    duration = 0.7,
    distance = 16,
    children,
    className,
    once = true,
    ...props
}: FadeInProps) {
    const variants: Variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? distance : direction === "down" ? -distance : 0,
            x: direction === "left" ? distance : direction === "right" ? -distance : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration,
                delay,
                ease: PREMIUM_EASE,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: "-60px" }}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ─── ScaleIn ────────────────────────────────────────────────────────
interface ScaleInProps extends HTMLMotionProps<"div"> {
    delay?: number;
    duration?: number;
    initialScale?: number;
    children: React.ReactNode;
    className?: string;
    once?: boolean;
}

export function ScaleIn({
    delay = 0,
    duration = 0.7,
    initialScale = 0.95,
    children,
    className,
    once = true,
    ...props
}: ScaleInProps) {
    const variants: Variants = {
        hidden: {
            opacity: 0,
            scale: initialScale,
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration,
                delay,
                ease: PREMIUM_EASE,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: "-60px" }}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ─── StaggerContainer ───────────────────────────────────────────────
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
    delayChildren?: number;
    staggerChildren?: number;
    children: React.ReactNode;
    className?: string;
    once?: boolean;
}

export function StaggerContainer({
    delayChildren = 0.05,
    staggerChildren = 0.12,
    children,
    className,
    once = true,
    ...props
}: StaggerContainerProps) {
    const variants: Variants = {
        hidden: {},
        visible: {
            transition: {
                delayChildren,
                staggerChildren,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: "-60px" }}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ─── StaggerList (nested stagger group) ─────────────────────────────
interface StaggerListProps extends HTMLMotionProps<"div"> {
    delayChildren?: number;
    staggerChildren?: number;
    children: React.ReactNode;
    className?: string;
}

export function StaggerList({
    delayChildren = 0,
    staggerChildren = 0.12,
    children,
    className,
    ...props
}: StaggerListProps) {
    const variants: Variants = {
        hidden: {},
        visible: {
            transition: {
                delayChildren,
                staggerChildren,
            },
        },
    };

    return (
        <motion.div
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ─── StaggerItem ────────────────────────────────────────────────────
interface StaggerItemProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    direction?: Direction;
    distance?: number;
    duration?: number;
    variant?: "fade" | "slide" | "scale";
}

export function StaggerItem({
    children,
    className,
    direction = "up",
    distance = 16,
    duration = 0.6,
    variant = "slide",
    ...props
}: StaggerItemProps) {
    const getVariants = (): Variants => {
        if (variant === "scale") {
            return {
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration, ease: PREMIUM_EASE },
                },
            };
        }
        if (variant === "fade") {
            return {
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { duration, ease: PREMIUM_EASE },
                },
            };
        }
        // Default: slide
        return {
            hidden: {
                opacity: 0,
                y: direction === "up" ? distance : direction === "down" ? -distance : 0,
                x: direction === "left" ? distance : direction === "right" ? -distance : 0,
            },
            visible: {
                opacity: 1,
                y: 0,
                x: 0,
                transition: {
                    duration,
                    ease: PREMIUM_EASE,
                },
            },
        };
    };

    return (
        <motion.div variants={getVariants()} className={className} {...props}>
            {children}
        </motion.div>
    );
}

// ─── SectionReveal (for wrapping entire sections) ───────────────────
interface SectionRevealProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    once?: boolean;
    delay?: number;
}

export function SectionReveal({
    children,
    className,
    once = true,
    delay = 0,
    ...props
}: SectionRevealProps) {
    const variants: Variants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                delay,
                ease: PREMIUM_EASE,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: "-80px" }}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
