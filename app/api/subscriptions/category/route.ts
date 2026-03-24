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
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        let query;

        if (userId) {
            // Get categories subscribed by specific user
            query = supabase
                .from('category_subscriptions')
                .select(`
          id,
          category_id,
          created_at,
          categories!category_subscriptions_category_id_fkey(name, slug)
        `)
                .eq('subscriber_id', userId);
        } else if (categoryId) {
            // Get subscribers of specific category
            query = supabase
                .from('category_subscriptions')
                .select(`
          id,
          subscriber_id,
          created_at,
          users!category_subscriptions_subscriber_id_fkey(username, profile_picture)
        `)
                .eq('category_id', categoryId);
        } else {
            return NextResponse.json({error: "Either userId or categoryId is required"}, {status: 400});
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
        const {category_id} = body;

        if (!category_id) {
            return NextResponse.json({error: "Category ID is required"}, {status: 400});
        }

        // Check if subscription already exists
        const {data: existingSubscription} = await supabase
            .from('category_subscriptions')
            .select('id')
            .eq('subscriber_id', user.id)
            .eq('category_id', category_id)
            .single();

        if (existingSubscription) {
            return NextResponse.json({error: "Already subscribed to this category"}, {status: 400});
        }

        // Create subscription
        const {data: subscription, error} = await supabase
            .from('category_subscriptions')
            .insert({
                subscriber_id: user.id,
                category_id,
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
        const {category_id} = body;

        if (!category_id) {
            return NextResponse.json({error: "Category ID is required"}, {status: 400});
        }

        // Delete subscription
        const {error} = await supabase
            .from('category_subscriptions')
            .delete()
            .eq('subscriber_id', user.id)
            .eq('category_id', category_id);

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to delete subscription"}, {status: 500});
        }

        return NextResponse.json({message: "Unsubscribed from category successfully"});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}