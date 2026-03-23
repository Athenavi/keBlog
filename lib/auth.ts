import {createClient} from "@/lib/supabase/server"

// Helper function to check if user has specific permission
export async function hasPermission(permissionCode: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return false
        }

        // Check if user has the permission through their roles
        const {data, error} = await supabase
            .from("user_roles")
            .select(`
        roles!inner (
          role_permissions!inner (
            permissions!inner (
              code
            )
          )
        )
      `)
            .eq("user_id", user.id)
            .eq("roles.role_permissions.permissions.code", permissionCode)

        if (error) {
            console.error("[v0] Error checking permission:", error)
            return false
        }

        return data && data.length > 0
    } catch (error) {
        console.error("[v0] Error in hasPermission:", error)
        return false
    }
}

// Helper function to check if user has specific role
export async function hasRole(roleName: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return false
        }

        const {data, error} = await supabase
            .from("user_roles")
            .select("roles!inner(name)")
            .eq("user_id", user.id)
            .eq("roles.name", roleName)

        if (error) {
            console.error("[v0] Error checking role:", error)
            return false
        }

        return data && data.length > 0
    } catch (error) {
        console.error("[v0] Error in hasRole:", error)
        return false
    }
}

// Get current user profile
export async function getCurrentUser() {
    try {
        const supabase = await createClient()

        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
            console.error("[v0] Auth error:", authError)
            return null
        }

        if (!user) {
            console.log("[v0] No authenticated user found")
            return null
        }

        // Get user profile from our users table
        const {data: profile, error: profileError} = await supabase.from("users").select("*").eq("id", user.id).single()

        if (profileError) {
            console.error("[v0] Error fetching user profile:", {
                code: profileError.code,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
            })

            // If profile doesn't exist, try to create it
            if (profileError.code === "PGRST116") {
                // No rows returned
                console.log("[v0] User profile not found, creating new profile...")

                const {data: newProfile, error: createError} = await supabase
                    .from("users")
                    .insert({
                        id: user.id,
                        username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
                        email: user.email || "",
                        register_ip: "127.0.0.1", // Default IP
                    })
                    .select()
                    .single()

                if (createError) {
                    console.error("[v0] Error creating user profile:", createError)
                    return null
                }

                console.log("[v0] Successfully created user profile")
                return newProfile
            }

            return null
        }

        return profile
    } catch (error) {
        console.error("[v0] Error in getCurrentUser:", error)
        return null
    }
}
