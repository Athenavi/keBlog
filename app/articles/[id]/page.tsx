import {createClient} from "@/lib/supabase/server"
import MarkdownWithToc from "@/components/markdown/MarkdownWithToc"

export default async function ArticlePage({params}: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const {id} = await params

    const {data: article, error} = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, status, created_at")
        .eq("id", id)
        .eq("status", "Published")
        .single()

    if (error || !article) {
        return (
            <div className="container mx-auto px-4 py-16">
                <p className="text-slate-600 dark:text-slate-400">文章不存在或未公开。</p>
            </div>
        )
    }

    const {data: contents} = await supabase
        .from("article_content")
        .select("content, language_code")
        .eq("article_id", id)

    const preferred = contents?.find((c) => c.language_code === "zh-CN")
    const en = contents?.find((c) => c.language_code === "en")
    const anyContent = preferred?.content || en?.content || contents?.[0]?.content || ""

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-9">
                        <article className="prose dark:prose-invert max-w-none">
                            <h1>{article.title}</h1>
                            <p className="text-sm text-slate-500">{new Date(article.created_at as unknown as string).toLocaleString()}</p>
                            {article.excerpt ? (
                                <p className="mt-2 text-slate-700 dark:text-slate-300">{article.excerpt}</p>
                            ) : null}
                            <hr className="my-6"/>
                            <MarkdownWithToc content={anyContent}/>
                        </article>
                    </div>
                    <div className="lg:col-span-3"></div>
                </div>
            </div>
        </div>
    )
} 