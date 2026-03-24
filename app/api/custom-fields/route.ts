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

        let query = supabase
            .from('custom_fields')
            .select('*');

        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            // If no userId provided, get current user's fields
            query = query.eq('user_id', user.id);
        }

        const {data, error} = await query.order('field_name');

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to fetch custom fields"}, {status: 500});
        }

        return NextResponse.json({custom_fields: data});
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
        const {field_name, field_value} = body;

        if (!field_name || !field_value) {
            return NextResponse.json({error: "Field name and value are required"}, {status: 400});
        }

        // Create custom field
        const {data: customField, error} = await supabase
            .from('custom_fields')
            .insert({
                user_id: user.id,
                field_name,
                field_value,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to create custom field"}, {status: 500});
        }

        return NextResponse.json({custom_field: customField}, {status: 201});
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
        const {id, field_name, field_value} = body;

        if (!id) {
            return NextResponse.json({error: "Custom field ID is required"}, {status: 400});
        }

        if (!field_name && !field_value) {
            return NextResponse.json({error: "At least one field (name or value) must be provided"}, {status: 400});
        }

        // Build update object
        const updateData: any = {};
        if (field_name) updateData.field_name = field_name;
        if (field_value) updateData.field_value = field_value;

        // Update custom field
        const {data: customField, error} = await supabase
            .from('custom_fields')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to update custom field"}, {status: 500});
        }

        return NextResponse.json({custom_field: customField});
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
        const {id} = body;

        if (!id) {
            return NextResponse.json({error: "Custom field ID is required"}, {status: 400});
        }

        // Delete custom field
        const {error} = await supabase
            .from('custom_fields')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({error: "Failed to delete custom field"}, {status: 500});
        }

        return NextResponse.json({message: "Custom field deleted successfully"});
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}