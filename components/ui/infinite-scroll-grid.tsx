"use client"

import React, {useCallback, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-react"

interface InfiniteScrollGridProps<T> {
    items: T[]
    renderItem: (item: T, index: number) => React.ReactNode
    renderContainer: (children: React.ReactNode) => React.ReactNode
    initialPageSize?: number
    loadMoreThreshold?: number
    className?: string
}

export default function InfiniteScrollGrid<T>({
                                                  items,
                                                  renderItem,
                                                  renderContainer,
                                                  initialPageSize = 30,
                                                  loadMoreThreshold = 100,
                                                  className = ""
                                              }: InfiniteScrollGridProps<T>) {
    const [displayCount, setDisplayCount] = useState(initialPageSize)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    // 重置显示数量当 items 变化时
    useEffect(() => {
        setDisplayCount(initialPageSize)
        setHasMore(items.length > initialPageSize)
    }, [items, initialPageSize])

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return

        setIsLoading(true)
        // 模拟加载延迟，提升用户体验
        setTimeout(() => {
            setDisplayCount(prev => {
                const newCount = prev + initialPageSize
                if (newCount >= items.length) {
                    setHasMore(false)
                }
                return Math.min(newCount, items.length)
            })
            setIsLoading(false)
        }, 150)
    }, [isLoading, hasMore, items.length, initialPageSize])

    // 处理滚动事件
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight
            const scrollTop = document.documentElement.scrollTop || window.pageYOffset
            const clientHeight = document.documentElement.clientHeight

            const scrollBottom = scrollHeight - scrollTop - clientHeight

            if (scrollBottom < loadMoreThreshold && hasMore && !isLoading) {
                loadMore()
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [loadMore, hasMore, isLoading, loadMoreThreshold])

    const displayItems = items.slice(0, displayCount)

    return (
        <>
            {renderContainer(
                displayItems.map((item, index) => renderItem(item, index))
            )}

            {hasMore && (
                <div className="flex justify-center items-center py-8">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400"/>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={loadMore}
                            className="bg-transparent"
                        >
                            加载更多
                        </Button>
                    )}
                </div>
            )}

            {!hasMore && displayItems.length > initialPageSize && (
                <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
                    已加载全部 {items.length} 项
                </div>
            )}
        </>
    )
}
