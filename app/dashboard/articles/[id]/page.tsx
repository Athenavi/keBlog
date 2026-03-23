"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {UserAvatar} from "@/components/user-avatar"
import {ArrowLeft, Calendar, Edit, MessageCircle, Trash2} from "lucide-react"
import Link from "next/link"
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer"

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    status: "draft" | "published" | "archived"
    created_at: string
    updated_at: string
    author: {
        id: string
        username: string
        profile_picture: string | null
    }
    category: {
        id: string
        name: string
        color: string
    } | null
    comments: Comment[]
}

interface Comment {
    id: string
    content: string
    created_at: string
    author: {
        username: string
        profile_picture: string | null
    }
}

export default function ArticlePage() {
    const [article, setArticle] = useState<Article | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
    const router = useRouter()
    const params = useParams()
    const articleId = params.id as string

    useEffect(() => {
        if (articleId) {
            fetchArticle()
        }
    }, [articleId])

    const fetchArticle = async () => {
        try {
            const response = await fetch(`/api/articles/${articleId}`)
            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/auth/login")
                    return
                }
                if (response.status === 404) {
                    setError("Article not found")
                    return
                }
                throw new Error("Failed to fetch article")
            }

            const data = await response.json()
            setArticle(data.article)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load article")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return

        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete article")
            }

            router.push("/dashboard/articles")
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to delete article")
        }
    }

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
                    <p className="text-slate-600 dark:text-slate-400">Loading article...</p>
                </div>
            </div>
        )
    }

    if (error || !article) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard/articles">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Articles
                            </Link>
                        </Button>
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <AlertDescription className="text-red-700 dark:text-red-400">
                                {error || "Article not found"}
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard/articles">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Articles
                            </Link>
                        </Button>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Badge className={getStatusColor(article.status)}>{article.status}</Badge>
                                {article.category && (
                                    <Badge variant="outline" style={{borderColor: article.category.color}}>
                                        {article.category.name}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline">
                                    <Link href={`/dashboard/articles/${article.id}/edit`}>
                                        <Edit className="w-4 h-4 mr-2"/>
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                                >
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <Card className="border-slate-200 dark:border-slate-700 mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl lg:text-3xl">{article.title}</CardTitle>
                            {article.excerpt &&
                                <CardDescription className="text-lg">{article.excerpt}</CardDescription>}
                            <div className="flex items-center gap-4 pt-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <UserAvatar
                                        username={article.author.username}
                                        profilePicture={article.author.profile_picture}
                                        size="sm"
                                    />
                                    <span>{article.author.username}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4"/>
                                    {new Date(article.created_at).toLocaleDateString()}
                                </div>
                                {article.updated_at !== article.created_at && (
                                    <div className="flex items-center gap-1">
                                        <Edit className="w-4 h-4"/>
                                        Updated {new Date(article.updated_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <MarkdownRenderer content={article.content} onHeadingsExtracted={setHeadings}/>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comments Section */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5"/>
                                Comments ({article.comments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {article.comments.length === 0 ? (
                                <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {article.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0"
                                        >
                                            <div className="flex items-start gap-3">
                                                <UserAvatar
                                                    username={comment.author.username}
                                                    profilePicture={comment.author.profile_picture}
                                                    size="sm"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {comment.author.username}
                            </span>
                                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
