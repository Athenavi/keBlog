"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {ArrowLeft, Calendar, Edit, Eye, Plus, Search, Trash2, User} from "lucide-react"
import Link from "next/link"

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    status: "draft" | "published" | "archived"
    created_at: string
    updated_at: string
    author: {
        username: string
        profile_picture: string | null
    }
    category: {
        name: string
        color: string
    } | null
    _count: {
        comments: number
    }
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        try {
            const response = await fetch("/api/articles")
            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/auth/login")
                    return
                }
                throw new Error("Failed to fetch articles")
            }

            const data = await response.json()
            setArticles(data.articles)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load articles")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (articleId: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return

        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete article")
            }

            setArticles(articles.filter((article) => article.id !== articleId))
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to delete article")
        }
    }

    const filteredArticles = articles.filter(
        (article) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case "draft":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            case "archived":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        }
    }

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading articles...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Articles</h1>
                                <p className="text-slate-600 dark:text-slate-400">Manage your content and
                                    publications</p>
                            </div>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/dashboard/articles/new">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    New Article
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <Card className="border-slate-200 dark:border-slate-700 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"/>
                                    <Input
                                        placeholder="Search articles..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-6">
                            <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Articles Grid */}
                    {filteredArticles.length === 0 ? (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardContent className="text-center py-12">
                                <div className="text-slate-400 mb-4">
                                    <Edit className="w-12 h-12 mx-auto mb-4"/>
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                                    {searchTerm ? "No articles found" : "No articles yet"}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {searchTerm
                                        ? "Try adjusting your search terms"
                                        : "Start creating content by writing your first article"}
                                </p>
                                {!searchTerm && (
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                        <Link href="/dashboard/articles/new">
                                            <Plus className="w-4 h-4 mr-2"/>
                                            Create Your First Article
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredArticles.map((article) => (
                                <Card
                                    key={article.id}
                                    className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge
                                                        className={getStatusColor(article.status)}>{article.status}</Badge>
                                                    {article.category && (
                                                        <Badge variant="outline"
                                                               style={{borderColor: article.category.color}}>
                                                            {article.category.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-xl mb-2">
                                                    <Link
                                                        href={`/dashboard/articles/${article.id}`}
                                                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        {article.title}
                                                    </Link>
                                                </CardTitle>
                                                {article.excerpt && <CardDescription
                                                    className="text-base">{article.excerpt}</CardDescription>}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4"/>
                                                    {article.author.username}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4"/>
                                                    {new Date(article.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4"/>
                                                    {article._count.comments} comments
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/dashboard/articles/${article.id}`}>
                                                        <Eye className="w-4 h-4"/>
                                                    </Link>
                                                </Button>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/dashboard/articles/${article.id}/edit`}>
                                                        <Edit className="w-4 h-4"/>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(article.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
