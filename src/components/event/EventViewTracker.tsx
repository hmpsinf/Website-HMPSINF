'use client';

import { useEffect } from 'react';

interface EventViewTrackerProps {
    eventId: string;
}

export default function EventViewTracker({ eventId }: EventViewTrackerProps) {
    useEffect(() => {
        // Check if view already recorded for this session (optional, but good for reducing API calls)
        // Actually, API handles session storage or logic, but we can do a simple session check here too.
        const viewedKey = `viewed_event_${eventId}`;
        if (sessionStorage.getItem(viewedKey)) {
            return;
        }

        const incrementView = async () => {
            try {
                await fetch(`/api/event/${eventId}/view`, { method: 'POST' });
                sessionStorage.setItem(viewedKey, 'true');
            } catch (error) {
                console.error('Error recording view:', error);
            }
        };

        incrementView();
    }, [eventId]);

    return null;
}
