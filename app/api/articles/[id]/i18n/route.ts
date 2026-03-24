import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"

/**
 * POST - 保存或更新文章的多语言翻译
 */
export async function POST(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const {id: articleId} = await params
        const body = await request.json()

        const {language_code, title, content, excerpt} = body

        if (!language_code || !title || !content) {
            return NextResponse.json({
                error: "Language code, title, and content are required"
            }, {status: 400})
        }

        // 获取原文章信息
        const {data: article} = await supabase
            .from("articles")
            .select("id, title, slug, excerpt as article_excerpt")
            .eq("id", parseInt(articleId))
            .single()

        if (!article) {
            return NextResponse.json({error: "Article not found"}, {status: 404})
        }

        // 生成翻译后的 slug
        const translatedSlug = `${article.slug}-${language_code}`

        // 保存到 article_i18n 表
        const {data: i18nData, error: i18nError} = await supabase
            .from("article_i18n")
            .upsert({
                article_id: parseInt(articleId),
                language_code,
                title,
                slug: translatedSlug,
                content,
                excerpt: excerpt || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: "article_id,language_code",
            })
            .select()
            .single()

        if (i18nError) {
            console.error("Failed to save translation:", i18nError)
            return NextResponse.json({
                error: "Failed to save translation",
                details: i18nError.message
            }, {status: 500})
        }

        return NextResponse.json({
            success: true,
            translation: i18nData,
            message: `Translation for ${language_code} saved successfully`,
        })

    } catch (error) {
        console.error("Translation save error:", error)
        return NextResponse.json({
            error: "Internal server error"
        }, {status: 500})
    }
}

/**
 * GET - 获取文章的特定语言翻译
 */
export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const {id: articleId} = await params
        const searchParams = request.nextUrl.searchParams
        const language = searchParams.get("language") || "en"

        // 获取 article_i18n 表中的翻译
        const {data: i18nData, error} = await supabase
            .from("article_i18n")
            .select("id, title, content, excerpt, language_code, created_at, updated_at")
            .eq("article_id", parseInt(articleId))
            .eq("language_code", language)
            .single()

        if (error && error.code !== "PGRST116") {
            console.error("Database error:", error)
            return NextResponse.json({
                error: "Failed to fetch translation",
            }, {status: 500})
        }

        if (!i18nData) {
            return NextResponse.json({
                exists: false,
                data: null,
                message: `No translation found for language ${language}`,
            })
        }

        return NextResponse.json({
            exists: true,
            data: i18nData,
            message: `Translation for ${language} found`,
        })

    } catch (error) {
        console.error("Translation fetch error:", error)
        return NextResponse.json({
            error: "Internal server error"
        }, {status: 500})
    }
}

/**
 * DELETE - 删除文章的特定语言翻译
 */
export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const {id: articleId} = await params
        const searchParams = request.nextUrl.searchParams
        const language = searchParams.get("language")

        if (!language) {
            return NextResponse.json({
                error: "Language parameter is required"
            }, {status: 400})
        }

        // 删除 article_i18n 表中的翻译
        const {error} = await supabase
            .from("article_i18n")
            .delete()
            .eq("article_id", parseInt(articleId))
            .eq("language_code", language)

        if (error) {
            console.error("Failed to delete translation:", error)
            return NextResponse.json({
                error: "Failed to delete translation",
                details: error.message
            }, {status: 500})
        }

        return NextResponse.json({
            success: true,
            message: `Translation for ${language} deleted successfully`,
        })

    } catch (error) {
        console.error("Translation delete error:", error)
        return NextResponse.json({
            error: "Internal server error"
        }, {status: 500})
    }
}