import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {createClient} from "@/lib/supabase/server"

async function getPublishedArticles(page: number, pageSize: number) {
    const supabase = await createClient()

    // Get total count
    const {count} = await supabase
        .from("articles")
        .select("id", {count: "exact", head: true})
        .eq("status", "Published")

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const {data, error} = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, created_at")
        .eq("status", "Published")
        .order("created_at", {ascending: false})
        .range(from, to)

    if (error) {
        console.error("Failed to load published articles:", error)
        return {items: [], total: 0}
    }

    return {items: data || [], total: count || 0}
}

export default async function HomePage({searchParams}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolved = (await searchParams) || {}
    const rawPage = Array.isArray(resolved.page) ? resolved.page[0] : resolved.page
    const page = Number(rawPage || 1)
    const pageSize = 10
    const {items: articles, total} = await getPublishedArticles(page, pageSize)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    if (articles.length > 0) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">最新文章</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">已公开的内容更新</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {articles.map((article) => (
                                <Link key={article.id} href={`/articles/${article.id}`} className="block group">
                                    <Card
                                        className="border-slate-200 dark:border-slate-700 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-700">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {article.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {new Date(article.created_at as unknown as string).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                                                {article.excerpt || ""}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-10 flex items-center justify-between gap-4">
                            <Button asChild variant="outline" disabled={page <= 1}>
                                <Link href={page <= 1 ? "#" : `/?page=${page - 1}`}>上一页</Link>
                            </Button>
                            <span className="text-slate-600 dark:text-slate-400">
                第 {page} / {totalPages} 页
              </span>
                            <Button asChild variant="outline" disabled={page >= totalPages}>
                                <Link href={page >= totalPages ? "#" : `/?page=${page + 1}`}>下一页</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Hero Section */}
                    <div className="mb-16">
                        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">Content Management
                            Platform</h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                            A comprehensive platform for managing articles, user interactions, and content creation with
                            advanced
                            role-based access control.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/auth/login">Sign In</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/auth/register">Get Started</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-blue-600 dark:text-blue-400">Article Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Create, edit, and publish articles with multilingual support and advanced content
                                    management features.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-green-600 dark:text-green-400">User Interactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Engage with hierarchical comments, user subscriptions, notifications, and social
                                    features.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-purple-600 dark:text-purple-400">Role-Based
                                    Access</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Comprehensive permission system with admin, moderator, author, and user roles for
                                    secure content
                                    management.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CTA Section */}
                    <div
                        className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Ready to get
                            started?</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Join our platform and start managing your content with powerful tools and features.
                        </p>
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/auth/register">Create Account</Link>
                        </Button>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">网站导航</h3>
                                <div className="space-y-2">
                                    <Link href="/sitemap"
                                          className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        网站地图
                                    </Link>
                                    <Link href="/rss"
                                          className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        RSS订阅
                                    </Link>
                                    <Link href="/robots.txt"
                                          className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        Robots.txt
                                    </Link>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">用户功能</h3>
                                <div className="space-y-2">
                                    <Link href="/auth/login"
                                          className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        用户登录
                                    </Link>
                                    <Link href="/auth/register"
                                          className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        用户注册
                                    </Link>
                                    <Link href="/articles"
                                          className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        文章列表
                                    </Link>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">技术支持</h3>
                                <div className="space-y-2">
                    <span className="block text-slate-600 dark:text-slate-400">
                      版本: 1.0.0
                    </span>
                                    <span className="block text-slate-600 dark:text-slate-400">
                      更新: 2024-01-01
                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
