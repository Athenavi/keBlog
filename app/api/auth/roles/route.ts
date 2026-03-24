import {createClient} from "@/lib/supabase/server"
import {createClient as createAdminClient} from "@/lib/supabase/admin"
import {NextResponse} from "next/server"

// Get user roles and permissions
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

        // Get user roles with permissions - use admin client to bypass RLS
        const adminSupabase = createAdminClient()
        const {data: userRoles, error: rolesError} = await adminSupabase
            .from("user_roles")
            .select(`
        roles (
          id,
          name,
          description,
          role_permissions (
            permissions (
              id,
              code,
              description
            )
          )
        )
      `)
            .eq("user_id", user.id)

        if (rolesError) {
            return NextResponse.json({error: rolesError.message}, {status: 400})
        }

        // Flatten the structure for easier use
        const roles =
            userRoles?.map((ur) => ({
                ...ur.roles,
                permissions: ur.roles.role_permissions?.map((rp) => rp.permissions) || [],
            })) || []

        return NextResponse.json({roles})
    } catch (error) {
        console.error("[v0] Error fetching user roles:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Assign role to user (admin only)
export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Check if user is admin - use admin client to bypass RLS
        const adminSupabase = createAdminClient()
        const {data: adminCheck} = await adminSupabase
            .from("user_roles")
            .select(`
                roles (
                    id,
                    name
                )
            `)
            .eq("user_id", user.id)
            .eq("roles.name", "admin")
            .single()

        if (!adminCheck) {
            return NextResponse.json({error: "Admin access required"}, {status: 403})
        }

        const body = await request.json()
        const {user_id, role_name} = body

        // Get role ID
        const {data: role, error: roleError} = await supabase.from("roles").select("id").eq("name", role_name).single()

        if (roleError || !role) {
            return NextResponse.json({error: "Role not found"}, {status: 404})
        }

        // Assign role to user
        const {error: assignError} = await supabase.from("user_roles").insert({user_id, role_id: role.id})

        if (assignError) {
            return NextResponse.json({error: assignError.message}, {status: 400})
        }

        return NextResponse.json({message: "Role assigned successfully"})
    } catch (error) {
        console.error("[v0] Error assigning role:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
