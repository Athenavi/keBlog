"use client";

import {useState, useEffect} from 'react';
import {createClient} from '@/lib/supabase/client';

interface User {
    id: string;
    username: string;
    profile_picture: string | null;
}

interface Subscription {
    id: number;
    subscriber_id?: string;
    subscribed_user_id?: string;
    created_at: string;
    users: User;
}

export function useUserSubscriptions(userId: string) {
    const [followers, setFollowers] = useState<Subscription[]>([]);
    const [following, setFollowing] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchSubscriptions = async () => {
        try {
            setError(null);

            // Fetch followers
            const followersRes = await fetch(`/api/subscriptions/user?userId=${userId}&type=followers`);
            if (!followersRes.ok) throw new Error('Failed to fetch followers');
            const followersData = await followersRes.json();
            setFollowers(followersData.subscriptions || []);

            // Fetch following
            const followingRes = await fetch(`/api/subscriptions/user?userId=${userId}&type=following`);
            if (!followingRes.ok) throw new Error('Failed to fetch following');
            const followingData = await followingRes.json();
            setFollowing(followingData.subscriptions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const subscribe = async (targetUserId: string) => {
        try {
            const res = await fetch('/api/subscriptions/user', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({subscribed_user_id: targetUserId}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to subscribe');
            }

            await fetchSubscriptions();
            return true;
        } catch (err) {
            console.error('Subscribe error:', err);
            return false;
        }
    };

    const unsubscribe = async (targetUserId: string) => {
        try {
            const res = await fetch('/api/subscriptions/user', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({subscribed_user_id: targetUserId}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to unsubscribe');
            }

            await fetchSubscriptions();
            return true;
        } catch (err) {
            console.error('Unsubscribe error:', err);
            return false;
        }
    };

    useEffect(() => {
        if (userId) {
            fetchSubscriptions();
        }
    }, [userId]);

    return {
        followers,
        following,
        isLoading,
        error,
        subscribe,
        unsubscribe,
        refresh: fetchSubscriptions,
    };
}