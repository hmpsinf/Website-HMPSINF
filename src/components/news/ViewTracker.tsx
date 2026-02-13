'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
    newsId: string;
}

export default function ViewTracker({ newsId }: ViewTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem('news_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('news_session_id', sessionId);
        }

        // Fire and forget — don't block rendering
        fetch(`/api/news/${newsId}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        }).catch(() => { });
    }, [newsId]);

    return null;
}
