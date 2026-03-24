import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"

/**
 * POST - 使用浏览器翻译 API 翻译文章并保存到 article_i18n 表
 */
export async function POST(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const {id: articleId} = await params
        const body = await request.json()
        const {targetLanguage} = body

        if (!targetLanguage) {
            return NextResponse.json({error: "Target language is required"}, {status: 400})
        }

        // 获取文章原文内容
        const {data: article} = await supabase
            .from("articles")
            .select("id, title, slug, excerpt")
            .eq("id", parseInt(articleId))
            .single()

        if (!article) {
            return NextResponse.json({error: "Article not found"}, {status: 404})
        }

        // 获取文章内容
        const {data: contentData} = await supabase
            .from("article_content")
            .select("content, language_code")
            .eq("article_id", parseInt(articleId))
            .order("language_code", {ascending: true})
            .limit(1)
            .single()

        if (!contentData || !contentData.content) {
            return NextResponse.json({error: "No content found"}, {status: 404})
        }

        const originalContent = contentData.content
        const sourceLanguage = contentData.language_code || "zh-CN"

        // 使用浏览器翻译 API 进行翻译
        const translatedTitle = await translateText(article.title, sourceLanguage, targetLanguage)
        const translatedContent = await translateText(originalContent, sourceLanguage, targetLanguage)
        const translatedExcerpt = article.excerpt
            ? await translateText(article.excerpt, sourceLanguage, targetLanguage)
            : null

        // 生成翻译后的 slug（可选）
        const translatedSlug = generateTranslatedSlug(article.slug, targetLanguage)

        // 保存到 article_i18n 表
        const {data: i18nData, error: i18nError} = await supabase
            .from("article_i18n")
            .upsert({
                article_id: parseInt(articleId),
                language_code: targetLanguage,
                title: translatedTitle,
                slug: translatedSlug,
                content: translatedContent,
                excerpt: translatedExcerpt,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: "article_id,language_code",
            })
            .select()
            .single()

        if (i18nError) {
            console.error("Failed to save translation:", i18nError)
            return NextResponse.json({error: "Failed to save translation"}, {status: 500})
        }

        return NextResponse.json({
            success: true,
            translation: i18nData,
            message: `Article translated to ${targetLanguage}`,
        })

    } catch (error) {
        console.error("Translation error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

/**
 * 使用浏览器翻译 API 翻译文本
 * 注意：这是一个简化的实现，实际项目中可能需要使用专业的翻译服务
 */
async function translateText(
    text: string,
    fromLang: string,
    toLang: string
): Promise<string> {
    if (!text || text.trim() === "") {
        return ""
    }

    // 如果源语言和目标语言相同，直接返回
    if (fromLang === toLang) {
        return text
    }

    try {
        // 方法 1: 使用 Google Translate API (需要 API key)
        // 这里提供一个示例实现，实际使用时需要配置 API key

        // 方法 2: 使用浏览器自带的翻译功能（通过提示用户）
        // 由于无法直接调用浏览器翻译 API，我们返回原文并提示用户

        // 方法 3: 使用免费的翻译 API（如 MyMemory Translation API）
        const encodedText = encodeURIComponent(text.substring(0, 500)) // API 限制长度
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${fromLang}|${toLang}`

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data && data.responseData) {
            const translated = data.responseData.translatedText

            // 如果文本超过 500 字符，需要分段翻译
            if (text.length > 500) {
                const remainingText = text.substring(500)
                const translatedRemaining = await translateText(remainingText, fromLang, toLang)
                return translated + translatedRemaining
            }

            return translated
        }

        // 如果翻译失败，返回原文
        return text

    } catch (error) {
        console.error("Translation failed:", error)
        // 翻译失败时返回原文
        return text
    }
}

/**
 * 生成翻译后的 slug
 */
function generateTranslatedSlug(originalSlug: string, targetLanguage: string): string {
    // 简单实现：在原有 slug 后添加语言后缀
    // 例如：my-article -> my-article-en
    return `${originalSlug}-${targetLanguage}`
}
