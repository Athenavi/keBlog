'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'
import {AlertTriangle, Bot, CheckCircle, FileText, Search, Shield} from 'lucide-react'

export default function RobotsTxtClient() {
    const allowedPaths = [
        {path: '/', description: '网站主页', reason: '公开访问'},
        {path: '/articles', description: '文章列表', reason: '公开内容'},
        {path: '/auth/login', description: '登录页面', reason: '用户认证'},
        {path: '/auth/register', description: '注册页面', reason: '用户注册'},
        {path: '/sitemap', description: '网站地图', reason: 'SEO优化'},
        {path: '/rss', description: 'RSS订阅', reason: '内容聚合'},
    ]

    const disallowedPaths = [
        {path: '/dashboard/*', description: '用户仪表板', reason: '需要登录'},
        {path: '/admin/*', description: '管理后台', reason: '管理员专用'},
        {path: '/api/*', description: 'API接口', reason: '程序调用'},
        {path: '/auth/*/success', description: '认证成功页面', reason: '临时页面'},
        {path: '/unauthorized', description: '未授权页面', reason: '错误页面'},
    ]

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
Sitemap: ${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/sitemap.xml

# 爬取延迟（秒）
Crawl-delay: 1

# 注意：此文件可通过 /api/robots.txt 访问`

    const handleCopyRobotsTxt = () => {
        navigator.clipboard.writeText(robotsContent)
        // 这里可以添加toast提示
    }

    const handleDownloadRobotsTxt = () => {
        const blob = new Blob([robotsContent], {type: 'text/plain'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'robots.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Bot className="w-8 h-8 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold mb-4">Robots.txt</h1>
                <p className="text-lg text-muted-foreground mb-4">
                    搜索引擎爬虫指南和网站索引规则
                </p>
                <p className="text-sm text-muted-foreground">
                    robots.txt 文件告诉搜索引擎爬虫哪些页面可以访问，哪些页面不应该被索引
                </p>
            </div>

            <div className="space-y-8">
                {/* robots.txt 内容预览 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5"/>
                            Robots.txt 内容
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-lg mb-4">
                            <pre className="text-sm whitespace-pre-wrap font-mono">{robotsContent}</pre>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyRobotsTxt}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                复制内容
                            </button>
                            <button
                                onClick={handleDownloadRobotsTxt}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                            >
                                下载文件
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* 允许访问的路径 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600"/>
                            允许访问的路径
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allowedPaths.map((item, index) => (
                                <div key={index} className="p-4 border border-green-200 rounded-lg bg-green-50">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-green-800">{item.path}</h3>
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            允许
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-green-700 mb-2">{item.description}</p>
                                    <p className="text-xs text-green-600">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* 禁止访问的路径 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600"/>
                            禁止访问的路径
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {disallowedPaths.map((item, index) => (
                                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-red-800">{item.path}</h3>
                                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                                            禁止
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-red-700 mb-2">{item.description}</p>
                                    <p className="text-xs text-red-600">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* 搜索引擎说明 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5"/>
                            搜索引擎说明
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">Google</h4>
                                <p className="text-sm text-blue-700">
                                    Google 爬虫会遵循 robots.txt 规则，但可能会忽略某些禁止规则。建议同时使用 meta robots
                                    标签。
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-800 mb-2">Bing</h4>
                                <p className="text-sm text-green-700">
                                    Bing 爬虫严格遵守 robots.txt 规则，会完全遵循禁止访问的指令。
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-semibold text-purple-800 mb-2">百度</h4>
                                <p className="text-sm text-purple-700">
                                    百度爬虫会参考 robots.txt，但建议同时使用百度站长工具进行更精确的控制。
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* 最佳实践 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5"/>
                            Robots.txt 最佳实践
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex gap-2">
                                <span className="text-green-600">✓</span>
                                <span>将 robots.txt 放在网站根目录</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-green-600">✓</span>
                                <span>使用通配符 (*) 来匹配多个路径</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-green-600">✓</span>
                                <span>包含网站地图链接</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-green-600">✓</span>
                                <span>设置合理的爬取延迟</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-600">✗</span>
                                <span>不要过度限制爬虫访问</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-600">✗</span>
                                <span>不要依赖 robots.txt 来隐藏敏感信息</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>robots.txt 文件会自动生成，无需手动创建</p>
                <p>如需修改规则，请联系网站管理员</p>
            </div>
        </div>
    )
}
