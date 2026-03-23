import {ProtectedRoute} from "@/components/auth/protected-route"
import {RoleGuard} from "@/components/auth/role-guard"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {FileText, Settings, Shield, Users} from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                <Shield className="w-8 h-8 text-blue-600"/>
                                Admin Dashboard
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">Manage users, content, and system
                                settings</p>
                        </div>

                        {/* Admin Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <RoleGuard
                                requiredPermission="user.read"
                                fallback={
                                    <Card className="border-slate-200 dark:border-slate-700 opacity-50">
                                        <CardHeader>
                                            <CardTitle className="text-slate-400">User Management</CardTitle>
                                            <CardDescription>Access restricted</CardDescription>
                                        </CardHeader>
                                    </Card>
                                }
                            >
                                <Card className="border-slate-200 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <Users className="w-5 h-5"/>
                                            User Management
                                        </CardTitle>
                                        <CardDescription>Manage user accounts and roles</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full bg-transparent" variant="outline">
                                            <Link href="/admin/users">Manage Users</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </RoleGuard>

                            <RoleGuard
                                requiredPermission="moderate.content"
                                fallback={
                                    <Card className="border-slate-200 dark:border-slate-700 opacity-50">
                                        <CardHeader>
                                            <CardTitle className="text-slate-400">Content Moderation</CardTitle>
                                            <CardDescription>Access restricted</CardDescription>
                                        </CardHeader>
                                    </Card>
                                }
                            >
                                <Card className="border-slate-200 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle
                                            className="text-green-600 dark:text-green-400 flex items-center gap-2">
                                            <FileText className="w-5 h-5"/>
                                            Content Moderation
                                        </CardTitle>
                                        <CardDescription>Review and moderate content</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full bg-transparent" variant="outline">
                                            <Link href="/admin/content">Moderate Content</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </RoleGuard>

                            <RoleGuard
                                requiredPermission="admin.access"
                                fallback={
                                    <Card className="border-slate-200 dark:border-slate-700 opacity-50">
                                        <CardHeader>
                                            <CardTitle className="text-slate-400">System Settings</CardTitle>
                                            <CardDescription>Access restricted</CardDescription>
                                        </CardHeader>
                                    </Card>
                                }
                            >
                                <Card className="border-slate-200 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle
                                            className="text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                            <Settings className="w-5 h-5"/>
                                            System Settings
                                        </CardTitle>
                                        <CardDescription>Configure system settings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full bg-transparent" variant="outline">
                                            <Link href="/admin/settings">System Settings</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </RoleGuard>
                        </div>

                        {/* Quick Stats */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle>System Overview</CardTitle>
                                <CardDescription>Quick statistics and system status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">Published Articles
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">Comments</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">Reports</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
