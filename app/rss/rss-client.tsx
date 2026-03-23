'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'
import {Calendar, Download, ExternalLink, Rss, Tag} from 'lucide-react'

export default function RssPageClient() {
    const rssFeeds = [
        {
            name: '所有文章',
            description: '包含网站发布的所有文章内容',
            url: '/api/rss/articles',
            format: 'RSS 2.0',
            updateFrequency: '实时更新',
            language: 'zh-CN',
            category: '文章',
        },
        {
            name: '最新文章',
            description: '仅包含最近发布的文章',
            url: '/api/rss/articles/recent',
            format: 'RSS 2.0',
            updateFrequency: '每日更新',
            language: 'zh-CN',
            category: '最新',
        },
        {
            name: '分类文章',
            description: '按分类筛选的文章内容',
            url: '/api/rss/articles/categories',
            format: 'RSS 2.0',
            updateFrequency: '实时更新',
            language: 'zh-CN',
            category: '分类',
        },
    ]

    const rssReaders = [
        {
            name: 'Feedly',
            description: '流行的在线RSS阅读器',
            url: 'https://feedly.com',
            icon: '📱',
        },
        {
            name: 'Inoreader',
            description: '功能强大的RSS阅读器',
            url: 'https://www.inoreader.com',
            icon: '📖',
        },
        {
            name: 'NetNewsWire',
            description: 'macOS和iOS上的优秀RSS阅读器',
            url: 'https://netnewswire.com',
            icon: '🍎',
        },
        {
            name: 'Feeder',
            description: '简洁的RSS阅读器',
            url: 'https://feeder.co',
            icon: '📡',
        },
    ]

    const handleCopyRssUrl = (url: string) => {
        navigator.clipboard.writeText(`${window.location.origin}${url}`)
        // 这里可以添加toast提示
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Rss className="w-8 h-8 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold mb-4">RSS订阅</h1>
                <p className="text-lg text-muted-foreground mb-4">
                    订阅网站最新内容，获取实时更新
                </p>
                <p className="text-sm text-muted-foreground">
                    RSS (Really Simple Syndication) 是一种内容聚合格式，让您能够轻松跟踪网站更新
                </p>
            </div>

            <div className="space-y-8">
                {/* RSS源列表 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rss className="w-5 h-5"/>
                            可用的RSS源
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rssFeeds.map((feed, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">{feed.name}</h3>
                                            <p className="text-muted-foreground mb-3">{feed.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3"/>
                                                    {feed.category}
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3"/>
                                                    {feed.updateFrequency}
                                                </Badge>
                                                <Badge variant="outline">{feed.language}</Badge>
                                                <Badge variant="outline">{feed.format}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyRssUrl(feed.url)}
                                            >
                                                <Download className="w-4 h-4 mr-2"/>
                                                复制链接
                                            </Button>
                                            <Button size="sm" asChild>
                                                <a href={feed.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4 mr-2"/>
                                                    预览
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-muted p-3 rounded text-sm font-mono break-all">
                                        {feed.url}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* 如何使用RSS */}
                <Card>
                    <CardHeader>
                        <CardTitle>如何使用RSS？</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div
                                    className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">选择RSS源</h4>
                                    <p className="text-muted-foreground">
                                        从上面的列表中选择您感兴趣的RSS源，点击"复制链接"获取URL
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div
                                    className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">添加到RSS阅读器</h4>
                                    <p className="text-muted-foreground">
                                        将复制的URL添加到您喜欢的RSS阅读器中
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div
                                    className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">开始订阅</h4>
                                    <p className="text-muted-foreground">
                                        现在您就可以在RSS阅读器中看到网站的最新更新了
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* 推荐的RSS阅读器 */}
                <Card>
                    <CardHeader>
                        <CardTitle>推荐的RSS阅读器</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rssReaders.map((reader, index) => (
                                <a
                                    key={index}
                                    href={reader.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{reader.icon}</span>
                                        <div>
                                            <h3 className="font-semibold">{reader.name}</h3>
                                            <p className="text-sm text-muted-foreground">{reader.description}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator/>

                {/* RSS格式说明 */}
                <Card>
                    <CardHeader>
                        <CardTitle>关于RSS格式</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                RSS是一种基于XML的格式，用于发布经常更新的内容，如博客文章、新闻标题、音频和视频。
                            </p>
                            <p>
                                我们的RSS源遵循RSS 2.0标准，包含文章的标题、摘要、发布时间、作者等信息。
                            </p>
                            <p>
                                订阅RSS源后，您可以在RSS阅读器中看到所有新发布的内容，无需手动访问网站。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>RSS源每15分钟自动更新一次</p>
                <p>如有问题，请联系技术支持</p>
            </div>
        </div>
    )
}
