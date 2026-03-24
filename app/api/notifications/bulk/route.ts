import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await request.json();
        const {mark_all_read} = body;

        if (mark_all_read === true) {
            // Mark all notifications as read for the current user
            const {error} = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) {
                console.error("Database error:", error);
                return NextResponse.json({error: "Failed to mark notifications as read"}, {status: 500});
            }

            return NextResponse.json({message: "All notifications marked as read"});
        } else {
            return NextResponse.json({error: "Invalid request"}, {status: 400});
        }
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}