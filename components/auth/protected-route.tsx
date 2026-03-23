"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {createClient} from "@/lib/supabase/client"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: string
    requiredPermission?: string
    fallbackUrl?: string
}

export function ProtectedRoute({
                                   children,
                                   requiredRole,
                                   requiredPermission,
                                   fallbackUrl = "/auth/login",
                               }: ProtectedRouteProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const {
                data: {user},
                error,
            } = await supabase.auth.getUser()

            if (error || !user) {
                router.push(fallbackUrl)
                return
            }

            // If no specific role or permission required, just check if user is authenticated
            if (!requiredRole && !requiredPermission) {
                setIsAuthorized(true)
                setIsLoading(false)
                return
            }

            // Check role or permission requirements
            const response = await fetch("/api/auth/roles")
            if (!response.ok) {
                router.push("/auth/login")
                return
            }

            const {roles} = await response.json()

            // Check role requirement
            if (requiredRole) {
                const hasRole = roles.some((role: any) => role.name === requiredRole)
                if (!hasRole) {
                    router.push("/unauthorized")
                    return
                }
            }

            // Check permission requirement
            if (requiredPermission) {
                const hasPermission = roles.some((role: any) =>
                    role.permissions.some((perm: any) => perm.code === requiredPermission),
                )
                if (!hasPermission) {
                    router.push("/unauthorized")
                    return
                }
            }

            setIsAuthorized(true)
        } catch (error) {
            console.error("[v0] Auth check failed:", error)
            router.push(fallbackUrl)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Checking permissions...</p>
                </div>
            </div>
        )
    }

    if (!isAuthorized) {
        return null // Will redirect, so don't render anything
    }

    return <>{children}</>
}
