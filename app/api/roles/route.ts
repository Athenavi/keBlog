import {createClient} from "@/lib/supabase/server"
import {createClient as createAdminClient} from "@/lib/supabase/admin"
import {NextResponse} from "next/server"

// Get all roles with permissions
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

        // Fetch all roles with their permissions
        const {data: roles, error} = await supabase
            .from("roles")
            .select(`
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
      `)
            .order("id")

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({error: "Failed to fetch roles"}, {status: 500})
        }

        // Transform data
        const rolesWithPermissions = roles?.map((role) => ({
            ...role,
            permissions: role.role_permissions?.map((rp) => rp.permissions) || [],
        }))

        return NextResponse.json({roles: rolesWithPermissions || []})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Create new role
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
        const {name, description, permission_ids} = body

        // Validate required fields
        if (!name || !description) {
            return NextResponse.json({error: "Name and description are required"}, {status: 400})
        }

        // Check if role already exists
        const {data: existingRole} = await supabase
            .from("roles")
            .select("id")
            .eq("name", name)
            .single()

        if (existingRole) {
            return NextResponse.json({error: "Role already exists"}, {status: 400})
        }

        // Create role
        const {data: role, error: roleError} = await supabase
            .from("roles")
            .insert({name, description})
            .select()
            .single()

        if (roleError) {
            console.error("Role creation error:", roleError)
            return NextResponse.json({error: "Failed to create role"}, {status: 500})
        }

        // Assign permissions if provided
        if (permission_ids && permission_ids.length > 0) {
            const permissionsData = permission_ids.map((pid: number) => ({
                role_id: role.id,
                permission_id: pid,
            }))

            const {error: permError} = await supabase.from("role_permissions").insert(permissionsData)

            if (permError) {
                console.error("Permission assignment error:", permError)
            }
        }

        return NextResponse.json({message: "Role created successfully", role})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Update role
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
        const {id, name, description, permission_ids} = body

        // Validate required fields
        if (!id || !name || !description) {
            return NextResponse.json({error: "ID, name and description are required"}, {status: 400})
        }

        // Update role
        const {error: roleError} = await supabase
            .from("roles")
            .update({name, description})
            .eq("id", id)

        if (roleError) {
            console.error("Role update error:", roleError)
            return NextResponse.json({error: "Failed to update role"}, {status: 500})
        }

        // Update permissions - first remove existing, then add new ones
        if (permission_ids !== undefined) {
            // Delete existing permissions
            await supabase.from("role_permissions").delete().eq("role_id", id)

            // Add new permissions
            if (permission_ids.length > 0) {
                const permissionsData = permission_ids.map((pid: number) => ({
                    role_id: id,
                    permission_id: pid,
                }))

                const {error: permError} = await supabase.from("role_permissions").insert(permissionsData)

                if (permError) {
                    console.error("Permission update error:", permError)
                }
            }
        }

        return NextResponse.json({message: "Role updated successfully"})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

// Delete role
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
            return NextResponse.json({error: "Role ID is required"}, {status: 400})
        }

        // Prevent deletion of admin role
        const {data: role} = await supabase.from("roles").select("name").eq("id", id).single()

        if (role?.name === "admin") {
            return NextResponse.json({error: "Cannot delete admin role"}, {status: 400})
        }

        // Delete role (cascade will handle role_permissions)
        const {error} = await supabase.from("roles").delete().eq("id", id)

        if (error) {
            console.error("Role deletion error:", error)
            return NextResponse.json({error: "Failed to delete role"}, {status: 500})
        }

        return NextResponse.json({message: "Role deleted successfully"})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
