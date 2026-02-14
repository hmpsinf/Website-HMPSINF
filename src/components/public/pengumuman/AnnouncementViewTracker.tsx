'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
    announcementId: string;
}

export default function AnnouncementViewTracker({ announcementId }: ViewTrackerProps) {
    useEffect(() => {
        const viewedKey = `viewed_announcement_${announcementId}`;
        if (sessionStorage.getItem(viewedKey)) {
            return;
        }

        const incrementView = async () => {
            try {
                await fetch(`/api/announcements/${announcementId}/view`, { method: 'POST' });
                sessionStorage.setItem(viewedKey, 'true');
            } catch (error) {
                console.error('Error recording view:', error);
            }
        };

        incrementView();
    }, [announcementId]);

    return null;
}
