"use client";

import {useState} from 'react';
import {createClient} from '@/lib/supabase/client';

interface ShortUrlData {
    id: number;
    long_url: string;
    short_url: string;
    short_code: string;
    created_at: string;
}

export function useShortUrl() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shortUrl, setShortUrl] = useState<ShortUrlData | null>(null);

    const createShortUrl = async (longUrl: string, customShortCode?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/urls', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    long_url: longUrl,
                    custom_short_code: customShortCode,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create short URL');
            }

            const data = await res.json();
            setShortUrl(data);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteShortUrl = async (shortCode: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/urls', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({short_url: shortCode}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete short URL');
            }

            setShortUrl(null);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        shortUrl,
        isLoading,
        error,
        createShortUrl,
        deleteShortUrl,
    };
}