"use client";

import {useState, useEffect} from 'react';
import {createClient} from '@/lib/supabase/client';

interface Notification {
    id: number;
    user_id: string;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchNotifications = async () => {
        try {
            setError(null);
            const res = await fetch('/api/notifications');
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.notifications?.filter((n: Notification) => !n.is_read).length || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    notification_id: notificationId,
                    is_read: true
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to mark as read');
            }

            await fetchNotifications();
            return true;
        } catch (err) {
            console.error('Mark as read error:', err);
            return false;
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications/bulk', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({mark_all_read: true}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to mark all as read');
            }

            await fetchNotifications();
            return true;
        } catch (err) {
            console.error('Mark all as read error:', err);
            return false;
        }
    };

    const deleteNotification = async (notificationId: number) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({notification_id: notificationId}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete notification');
            }

            await fetchNotifications();
            return true;
        } catch (err) {
            console.error('Delete notification error:', err);
            return false;
        }
    };

    const deleteAllNotifications = async () => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete all notifications');
            }

            await fetchNotifications();
            return true;
        } catch (err) {
            console.error('Delete all notifications error:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
    };
}