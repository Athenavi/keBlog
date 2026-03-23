import {Metadata} from 'next'
import RssPageClient from './rss-client'

export const metadata: Metadata = {
    title: 'RSS订阅 - Flask Auth System',
    description: '订阅网站最新内容，获取实时更新',
}

export default function RssPage() {
    return <RssPageClient/>
}
