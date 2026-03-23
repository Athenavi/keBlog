"use client"

import type React from "react"
import {createContext, useContext, useEffect, useState} from "react"
import {createClient} from "@/lib/supabase/client"
import type {User} from "@supabase/supabase-js"

interface UserProfile {
    id: string
    username: string
    email: string
    bio: string | null
    profile_picture: string | null
    created_at: string
}

interface UserRole {
    id: number
    name: string
    description: string
    permissions: Array<{
        id: number
        code: string
        description: string
    }>
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    roles: UserRole[]
    isLoading: boolean
    hasRole: (roleName: string) => boolean
    hasPermission: (permissionCode: string) => boolean
    refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [roles, setRoles] = useState<UserRole[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        getSession()

        // Listen for auth changes
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user)
                await fetchUserData(session.user.id)
            } else {
                setUser(null)
                setProfile(null)
                setRoles([])
            }
            setIsLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const getSession = async () => {
        try {
            const {
                data: {session},
            } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
                await fetchUserData(session.user.id)
            }
        } catch (error) {
            console.error("[v0] Error getting session:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUserData = async (userId: string) => {
        try {
            // Fetch user profile
            const profileResponse = await fetch("/api/auth/user")
            if (profileResponse.ok) {
                const profileData = await profileResponse.json()
                setProfile(profileData.user)
            }

            // Fetch user roles
            const rolesResponse = await fetch("/api/auth/roles")
            if (rolesResponse.ok) {
                const rolesData = await rolesResponse.json()
                setRoles(rolesData.roles)
            }
        } catch (error) {
            console.error("[v0] Error fetching user data:", error)
        }
    }

    const hasRole = (roleName: string): boolean => {
        return roles.some((role) => role.name === roleName)
    }

    const hasPermission = (permissionCode: string): boolean => {
        return roles.some((role) => role.permissions.some((permission) => permission.code === permissionCode))
    }

    const refreshAuth = async () => {
        if (user) {
            await fetchUserData(user.id)
        }
    }

    const value: AuthContextType = {
        user,
        profile,
        roles,
        isLoading,
        hasRole,
        hasPermission,
        refreshAuth,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
