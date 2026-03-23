import {createClient} from "@/lib/supabase/server"
import {NextRequest, NextResponse} from 'next/server';
import {logUserRegistered} from "@/lib/activity-logger"


export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const {email, password, username, register_ip} = body

        // Validate required fields
        if (!email || !password || !username) {
            return NextResponse.json({error: "Email, password, and username are required"}, {status: 400})
        }

        // Check if username is already taken
        const {data: existingUser} = await supabase.from("users").select("username").eq("username", username).single()

        if (existingUser) {
            return NextResponse.json({error: "Username already taken"}, {status: 400})
        }

        // Create auth user with metadata
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo:
                    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
                data: {
                    username,
                    register_ip: register_ip || "127.0.0.1",
                },
            },
        })

        if (error) {
            return NextResponse.json({error: error.message}, {status: 400})
        }

        // Log user registration activity
        if (data.user) {
            try {
                await logUserRegistered(data.user.id, username, request);
            } catch (logError) {
                console.error("Failed to log user registration activity:", logError);
                // Don't fail the request if logging fails
            }
        }

        return NextResponse.json({
            message: "User created successfully. Please check your email to confirm your account.",
            user: data.user,
        })
    } catch (error) {
        console.error("[v0] Error in signup:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
