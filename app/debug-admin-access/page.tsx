"use client"

import {useEffect, useState} from "react"
import {createClient} from "@/lib/supabase/client"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, CheckCircle2, XCircle} from "lucide-react"
import Link from "next/link"
import {useAuth} from "@/hooks/use-auth"

interface UserRole {
    id: number
    name: string
    description: string
}

export default function DebugAdminAccess() {
    const {user, profile, roles, isAdmin, refreshAuth} = useAuth()
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        checkAdminAccess()
    }, [])

    const checkAdminAccess = async () => {
        setIsLoading(true)
        const info: any = {
            hasUser: !!user,
            userId: user?.id,
            email: user?.email,
            username: profile?.username,
            rolesCount: roles.length,
            roleNames: roles.map(r => r.name),
            isAdmin: isAdmin,
            apiCheck: null,
            dbCheck: null,
        }

        // Try to access admin API
        try {
            const response = await fetch("/api/roles")
            info.apiCheck = {
                status: response.status,
                ok: response.ok,
                data: response.ok ? await response.json() : null,
                error: !response.ok ? await response.text() : null,
            }
        } catch (error: any) {
            info.apiCheck = {
                error: error.message || "Unknown error",
            }
        }

        // Check database directly
        try {
            const {data: userRoles, error} = await supabase
                .from("user_roles")
                .select(`
                    roles (
                        id,
                        name,
                        description
                    )
                `)
                .eq("user_id", user?.id)

            info.dbCheck = {
                data: userRoles,
                error: error,
                hasAdminRole: userRoles?.some(ur => ur.roles.name === 'admin'),
            }
        } catch (error: any) {
            info.dbCheck = {
                error: error.message || "Unknown error",
            }
        }

        setDebugInfo(info)
        setIsLoading(false)
    }

    if (!user) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    <Alert>
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>
                            请先登录才能访问此页面
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Admin Access 调试工具
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        诊断为什么无法访问管理页面
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* User Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>用户信息</CardTitle>
                            <CardDescription>当前登录用户的基本信息</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">用户 ID:</span>
                                <span className="font-mono text-sm">{user?.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">邮箱:</span>
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">用户名:</span>
                                <span>{profile?.username || "未设置"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>角色状态</CardTitle>
                            <CardDescription>当前用户的角色和权限</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">角色数量:</span>
                                    <Badge variant={roles.length > 0 ? "default" : "destructive"}>
                                        {roles.length}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">角色列表:</span>
                                    <div className="flex gap-2">
                                        {roles.length === 0 ? (
                                            <Badge variant="outline">无角色</Badge>
                                        ) : (
                                            roles.map(role => (
                                                <Badge key={role.id}
                                                       variant={role.name === 'admin' ? 'default' : 'secondary'}>
                                                    {role.name}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">是否 Admin:</span>
                                    {isAdmin ? (
                                        <Badge variant="default" className="bg-green-600">
                                            <CheckCircle2 className="h-3 w-3 mr-1"/>
                                            是
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            <XCircle className="h-3 w-3 mr-1"/>
                                            否
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* API Check */}
                    <Card>
                        <CardHeader>
                            <CardTitle>API 检查</CardTitle>
                            <CardDescription>测试 /api/roles 端点的响应</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {debugInfo?.apiCheck ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">状态码:</span>
                                        <Badge variant={debugInfo.apiCheck.ok ? "default" : "destructive"}>
                                            {debugInfo.apiCheck.status || "Error"}
                                        </Badge>
                                    </div>
                                    {debugInfo.apiCheck.ok ? (
                                        <Alert className="bg-green-50 border-green-200">
                                            <CheckCircle2 className="h-4 w-4 text-green-600"/>
                                            <AlertDescription className="text-green-800">
                                                API 访问成功！
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4"/>
                                            <AlertDescription>
                                                {debugInfo.apiCheck.error || "API 访问失败"}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">点击按钮进行检查</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Database Check */}
                    <Card>
                        <CardHeader>
                            <CardTitle>数据库检查</CardTitle>
                            <CardDescription>直接查询数据库中的用户角色</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {debugInfo?.dbCheck ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">查询结果:</span>
                                        {debugInfo.dbCheck.error ? (
                                            <Badge variant="destructive">错误</Badge>
                                        ) : (
                                            <Badge variant="default">成功</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">是否有 Admin 角色:</span>
                                        {debugInfo.dbCheck.hasAdminRole ? (
                                            <Badge variant="default" className="bg-green-600">
                                                <CheckCircle2 className="h-3 w-3 mr-1"/>
                                                有
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                <XCircle className="h-3 w-3 mr-1"/>
                                                无
                                            </Badge>
                                        )}
                                    </div>
                                    {!debugInfo.dbCheck.error && debugInfo.dbCheck.data && (
                                        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <pre className="text-xs font-mono overflow-auto">
                                                {JSON.stringify(debugInfo.dbCheck.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">点击按钮进行检查</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button onClick={checkAdminAccess} disabled={isLoading}>
                            {isLoading ? "检查中..." : "重新检查"}
                        </Button>
                        <Button onClick={refreshAuth} variant="outline">
                            刷新认证
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">返回 Dashboard</Link>
                        </Button>
                    </div>

                    {/* Solutions */}
                    {(!isAdmin || !debugInfo?.apiCheck?.ok) && (
                        <Alert>
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription className="mt-2">
                                <p className="font-medium mb-2">建议的解决方案：</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>运行 <code
                                        className="bg-slate-100 dark:bg-slate-800 px-1 rounded">scripts/debug_admin_access.sql</code>
                                    </li>
                                    <li>确认数据库中已有 admin 角色</li>
                                    <li>为你的用户分配 admin 角色</li>
                                    <li>退出并重新登录</li>
                                    <li>如果仍然失败，清除浏览器缓存</li>
                                </ol>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    )
}
