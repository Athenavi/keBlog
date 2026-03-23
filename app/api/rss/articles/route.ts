import {NextRequest, NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 获取已发布的文章
        const {data: articles, error} = await supabase
            .from('articles')
            .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        created_at,
        updated_at,
        authors (
          id,
          username,
          email
        )
      `)
            .eq('status', 'Published')
            .order('created_at', {ascending: false})
            .limit(20)

        if (error) {
            console.error('Failed to fetch articles for RSS:', error)
            return NextResponse.json({error: 'Failed to fetch articles'}, {status: 500})
        }

        // 生成RSS XML
        const rssXml = generateRssXml(articles || [], request.nextUrl.origin)

        return new NextResponse(rssXml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=900', // 15分钟缓存
            },
        })
    } catch (error) {
        console.error('RSS generation error:', error)
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

function generateRssXml(articles: any[], baseUrl: string): string {
    const now = new Date().toISOString()

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flask Auth System - 文章</title>
    <link>${baseUrl}</link>
    <description>Flask Auth System 平台的最新文章和内容</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss/articles" rel="self" type="application/rss+xml" />
    <generator>Flask Auth System</generator>
    <ttl>900</ttl>`

    articles.forEach(article => {
        const pubDate = new Date(article.created_at).toISOString()
        const author = article.authors?.username || '未知作者'
        const content = article.excerpt || article.content?.substring(0, 200) || ''

        rss += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/articles/${article.id}</link>
      <guid>${baseUrl}/articles/${article.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
      <description><![CDATA[${content}...]]></description>
      <category>文章</category>
    </item>`
    })

    rss += `
  </channel>
</rss>`

    return rss
}
