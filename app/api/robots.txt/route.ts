import {NextRequest, NextResponse} from 'next/server'

export async function GET(request: NextRequest) {
    const baseUrl = request.nextUrl.origin

    const robotsContent = `# robots.txt for Flask Auth System
# 生成时间: ${new Date().toLocaleDateString('zh-CN')}

User-agent: *
Allow: /
Allow: /articles
Allow: /auth/login
Allow: /auth/register
Allow: /sitemap
Allow: /rss

Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/*/success
Disallow: /unauthorized

# 网站地图
Sitemap: ${baseUrl}/api/sitemap.xml

# 爬取延迟（秒）
Crawl-delay: 1`

    return new NextResponse(robotsContent, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600', // 1小时缓存
        },
    })
}
