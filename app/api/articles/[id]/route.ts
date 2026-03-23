import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"
import {logArticleDeleted, logArticleUpdated} from "@/lib/activity-logger"

export async function GET(request: NextRequest, {params}: { params: { id: string } }) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const {id: articleId} = params

        const {data: article, error} = await supabase
            .from("articles")
            .select(`
        id,
        title,
        slug,
        excerpt,
        status,
        user_id,
        created_at,
        updated_at
      `)
            .eq("id", articleId)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({error: "Article not found"}, {status: 404})
            }
            console.error("Database error:", error)
            return NextResponse.json({error: "Failed to fetch article"}, {status: 500})
        }

        const {data: author} = await supabase
            .from("users")
            .select("id, username, profile_picture")
            .eq("id", article.user_id)
            .single()

        const {data: articleContent} = await supabase
            .from("article_content")
            .select("content, language_code")
            .eq("article_id", articleId)

        const {data: comments} = await supabase
            .from("comments")
            .select(`
        id,
        content,
        user_id,
        created_at
      `)
            .eq("article_id", articleId)
            .order("created_at", {ascending: true})

        // Get the content (assuming English for now)
        const content = articleContent?.find((c) => c.language_code === "en")?.content || ""

        // Transform the data
        const transformedArticle = {
            ...article,
            author: author || {username: "Unknown", profile_picture: null},
            content,
            comments: comments || [],
        }

        return NextResponse.json({article: transformedArticle})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

export async function DELETE(request: NextRequest, {params}: { params: { id: string } }) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const {id: articleId} = params

        // Check if article exists and user owns it
        const {data: article, error: fetchError} = await supabase
            .from("articles")
            .select("id, user_id, title")
            .eq("id", articleId)
            .single()

        if (fetchError) {
            if (fetchError.code === "PGRST116") {
                return NextResponse.json({error: "Article not found"}, {status: 404})
            }
            return NextResponse.json({error: "Failed to fetch article"}, {status: 500})
        }

        if (article.user_id !== user.id) {
            return NextResponse.json({error: "Forbidden: You can only delete your own articles"}, {status: 403})
        }

        // Delete article (cascade will handle related records)
        const {error: deleteError} = await supabase.from("articles").delete().eq("id", articleId)

        if (deleteError) {
            console.error("Delete error:", deleteError)
            return NextResponse.json({error: "Failed to delete article"}, {status: 500})
        }

        // Log activity
        try {
            await logArticleDeleted(articleId, article.title, user.id, request)
        } catch (logError) {
            console.error("Failed to log activity:", logError)
            // Don't fail the request if logging fails
        }

        return NextResponse.json({message: "Article deleted successfully"})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

export async function PUT(request: NextRequest, {params}: { params: { id: string } }) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: {user},
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const {id: articleId} = params
        const body = await request.json()
        const {title, slug, excerpt, content, status} = body

        // Validate required fields
        if (!title || !slug || !content) {
            return NextResponse.json({error: "Title, slug, and content are required"}, {status: 400})
        }

        // Validate status
        const validStatuses = ["Draft", "Published", "Deleted"]
        const normalizedStatus = validStatuses.includes(status) ? status : "Draft"

        // Check if article exists and user owns it
        const {data: existingArticle, error: fetchError} = await supabase
            .from("articles")
            .select("id, user_id, title")
            .eq("id", articleId)
            .single()

        if (fetchError) {
            if (fetchError.code === "PGRST116") {
                return NextResponse.json({error: "Article not found"}, {status: 404})
            }
            return NextResponse.json({error: "Failed to fetch article"}, {status: 500})
        }

        if (existingArticle.user_id !== user.id) {
            return NextResponse.json({error: "Forbidden: You can only edit your own articles"}, {status: 403})
        }

        // Update article
        const {data: updatedArticle, error: updateError} = await supabase
            .from("articles")
            .update({
                title,
                slug,
                excerpt: excerpt || null,
                status: normalizedStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", articleId)
            .select()
            .single()

        if (updateError) {
            console.error("Update error:", updateError)
            return NextResponse.json({error: "Failed to update article"}, {status: 500})
        }

        // Update article content
        const {error: contentError} = await supabase.from("article_content").upsert({
            article_id: articleId,
            content,
            language_code: "en",
            updated_at: new Date().toISOString(),
        })

        if (contentError) {
            console.error("Content update error:", contentError)
            return NextResponse.json({error: "Failed to update article content"}, {status: 500})
        }

        // Log activity
        try {
            await logArticleUpdated(articleId, title, user.id, request)
        } catch (logError) {
            console.error("Failed to log activity:", logError)
            // Don't fail the request if logging fails
        }

        return NextResponse.json({
            message: "Article updated successfully",
            article: updatedArticle,
        })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
