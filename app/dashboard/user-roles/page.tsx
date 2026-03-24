"use client"

import {useEffect, useState} from "react"
import {createClient} from "@/lib/supabase/client"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Table, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowLeft, UserCog} from "lucide-react"
import Link from "next/link"
import {useToast} from "@/hooks/use-toast"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Label} from "@/components/ui/label"
import {VirtualTable} from "@/components/ui/virtual-list"

interface User {
    id: string
    username: string
    email: string
    profile_picture: string | null
    created_at: string
    roles: Role[]
}

interface Role {
    id: number
    name: string
    description: string
}

export default function UserRolesPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const {toast} = useToast()
    const supabase = createClient()

    useEffect(() => {
        checkAdmin()
        fetchUsers()
        fetchRoles()
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

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users")
            console.log("Fetch users response status:", response.status)
            if (response.ok) {
                const data = await response.json()
                console.log("Fetched users data:", data)
                setUsers(data.users || [])
            } else {
                const errorData = await response.json()
                console.error("Failed to fetch users:", errorData)
                setError(errorData.error || "获取用户失败")
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
            setError("获取用户时发生错误")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await fetch("/api/roles")
            console.log("Fetch roles response status:", response.status)
            if (response.ok) {
                const data = await response.json()
                console.log("Fetched roles data:", data)
                setRoles(data.roles || [])
            } else {
                const errorData = await response.json()
                console.error("Failed to fetch roles:", errorData)
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error)
        }
    }

    const handleAssignRole = (user: User) => {
        setSelectedUser(user)
        setSelectedRole("")
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUser || !selectedRole) {
            toast({
                title: "错误",
                description: "请选择要分配的角色",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await fetch("/api/auth/roles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    role_name: selectedRole,
                }),
            })

            if (response.ok) {
                toast({
                    title: "成功",
                    description: "角色分配成功",
                })
                setIsDialogOpen(false)
                fetchUsers()
            } else {
                const data = await response.json()
                toast({
                    title: "错误",
                    description: data.error || "分配失败",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "错误",
                description: "分配失败",
                variant: "destructive",
            })
        }
    }

    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase()
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
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">用户角色管理</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">为用户分配和管理角色</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>用户列表</CardTitle>
                        <CardDescription>查看所有用户及其角色分配情况</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                当前用户数：<span className="font-medium">{users.length}</span>
                            </p>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>用户</TableHead>
                                        <TableHead>邮箱</TableHead>
                                        <TableHead>注册时间</TableHead>
                                        <TableHead>当前角色</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                            </Table>
                            <VirtualTable<User>
                                items={users}
                                itemHeight={68}
                                overscan={5}
                                containerClassName="max-h-[calc(100vh-300px)]"
                                renderRow={(user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profile_picture}/>
                                                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString("zh-CN")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length === 0 ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        无角色
                                                    </Badge>
                                                ) : (
                                                    user.roles.map((role) => (
                                                        <Badge key={role.id} variant="default" className="text-xs">
                                                            {role.name}
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm"
                                                    onClick={() => handleAssignRole(user)}>
                                                <UserCog className="h-4 w-4 mr-2"/>
                                                分配角色
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Assign Role Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>分配角色</DialogTitle>
                                <DialogDescription>
                                    为用户 {selectedUser?.username} 分配角色
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="role">选择角色</Label>
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择一个角色"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{role.name}</span>
                                                        <span
                                                            className="text-xs text-slate-500">{role.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedRole && (
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        <p className="font-medium">角色说明：</p>
                                        <p>{roles.find((r) => r.name === selectedRole)?.description}</p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    取消
                                </Button>
                                <Button type="submit">
                                    分配角色
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
