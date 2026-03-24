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
        const isRead = searchParams.get('isRead');
        const type = searchParams.get('type');

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id);

        if (isRead !== null) {
            query = query.eq('is_read', isRead === 'true');
        }

        if (type) {
            query = query.eq('type', type);
        }

        query = query.order('created_at', {ascending: false});

        const {data, error} = await query;

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to fetch notifications"}, {status: 500});
        }

        return NextResponse.json({notifications: data});
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
        const {type, message} = body;

        if (!type || !message) {
            return NextResponse.json({error: "Type and message are required"}, {status: 400});
        }

        // Create notification
        const {data: notification, error} = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type,
                message,
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to create notification"}, {status: 500});
        }

        return NextResponse.json({notification}, {status: 201});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await request.json();
        const {notification_id, is_read} = body;

        if (!notification_id) {
            return NextResponse.json({error: "Notification ID is required"}, {status: 400});
        }

        if (typeof is_read !== 'boolean') {
            return NextResponse.json({error: "is_read property is required and must be a boolean"}, {status: 400});
        }

        // Update notification
        const {data: notification, error} = await supabase
            .from('notifications')
            .update({is_read, updated_at: new Date().toISOString()})
            .eq('id', notification_id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to update notification"}, {status: 500});
        }

        return NextResponse.json({notification});
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
        const {notification_id} = body;

        if (notification_id) {
            // Delete specific notification
            const {error} = await supabase
                .from('notifications')
                .delete()
                .eq('id', notification_id)
                .eq('user_id', user.id);

            if (error) {
                console.error("Database error:", error);
                return NextResponse.json({error: "Failed to delete notification"}, {status: 500});
            }

            return NextResponse.json({message: "Notification deleted successfully"});
        } else {
            // Delete all notifications for user
            const {error} = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

            if (error) {
                console.error("Database error:", error);
                return NextResponse.json({error: "Failed to delete notifications"}, {status: 500});
            }

            return NextResponse.json({message: "All notifications deleted successfully"});
        }
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}