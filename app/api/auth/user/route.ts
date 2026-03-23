import {createClient} from "@/lib/supabase/server"
import {NextResponse} from "next/server"

// Get current user profile
export async function GET() {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Get user profile from our users table
        const {data: profile, error: profileError} = await supabase.from("users").select("*").eq("id", user.id).single()

        if (profileError) {
            return NextResponse.json({error: "Profile not found"}, {status: 404})
        }

        return NextResponse.json({user: profile})
    } catch (error) {
        console.error("[v0] Error fetching user:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Update user profile
export async function PUT(request: Request) {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const body = await request.json()
        const {username, bio, profile_picture} = body

        // Update user profile
        const {data, error} = await supabase
            .from("users")
            .update({
                username,
                bio,
                profile_picture,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({error: error.message}, {status: 400})
        }

        return NextResponse.json({user: data})
    } catch (error) {
        console.error("[v0] Error updating user:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
