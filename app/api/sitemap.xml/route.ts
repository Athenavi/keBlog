import {NextRequest, NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const baseUrl = request.nextUrl.origin

        // 获取已发布的文章
        const {data: articles, error} = await supabase
            .from('articles')
            .select('id, title, updated_at')
            .eq('status', 'Published')
            .order('updated_at', {ascending: false})

        if (error) {
            console.error('Failed to fetch articles for sitemap:', error)
            return NextResponse.json({error: 'Failed to fetch articles'}, {status: 500})
        }

        // 生成sitemap XML
        const sitemapXml = generateSitemapXml(articles || [], baseUrl)

        return new NextResponse(sitemapXml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600', // 1小时缓存
            },
        })
    } catch (error) {
        console.error('Sitemap generation error:', error)
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

function generateSitemapXml(articles: any[], baseUrl: string): string {
    const now = new Date().toISOString().split('T')[0]

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 静态页面 -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth/login</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth/register</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/sitemap</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/rss</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`

    // 添加文章页面
    articles.forEach(article => {
        const lastmod = new Date(article.updated_at).toISOString().split('T')[0]
        sitemap += `
  <url>
    <loc>${baseUrl}/articles/${article.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    sitemap += `
</urlset>`

    return sitemap
}
