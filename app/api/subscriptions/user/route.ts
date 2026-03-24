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
        const userId = searchParams.get('userId'); // Get subscriptions for specific user
        const type = searchParams.get('type'); // 'followers' or 'following'

        if (!userId) {
            return NextResponse.json({error: "User ID is required"}, {status: 400});
        }

        let query;

        if (type === 'followers') {
            // Get followers of the specified user
            query = supabase
                .from('user_subscriptions')
                .select(`
          id,
          subscriber_id,
          created_at,
          users!user_subscriptions_subscriber_id_fkey(username, profile_picture)
        `)
                .eq('subscribed_user_id', userId);
        } else if (type === 'following') {
            // Get users that the specified user is following
            query = supabase
                .from('user_subscriptions')
                .select(`
          id,
          subscribed_user_id,
          created_at,
          users!user_subscriptions_subscribed_user_id_fkey(username, profile_picture)
        `)
                .eq('subscriber_id', userId);
        } else {
            return NextResponse.json({error: "Type must be 'followers' or 'following'"}, {status: 400});
        }

        const {data, error} = await query.order('created_at', {ascending: false});

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to fetch subscriptions"}, {status: 500});
        }

        return NextResponse.json({subscriptions: data});
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
        const {subscribed_user_id} = body;

        if (!subscribed_user_id) {
            return NextResponse.json({error: "Subscribed user ID is required"}, {status: 400});
        }

        // Prevent user from subscribing to themselves
        if (user.id === subscribed_user_id) {
            return NextResponse.json({error: "Cannot subscribe to yourself"}, {status: 400});
        }

        // Check if subscription already exists
        const {data: existingSubscription} = await supabase
            .from('user_subscriptions')
            .select('id')
            .eq('subscriber_id', user.id)
            .eq('subscribed_user_id', subscribed_user_id)
            .single();

        if (existingSubscription) {
            return NextResponse.json({error: "Already subscribed"}, {status: 400});
        }

        // Create subscription
        const {data: subscription, error} = await supabase
            .from('user_subscriptions')
            .insert({
                subscriber_id: user.id,
                subscribed_user_id,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to create subscription"}, {status: 500});
        }

        return NextResponse.json({subscription}, {status: 201});
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
        const {subscribed_user_id} = body;

        if (!subscribed_user_id) {
            return NextResponse.json({error: "Subscribed user ID is required"}, {status: 400});
        }

        // Delete subscription
        const {error} = await supabase
            .from('user_subscriptions')
            .delete()
            .eq('subscriber_id', user.id)
            .eq('subscribed_user_id', subscribed_user_id);

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to delete subscription"}, {status: 500});
        }

        return NextResponse.json({message: "Unsubscribed successfully"});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}