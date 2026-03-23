"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import MarkdownEditor from "@/components/markdown/MarkdownEditor"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {ArrowLeft, Eye, Save} from "lucide-react"
import Link from "next/link"

interface Category {
    id: string
    name: string
    color: string
}

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    status: "Draft" | "Published" | "Deleted"
}

export default function EditArticlePage() {
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [status, setStatus] = useState<"Draft" | "Published">("Draft")
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingArticle, setIsLoadingArticle] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const params = useParams()
    const articleId = params.id as string

    useEffect(() => {
        if (articleId) {
            fetchArticle()
            fetchCategories()
        }
    }, [articleId])

    useEffect(() => {
        // Auto-generate slug from title when title changes
        if (title) {
            const generatedSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim()
            setSlug(generatedSlug)
        }
    }, [title])

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
            const article = data.article

            setTitle(article.title)
            setSlug(article.slug)
            setExcerpt(article.excerpt || "")
            setContent(article.content)
            setStatus(article.status)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load article")
        } finally {
            setIsLoadingArticle(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/categories")
            if (response.ok) {
                const data = await response.json()
                setCategories(data.categories)
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        }
    }

    const handleSave = async (e: React.FormEvent, saveStatus: "Draft" | "Published") => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    slug,
                    excerpt,
                    content,
                    category_id: categoryId || null,
                    status: saveStatus,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to update article")
            }

            const data = await response.json()
            setSuccess(`Article ${saveStatus === "Published" ? "published" : "updated"} successfully!`)

            // Redirect to the article view after a short delay
            setTimeout(() => {
                router.push(`/dashboard/articles/${articleId}`)
            }, 1500)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to update article")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoadingArticle) {
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

    if (error && isLoadingArticle) {
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
                            <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
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
                            <Link href={`/dashboard/articles/${articleId}`}>
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Article
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Edit Article</h1>
                        <p className="text-slate-600 dark:text-slate-400">Update your article content and settings</p>
                    </div>

                    <form className="space-y-6">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle>Article Details</CardTitle>
                                <CardDescription>Basic information about your article</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter article title..."
                                        required
                                        className="border-slate-300 dark:border-slate-600"
                                    />
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="article-url-slug"
                                        required
                                        className="border-slate-300 dark:border-slate-600"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        This will be used in the article URL. Auto-generated from title.
                                    </p>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600">
                                            <SelectValue placeholder="Select a category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Excerpt */}
                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Brief description of your article..."
                                        rows={3}
                                        className="border-slate-300 dark:border-slate-600"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Optional short description that appears in article listings.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle>Content</CardTitle>
                                <CardDescription>Write your article content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Article Content *</Label>
                                    <div className="mt-2">
                                        <MarkdownEditor
                                            value={content}
                                            onChange={setContent}
                                            placeholder="使用 Markdown 开始写作..."
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">支持 Markdown
                                        语法与预览。</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        {error && (
                            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                <AlertDescription
                                    className="text-green-700 dark:text-green-400">{success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Actions */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        onClick={(e) => handleSave(e, "Draft")}
                                        variant="outline"
                                        disabled={isLoading || !title || !content}
                                        className="flex-1"
                                    >
                                        <Save className="w-4 h-4 mr-2"/>
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={(e) => handleSave(e, "Published")}
                                        disabled={isLoading || !title || !content}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Eye className="w-4 h-4 mr-2"/>
                                        {isLoading
                                            ? "Publishing..."
                                            : status === "Published"
                                                ? "Update & Keep Published"
                                                : "Save & Publish"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    )
}
