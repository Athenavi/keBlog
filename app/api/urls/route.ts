import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {customAlphabet} from 'nanoid';

// Generate short code (6 characters)
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get query parameters
        const {searchParams} = new URL(request.url);
        const shortCode = searchParams.get('shortCode');

        if (!shortCode) {
            return NextResponse.json({error: "Short code is required"}, {status: 400});
        }

        // Find the short URL
        const {data: urlData, error} = await supabase
            .from('urls')
            .select('*')
            .eq('short_url', shortCode)
            .single();

        if (error || !urlData) {
            return NextResponse.json({error: "Short URL not found"}, {status: 404});
        }

        return NextResponse.json({
            long_url: urlData.long_url,
            short_url: urlData.short_url,
            created_at: urlData.created_at
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await request.json();
        const {long_url, custom_short_code} = body;

        if (!long_url) {
            return NextResponse.json({error: "Long URL is required"}, {status: 400});
        }

        // Validate URL format
        try {
            new URL(long_url);
        } catch {
            return NextResponse.json({error: "Invalid URL format"}, {status: 400});
        }

        // Generate or use custom short code
        let shortCode = custom_short_code || nanoid();

        // Check if short code already exists
        const {data: existingUrl} = await supabase
            .from('urls')
            .select('id')
            .eq('short_url', shortCode)
            .single();

        if (existingUrl) {
            if (custom_short_code) {
                return NextResponse.json({error: "Custom short code already in use"}, {status: 400});
            }
            // Generate a new random code
            shortCode = nanoid();
        }

        // Create short URL
        const {data: urlData, error} = await supabase
            .from('urls')
            .insert({
                long_url,
                short_url: shortCode,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to create short URL"}, {status: 500});
        }

        // Build full short URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';
        const fullShortUrl = `${baseUrl}/s/${shortCode}`;

        return NextResponse.json({
            id: urlData.id,
            long_url: urlData.long_url,
            short_url: fullShortUrl,
            short_code: shortCode,
            created_at: urlData.created_at
        }, {status: 201});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await request.json();
        const {short_url} = body;

        if (!short_url) {
            return NextResponse.json({error: "Short URL is required"}, {status: 400});
        }

        // Delete short URL
        const {error} = await supabase
            .from('urls')
            .delete()
            .eq('short_url', short_url)
            .eq('user_id', user.id);

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to delete short URL"}, {status: 500});
        }

        return NextResponse.json({message: "Short URL deleted successfully"});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}