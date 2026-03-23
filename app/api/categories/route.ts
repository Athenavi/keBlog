import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Fetch categories
        const {data: categories, error} = await supabase
            .from("categories")
            .select("id, name, color, description")
            .order("name")

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({error: "Failed to fetch categories"}, {status: 500})
        }

        return NextResponse.json({categories: categories || []})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
