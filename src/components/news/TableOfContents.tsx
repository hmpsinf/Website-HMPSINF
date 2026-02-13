'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    htmlContent: string;
}

export default function TableOfContents({ htmlContent }: TableOfContentsProps) {
    const [items, setItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Parse headings from HTML content
    useEffect(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const headings = doc.querySelectorAll('h2, h3');
        const tocItems: TocItem[] = [];

        headings.forEach((heading, index) => {
            const id = heading.id || `heading-${index}`;
            tocItems.push({
                id,
                text: heading.textContent || '',
                level: parseInt(heading.tagName[1]),
            });
        });

        setItems(tocItems);
    }, [htmlContent]);

    // Inject IDs into article headings and observe them
    useEffect(() => {
        if (items.length === 0) return;

        const articleEl = document.querySelector('.article-content');
        if (!articleEl) return;

        const headings = articleEl.querySelectorAll('h2, h3');
        headings.forEach((heading, index) => {
            const tocItem = items[index];
            if (tocItem && !heading.id) {
                heading.id = tocItem.id;
            }
        });

        // Intersection Observer for scroll-spy
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
        );

        headings.forEach((heading) => {
            observerRef.current?.observe(heading);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [items]);

    const scrollToHeading = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -100;
            const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, []);

    if (items.length < 2) return null;

    return (
        <nav aria-label="Daftar Isi">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Daftar Isi
            </h3>
            <ul className="space-y-1">
                {items.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => scrollToHeading(item.id)}
                            className={cn(
                                'w-full text-left text-sm py-1.5 transition-colors leading-snug',
                                item.level === 3 ? 'pl-4' : 'pl-0',
                                activeId === item.id
                                    ? 'text-brand-600 dark:text-brand-400 font-medium'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <span className="flex items-start gap-2">
                                <span
                                    className={cn(
                                        'shrink-0 mt-2 rounded-full transition-colors',
                                        activeId === item.id
                                            ? 'w-1.5 h-1.5 bg-brand-500'
                                            : 'w-1 h-1 bg-gray-300 dark:bg-gray-600'
                                    )}
                                />
                                <span className="line-clamp-2">{item.text}</span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
