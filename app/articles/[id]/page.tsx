import {createClient} from "@/lib/supabase/server"
import MarkdownWithToc from "@/components/markdown/MarkdownWithToc"
import {LanguageSwitcher} from "@/components/ui/language-switcher"
import {getPreferredLanguage} from "@/lib/i18n"

export default async function ArticlePage({params}: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const {id} = await params

    // 获取用户语言偏好
    const preferredLang = getPreferredLanguage("zh-CN")

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

    // 获取所有可用的内容（包括原文和翻译）
    const {data: contents} = await supabase
        .from("article_content")
        .select("content, language_code")
        .eq("article_id", id)

    // 获取 i18n 翻译
    const {data: i18nContents} = await supabase
        .from("article_i18n")
        .select("title, content, excerpt, language_code")
        .eq("article_id", id)

    // 优先显示用户偏好语言的内容
    const preferredContent = i18nContents?.find((c) => c.language_code === preferredLang)
    const fallbackContent = contents?.find((c) => c.language_code === preferredLang)

    // 如果没有偏好语言的内容，使用默认内容
    const displayTitle = preferredContent?.title || article.title
    const displayContent = preferredContent?.content || fallbackContent?.content || contents?.[0]?.content || ""
    const displayExcerpt = preferredContent?.excerpt || article.excerpt

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* 顶部导航栏 */}
            <div
                className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">文章详情</h1>
                    <LanguageSwitcher
                        currentLanguage={preferredLang}
                        articleId={parseInt(id)}
                        showTranslateOption={true}
                    />
                </div>
            </div>
            
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-9">
                        <article className="prose dark:prose-invert max-w-none">
                            <h1>{displayTitle}</h1>
                            <p className="text-sm text-slate-500">{new Date(article.created_at as unknown as string).toLocaleString()}</p>
                            {displayExcerpt ? (
                                <p className="mt-2 text-slate-700 dark:text-slate-300">{displayExcerpt}</p>
                            ) : null}
                            <hr className="my-6"/>
                            <MarkdownWithToc content={displayContent}/>
                        </article>
                    </div>
                    <div className="lg:col-span-3">
                        {/* 侧边栏可以添加目录等信息 */}
                    </div>
                </div>
            </div>
        </div>
    )
} 