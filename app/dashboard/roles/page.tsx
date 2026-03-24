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
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Checkbox} from "@/components/ui/checkbox"
import {ArrowLeft, Edit, Plus, Trash2} from "lucide-react"
import Link from "next/link"
import {useToast} from "@/hooks/use-toast"

interface Permission {
    id: number
    code: string
    description: string
}

interface Role {
    id: number
    name: string
    description: string
    permissions: Permission[]
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState({name: "", description: "", permission_ids: [] as number[]})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const {toast} = useToast()
    const supabase = createClient()

    useEffect(() => {
        checkAdmin()
        fetchRoles()
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

    const fetchRoles = async () => {
        try {
            const response = await fetch("/api/roles")
            if (response.ok) {
                const data = await response.json()
                setRoles(data.roles || [])
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error)
        } finally {
            setIsLoading(false)
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
        }
    }

    const handleCreate = () => {
        setEditingRole(null)
        setFormData({name: "", description: "", permission_ids: []})
        setIsDialogOpen(true)
    }

    const handleEdit = (role: Role) => {
        setEditingRole(role)
        setFormData({
            name: role.name,
            description: role.description,
            permission_ids: role.permissions.map((p) => p.id),
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (roleId: number, roleName: string) => {
        if (!confirm(`确定要删除角色 "${roleName}" 吗？此操作不可恢复。`)) {
            return
        }

        try {
            const response = await fetch(`/api/roles?id=${roleId}`, {method: "DELETE"})
            if (response.ok) {
                toast({
                    title: "成功",
                    description: "角色已删除",
                })
                fetchRoles()
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
            const url = editingRole ? "/api/roles" : "/api/roles"
            const method = editingRole ? "PUT" : "POST"

            const body = editingRole
                ? {...formData, id: editingRole.id}
                : formData

            const response = await fetch(url, {
                method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            })

            if (response.ok) {
                toast({
                    title: "成功",
                    description: editingRole ? "角色已更新" : "角色已创建",
                })
                setIsDialogOpen(false)
                fetchRoles()
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

    const togglePermission = (permissionId: number) => {
        setFormData((prev) => ({
            ...prev,
            permission_ids: prev.permission_ids.includes(permissionId)
                ? prev.permission_ids.filter((id) => id !== permissionId)
                : [...prev.permission_ids, permissionId],
        }))
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
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">角色管理</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">管理系统角色和权限分配</p>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2"/>
                            创建角色
                        </Button>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Roles Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>角色列表</CardTitle>
                        <CardDescription>查看和管理所有系统角色</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>名称</TableHead>
                                    <TableHead>描述</TableHead>
                                    <TableHead>权限</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500">
                                            暂无角色
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-mono">{role.id}</TableCell>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>{role.description}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.length === 0 ? (
                                                        <span className="text-slate-400 text-sm">无权限</span>
                                                    ) : (
                                                        role.permissions.map((perm) => (
                                                            <Badge key={perm.id} variant="secondary"
                                                                   className="text-xs">
                                                                {perm.code}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    {role.name !== "admin" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(role.id, role.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600"/>
                                                        </Button>
                                                    )}
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
                    <DialogContent className="max-w-2xl">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingRole ? "编辑角色" : "创建角色"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingRole ? "修改角色信息" : "添加新的系统角色"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">角色名称</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="例如：Editor"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">描述</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="描述此角色的用途"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>权限分配</Label>
                                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                                        <div className="grid gap-3">
                                            {permissions.length === 0 ? (
                                                <p className="text-sm text-slate-500">暂无可用权限</p>
                                            ) : (
                                                permissions.map((perm) => (
                                                    <div key={perm.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`perm-${perm.id}`}
                                                            checked={formData.permission_ids.includes(perm.id)}
                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                        />
                                                        <label
                                                            htmlFor={`perm-${perm.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            <span
                                                                className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mr-2">
                                                                {perm.code}
                                                            </span>
                                                            {perm.description}
                                                        </label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    取消
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "保存中..." : editingRole ? "更新" : "创建"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
