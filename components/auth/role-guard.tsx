"use client"

import type React from "react"

import {useAuth} from "@/hooks/use-auth"

interface RoleGuardProps {
    children: React.ReactNode
    requiredRole?: string
    requiredPermission?: string
    fallback?: React.ReactNode
    requireAll?: boolean // If true, user must have ALL specified roles/permissions
}

export function RoleGuard({
                              children,
                              requiredRole,
                              requiredPermission,
                              fallback = null,
                              requireAll = false,
                          }: RoleGuardProps) {
    const {hasRole, hasPermission, isLoading} = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const checks = []

    if (requiredRole) {
        checks.push(hasRole(requiredRole))
    }

    if (requiredPermission) {
        checks.push(hasPermission(requiredPermission))
    }

    // If no requirements specified, allow access
    if (checks.length === 0) {
        return <>{children}</>
    }

    // Check if user meets requirements
    const hasAccess = requireAll ? checks.every(Boolean) : checks.some(Boolean)

    return hasAccess ? <>{children}</> : <>{fallback}</>
}
