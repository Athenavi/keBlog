import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // Get query parameters
        const {searchParams} = new URL(request.url);
        const contentType = searchParams.get('contentType');
        const contentId = searchParams.get('contentId');

        let query = supabase
            .from('reports')
            .select(`
        id,
        reported_by,
        content_type,
        content_id,
        reason,
        created_at,
        users!reports_reported_by_fkey(username)
      `);

        if (contentType && contentId) {
            query = query.eq('content_type', contentType).eq('content_id', parseInt(contentId));
        } else {
            // Only show user's own reports unless admin
            query = query.eq('reported_by', user.id);
        }

        const {data, error} = await query.order('created_at', {ascending: false});

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to fetch reports"}, {status: 500});
        }

        return NextResponse.json({reports: data});
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
        const {content_type, content_id, reason} = body;

        if (!content_type || !content_id || !reason) {
            return NextResponse.json({error: "Content type, content ID, and reason are required"}, {status: 400});
        }

        // Validate content type
        const validContentTypes = ['Article', 'Comment'];
        if (!validContentTypes.includes(content_type)) {
            return NextResponse.json({error: "Invalid content type"}, {status: 400});
        }

        // Create report
        const {data: report, error} = await supabase
            .from('reports')
            .insert({
                reported_by: user.id,
                content_type,
                content_id,
                reason,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to create report"}, {status: 500});
        }

        return NextResponse.json({report}, {status: 201});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}