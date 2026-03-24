import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';

export default async function ShortUrlRedirect({params}: { params: Promise<{ shortCode: string }> }) {
    const {shortCode} = await params;

    try {
        const supabase = await createClient();

        // Find the short URL
        const {data: urlData, error} = await supabase
            .from('urls')
            .select('long_url')
            .eq('short_url', shortCode)
            .single();

        if (error || !urlData) {
            notFound();
        }

        // Redirect to the long URL
        redirect(urlData.long_url);
    } catch (error) {
        console.error("Error resolving short URL:", error);
        notFound();
    }
}