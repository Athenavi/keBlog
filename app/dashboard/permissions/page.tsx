"use client"

import {useEffect, useState} from "react"
import {createClient} from "@/lib/supabase/client"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {ArrowLeft, Edit, Plus, Trash2} from "lucide-react"
import Link from "next/link"
import {useToast} from "@/hooks/use-toast"

interface Permission {
    id: number
    code: string
    description: string
}

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
    const [formData, setFormData] = useState({code: "", description: ""})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const {toast} = useToast()
    const supabase = createClient()

    useEffect(() => {
        checkAdmin()
        fetchPermissions()
    }, [])

    const checkAdmin = async () => {
        try {
            const response = await fetch("/api/auth/roles")
            if (!response.ok) {
                router.push("/unauthorized")
            }
            const data = await response.json()
            const isAdmin = data.roles?.some((r: any) => r.name === "admin")
            if (!isAdmin) {
                router.push("/unauthorized")
            }
        } catch (error) {
            router.push("/unauthorized")
        }
    }

    const fetchPermissions = async () => {
        try {
            const response = await fetch("/api/permissions")
            if (response.ok) {
                const data = await response.json()
                setPermissions(data.permissions || [])
            }
        } catch (error) {
            console.error("Failed to fetch permissions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingPerm(null)
        setFormData({code: "", description: ""})
        setIsDialogOpen(true)
    }

    const handleEdit = (permission: Permission) => {
        setEditingPerm(permission)
        setFormData({code: permission.code, description: permission.description})
        setIsDialogOpen(true)
    }

    const handleDelete = async (permissionId: number) => {
        if (!confirm("确定要删除此权限吗？此操作不可恢复。")) {
            return
        }

        try {
            const response = await fetch(`/api/permissions?id=${permissionId}`, {method: "DELETE"})
            if (response.ok) {
                toast({
                    title: "成功",
                    description: "权限已删除",
                })
                fetchPermissions()
            } else {
                const data = await response.json()
                toast({
                    title: "错误",
                    description: data.error || "删除失败",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "错误",
                description: "删除失败",
                variant: "destructive",
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const url = editingPerm ? "/api/permissions" : "/api/permissions"
            const method = editingPerm ? "PUT" : "POST"

            const body = editingPerm
                ? {...formData, id: editingPerm.id}
                : formData

            const response = await fetch(url, {
                method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            })

            if (response.ok) {
                toast({
                    title: "成功",
                    description: editingPerm ? "权限已更新" : "权限已创建",
                })
                setIsDialogOpen(false)
                fetchPermissions()
            } else {
                const data = await response.json()
                setError(data.error || "操作失败")
            }
        } catch (error) {
            setError("操作失败，请重试")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            返回
                        </Button>
                    </Link>
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">权限管理</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">管理系统权限定义</p>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2"/>
                            创建权限
                        </Button>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Permissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>权限列表</CardTitle>
                        <CardDescription>查看和管理所有系统权限</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>权限代码</TableHead>
                                    <TableHead>描述</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500">
                                            暂无权限
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    permissions.map((perm) => (
                                        <TableRow key={perm.id}>
                                            <TableCell className="font-mono">{perm.id}</TableCell>
                                            <TableCell className="font-medium">
                                                <span
                                                    className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                    {perm.code}
                                                </span>
                                            </TableCell>
                                            <TableCell>{perm.description}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(perm)}>
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(perm.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPerm ? "编辑权限" : "创建权限"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingPerm ? "修改权限信息" : "添加新的系统权限"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">权限代码</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                        placeholder="例如：articles.create"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">使用点分格式，如：articles.create</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">描述</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="描述此权限的用途"
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    取消
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "保存中..." : editingPerm ? "更新" : "创建"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
