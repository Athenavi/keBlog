import {createClient} from "@/lib/supabase/server"
import {createClient as createAdminClient} from "@/lib/supabase/admin"
import {NextResponse} from "next/server"

// Get all users with their roles
export async function GET() {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Check if user is admin - use admin client to bypass RLS
        const adminSupabase = createAdminClient()
        const {data: userRoles, error: rolesError} = await adminSupabase
            .from("user_roles")
            .select(`
                roles (
                    id,
                    name,
                    description
                )
            `)
            .eq("user_id", user.id)

        if (rolesError) {
            console.error("Error fetching user roles:", rolesError)
            return NextResponse.json({error: "Failed to fetch user roles"}, {status: 500})
        }

        // Check if any role is admin
        const isAdmin = userRoles?.some(ur => ur.roles.name === 'admin')

        if (!isAdmin) {
            console.error("User is not admin. User roles:", userRoles)
            return NextResponse.json({error: "Admin access required"}, {status: 403})
        }

        // Fetch all users with their roles - use admin client to bypass RLS
        const {data: users, error} = await adminSupabase
            .from("users")
            .select(`
        id,
        username,
        email,
        profile_picture,
        created_at,
        user_roles (
          roles (
            id,
            name,
            description
          )
        )
      `)
            .order("created_at", {ascending: false})

        if (error) {
            console.error("Database error:", JSON.stringify(error, null, 2))
            return NextResponse.json({error: "Failed to fetch users", details: error}, {status: 500})
        }

        // Transform data
        const usersWithRoles = users?.map((user) => ({
            ...user,
            roles: user.user_roles?.map((ur) => ur.roles) || [],
        }))

        return NextResponse.json({users: usersWithRoles || []})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
