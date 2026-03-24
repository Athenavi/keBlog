import {createClient} from "@/lib/supabase/server"
import {createClient as createAdminClient} from "@/lib/supabase/admin"
import {NextResponse} from "next/server"

// Get all permissions
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
            return NextResponse.json({error: "Admin access required"}, {status: 403})
        }

        // Fetch all permissions
        const {data: permissions, error} = await supabase
            .from("permissions")
            .select("*")
            .order("id")

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({error: "Failed to fetch permissions"}, {status: 500})
        }

        return NextResponse.json({permissions: permissions || []})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Create new permission
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

        // Check if user is admin
        const {data: adminCheck} = await supabase
            .from("user_roles")
            .select("roles!inner(name)")
            .eq("user_id", user.id)
            .eq("roles.name", "admin")
            .single()

        if (!adminCheck) {
            return NextResponse.json({error: "Admin access required"}, {status: 403})
        }

        const body = await request.json()
        const {code, description} = body

        // Validate required fields
        if (!code || !description) {
            return NextResponse.json({error: "Code and description are required"}, {status: 400})
        }

        // Check if permission already exists
        const {data: existingPerm} = await supabase
            .from("permissions")
            .select("id")
            .eq("code", code)
            .single()

        if (existingPerm) {
            return NextResponse.json({error: "Permission already exists"}, {status: 400})
        }

        // Create permission
        const {data: permission, error} = await supabase
            .from("permissions")
            .insert({code, description})
            .select()
            .single()

        if (error) {
            console.error("Permission creation error:", error)
            return NextResponse.json({error: "Failed to create permission"}, {status: 500})
        }

        return NextResponse.json({message: "Permission created successfully", permission})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Update permission
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

        // Check if user is admin
        const {data: adminCheck} = await supabase
            .from("user_roles")
            .select("roles!inner(name)")
            .eq("user_id", user.id)
            .eq("roles.name", "admin")
            .single()

        if (!adminCheck) {
            return NextResponse.json({error: "Admin access required"}, {status: 403})
        }

        const body = await request.json()
        const {id, code, description} = body

        // Validate required fields
        if (!id || !code || !description) {
            return NextResponse.json({error: "ID, code and description are required"}, {status: 400})
        }

        // Update permission
        const {error} = await supabase
            .from("permissions")
            .update({code, description})
            .eq("id", id)

        if (error) {
            console.error("Permission update error:", error)
            return NextResponse.json({error: "Failed to update permission"}, {status: 500})
        }

        return NextResponse.json({message: "Permission updated successfully"})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Delete permission
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Check if user is admin
        const {data: adminCheck} = await supabase
            .from("user_roles")
            .select("roles!inner(name)")
            .eq("user_id", user.id)
            .eq("roles.name", "admin")
            .single()

        if (!adminCheck) {
            return NextResponse.json({error: "Admin access required"}, {status: 403})
        }

        const {searchParams} = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({error: "Permission ID is required"}, {status: 400})
        }

        // Delete permission (cascade will handle role_permissions)
        const {error} = await supabase.from("permissions").delete().eq("id", id)

        if (error) {
            console.error("Permission deletion error:", error)
            return NextResponse.json({error: "Failed to delete permission"}, {status: 500})
        }

        return NextResponse.json({message: "Permission deleted successfully"})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
