import {redirect} from "next/navigation"
import {createClient} from "@/lib/supabase/server"
import {getCurrentUser} from "@/lib/auth"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: {user},
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/auth/login")
    }

    const profile = await getCurrentUser()

    if (!profile) {
        redirect("/auth/login")
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Welcome back, {profile.username}!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">Manage your content and account from your
                            dashboard</p>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-blue-600 dark:text-blue-400">Profile</CardTitle>
                                <CardDescription>Manage your account settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="font-medium">Email:</span> {user.email}
                                    </p>
                                    <p>
                                        <span className="font-medium">Username:</span> {profile.username}
                                    </p>
                                    <p>
                                        <span
                                            className="font-medium">Joined:</span> {new Date(profile.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button asChild className="w-full mt-4 bg-transparent" variant="outline">
                                    <Link href="/dashboard/profile">Edit Profile</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-green-600 dark:text-green-400">Articles</CardTitle>
                                <CardDescription>Create and manage your content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Start writing and sharing your ideas with the community.
                                </p>
                                <Button asChild className="w-full bg-transparent" variant="outline">
                                    <Link href="/dashboard/articles">Manage Articles</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-orange-600 dark:text-orange-400">Media</CardTitle>
                                <CardDescription>Upload and manage your files</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Upload images, videos, and documents for your content.
                                </p>
                                <Button asChild className="w-full bg-transparent" variant="outline">
                                    <Link href="/dashboard/media">Media Library</Link>
                                </Button>
                                <Button asChild className="w-full bg-transparent" variant="outline">
                                    <Link href="/dashboard/media/upload">Upload Media</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-purple-600 dark:text-purple-400">Activity</CardTitle>
                                <CardDescription>Your recent activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    View your comments, likes, and interactions.
                                </p>
                                <Button asChild className="w-full bg-transparent" variant="outline">
                                    <Link href="/dashboard/activity">View Activity</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Admin Section - Only visible to admins */}
                    <Card className="border-slate-200 dark:border-slate-700 mb-8">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400">系统管理</CardTitle>
                            <CardDescription>管理系统角色、权限和用户</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">角色管理</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        创建和管理系统角色，分配权限
                                    </p>
                                    <Button asChild size="sm" className="w-full">
                                        <Link href="/dashboard/roles">管理角色</Link>
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">权限管理</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        定义和管理系统权限
                                    </p>
                                    <Button asChild size="sm" className="w-full" variant="outline">
                                        <Link href="/dashboard/permissions">管理权限</Link>
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">用户角色</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        为用户分配和移除角色
                                    </p>
                                    <Button asChild size="sm" className="w-full" variant="outline">
                                        <Link href="/dashboard/user-roles">分配角色</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks and shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href="/dashboard/articles/new">Write Article</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/profile">Edit Profile</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/settings">Settings</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/media/upload">Upload Media</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
