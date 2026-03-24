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
import {ArrowLeft, Eye, Save, Languages, Loader2, CheckCircle2, AlertCircle} from "lucide-react"
import Link from "next/link"
import {Badge} from "@/components/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"

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

interface Translation {
    language_code: string
    title: string
    content: string
    excerpt: string | null
    hasTranslation: boolean
}

const SUPPORTED_LANGUAGES = [
    {code: "zh-CN", name: "简体中文", flag: "🇨🇳"},
    {code: "en", name: "English", flag: "🇺🇸"},
    {code: "ja", name: "日本語", flag: "🇯🇵"},
    {code: "ko", name: "한국어", flag: "🇰🇷"},
    {code: "fr", name: "Français", flag: "🇫🇷"},
    {code: "de", name: "Deutsch", flag: "🇩🇪"},
    {code: "es", name: "Español", flag: "🇪🇸"},
]

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

    // 多语言状态
    const [activeLanguage, setActiveLanguage] = useState("zh-CN")
    const [translations, setTranslations] = useState<Record<string, Translation>>({})
    const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({})
    
    const router = useRouter()
    const params = useParams()
    const articleId = params.id as string

    useEffect(() => {
        if (articleId) {
            fetchArticle()
            fetchCategories()
            fetchTranslations()
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

    const fetchTranslations = async () => {
        try {
            const translationsData: Record<string, Translation> = {}

            for (const lang of SUPPORTED_LANGUAGES) {
                if (lang.code === "zh-CN") continue // 跳过原文

                const response = await fetch(`/api/articles/${articleId}/i18n?language=${lang.code}`)
                const data = await response.json()

                translationsData[lang.code] = {
                    language_code: lang.code,
                    title: data.data?.title || "",
                    content: data.data?.content || "",
                    excerpt: data.data?.excerpt || "",
                    hasTranslation: data.exists || false,
                }
            }

            setTranslations(translationsData)
        } catch (error) {
            console.error("Failed to fetch translations:", error)
        }
    }

    const handleTranslate = async (targetLanguage: string) => {
        setIsTranslating((prev) => ({...prev, [targetLanguage]: true}))
        setError(null)

        try {
            const response = await fetch(`/api/articles/${articleId}/translate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({targetLanguage}),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Translation failed")
            }

            const data = await response.json()

            // 更新翻译状态
            setTranslations((prev) => ({
                ...prev,
                [targetLanguage]: {
                    language_code: targetLanguage,
                    title: data.translation?.title || "",
                    content: data.translation?.content || "",
                    excerpt: data.translation?.excerpt || "",
                    hasTranslation: true,
                },
            }))

            setSuccess(`已成功翻译成 ${SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name}`)
        } catch (error) {
            setError(error instanceof Error ? error.message : "翻译失败")
        } finally {
            setIsTranslating((prev) => ({...prev, [targetLanguage]: false}))
        }
    }

    const updateTranslation = (langCode: string, field: keyof Translation, value: string) => {
        setTranslations((prev) => ({
            ...prev,
            [langCode]: {
                ...prev[langCode],
                [field]: value,
            },
        }))
    }

    const saveTranslation = async (langCode: string) => {
        const translation = translations[langCode]
        if (!translation) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/articles/${articleId}/i18n`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    language_code: langCode,
                    title: translation.title,
                    content: translation.content,
                    excerpt: translation.excerpt,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to save translation")
            }

            setSuccess(`${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name} 翻译已保存`)
            fetchTranslations()
        } catch (error) {
            setError(error instanceof Error ? error.message : "保存翻译失败")
        } finally {
            setIsLoading(false)
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Edit
                                    Article</h1>
                                <p className="text-slate-600 dark:text-slate-400">Update your article content and manage
                                    translations</p>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                <Languages className="w-4 h-4 mr-2"/>
                                多语言支持
                            </Badge>
                        </div>
                    </div>

                    {/* 多语言翻译管理 */}
                    <Card className="border-slate-200 dark:border-slate-700 mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Languages className="w-5 h-5"/>
                                多语言翻译
                            </CardTitle>
                            <CardDescription>管理文章的多语言版本，提供自动翻译功能</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
                                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <TabsTrigger key={lang.code} value={lang.code} className="relative">
                                            <span className="mr-1">{lang.flag}</span>
                                            <span className="hidden lg:inline">{lang.name}</span>
                                            {translations[lang.code]?.hasTranslation && (
                                                <CheckCircle2
                                                    className="w-3 h-3 text-green-600 absolute top-1 right-1"/>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                                        {lang.code === "zh-CN" ? (
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>原文语言：</strong>这是您文章的原始语言（简体中文）。请在上方的主编辑器中编辑内容。
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {translations[lang.code]?.hasTranslation ? (
                                                            <>
                                                                <CheckCircle2 className="w-5 h-5 text-green-600"/>
                                                                <span
                                                                    className="text-sm font-medium text-green-700">已有翻译</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-5 h-5 text-orange-600"/>
                                                                <span
                                                                    className="text-sm font-medium text-orange-700">暂无翻译</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!translations[lang.code]?.hasTranslation && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleTranslate(lang.code)}
                                                                disabled={isTranslating[lang.code]}
                                                            >
                                                                {isTranslating[lang.code] ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                                                        翻译中...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Languages className="w-4 h-4 mr-2"/>
                                                                        自动翻译
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                        {translations[lang.code]?.hasTranslation && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => saveTranslation(lang.code)}
                                                                disabled={isLoading}
                                                            >
                                                                <Save className="w-4 h-4 mr-2"/>
                                                                保存修改
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`title-${lang.code}`}>标题</Label>
                                                        <Input
                                                            id={`title-${lang.code}`}
                                                            value={translations[lang.code]?.title || ""}
                                                            onChange={(e) => updateTranslation(lang.code, "title", e.target.value)}
                                                            placeholder="输入翻译后的标题..."
                                                            disabled={!translations[lang.code]?.hasTranslation}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`excerpt-${lang.code}`}>摘要</Label>
                                                        <Textarea
                                                            id={`excerpt-${lang.code}`}
                                                            value={translations[lang.code]?.excerpt || ""}
                                                            onChange={(e) => updateTranslation(lang.code, "excerpt", e.target.value)}
                                                            placeholder="输入翻译后的摘要..."
                                                            rows={2}
                                                            disabled={!translations[lang.code]?.hasTranslation}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`content-${lang.code}`}>内容</Label>
                                                        <MarkdownEditor
                                                            value={translations[lang.code]?.content || ""}
                                                            onChange={(value) => updateTranslation(lang.code, "content", value)}
                                                            placeholder="翻译后的文章内容..."
                                                            disabled={!translations[lang.code]?.hasTranslation}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

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
