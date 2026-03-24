import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

        const {data: articles, error} = await supabase
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
            .order("created_at", {ascending: false})

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({error: "Failed to fetch articles"}, {status: 500})
        }

        const transformedArticles = await Promise.all(
            (articles || []).map(async (article) => {
                // Get author info
                const {data: author} = await supabase
                    .from("users")
                    .select("username, profile_picture")
                    .eq("id", article.user_id)
                    .single()

                // Get comment count
                const {count: commentCount} = await supabase
                    .from("comments")
                    .select("*", {count: "exact", head: true})
                    .eq("article_id", article.id)

                return {
                    ...article,
                    author: author || {username: "Unknown", profile_picture: null},
                    _count: {
                        comments: commentCount || 0,
                    },
                }
            }),
        )

        return NextResponse.json({articles: transformedArticles})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

export async function POST(request: NextRequest) {
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

        let {data: profile} = await supabase.from("users").select("id").eq("id", user.id).single()

        if (!profile) {
            // Create user profile if it doesn't exist
            const {data: newProfile, error: profileError} = await supabase
                .from("users")
                .insert({
                    id: user.id,
                    username: user.email?.split("@")[0] || "user",
                    email: user.email || "",
                    register_ip: "127.0.0.1", // Default IP, could be improved with actual IP detection
                })
                .select("id")
                .single()

            if (profileError) {
                console.error("Profile creation error:", profileError)
                return NextResponse.json({error: "Failed to create user profile"}, {status: 500})
            }

            profile = newProfile
        }

        const body = await request.json()
        const {title, slug, excerpt, content, status} = body

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json({error: "Title and content are required"}, {status: 400})
        }

        const validStatuses = ["Draft", "Published", "Deleted"]
        const normalizedStatus = status && validStatuses.includes(status) ? status : "Draft"

        // Check if slug already exists
        const {data: existingArticle} = await supabase.from("articles").select("id").eq("slug", slug).single()

        if (existingArticle) {
            return NextResponse.json({error: "Article with this slug already exists"}, {status: 400})
        }

        // Create article
        const {data: article, error} = await supabase
            .from("articles")
            .insert({
                title,
                slug,
                excerpt,
                status: normalizedStatus, // Use normalized status value
                user_id: profile.id,
            })
            .select()
            .single()

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({error: "Failed to create article"}, {status: 500})
        }

        // Create article content
        const {error: contentError} = await supabase.from("article_content").insert({
            article_id: article.id,
            content,
            language_code: "zh-CN",
        })

        if (contentError) {
            console.error("Content creation error:", contentError)
            // Clean up the article if content creation fails
            await supabase.from("articles").delete().eq("id", article.id)
            return NextResponse.json({error: "Failed to create article content"}, {status: 500})
        }

        // Activity logging is now handled by database triggers

        return NextResponse.json({article}, {status: 201})
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
