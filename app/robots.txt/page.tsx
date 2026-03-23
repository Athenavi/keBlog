import {Metadata} from 'next'
import RobotsTxtClient from './robots-client'

export const metadata: Metadata = {
    title: 'Robots.txt - Flask Auth System',
    description: '搜索引擎爬虫指南和网站索引规则',
}

export default function RobotsTxtPage() {
    return <RobotsTxtClient/>
}
