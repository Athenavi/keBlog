"use client"

import React, {useCallback, useEffect, useRef, useState} from 'react'

interface VirtualListProps<T> {
    items: T[]
    itemHeight: number
    overscan?: number
    renderItem: (item: T, index: number) => React.ReactNode
    className?: string
    containerClassName?: string
    onLoadMore?: () => void
    threshold?: number
}

export default function VirtualList<T>({
                                           items,
                                           itemHeight,
                                           overscan = 5,
                                           renderItem,
                                           className = "",
                                           containerClassName = "",
                                           onLoadMore,
                                           threshold = 100
                                       }: VirtualListProps<T>) {
    const [visibleRange, setVisibleRange] = useState({start: 0, end: Math.min(20, items.length)})
    const containerRef = useRef<HTMLDivElement>(null)
    const isLoadingMore = useRef(false)

    // 计算总高度
    const totalHeight = items.length * itemHeight

    // 处理滚动事件
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return

        const scrollTop = containerRef.current.scrollTop
        const containerHeight = containerRef.current.clientHeight

        // 计算可见范围
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const end = Math.min(
            items.length,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        )

        setVisibleRange({start, end})

        // 触发加载更多
        if (onLoadMore && !isLoadingMore.current) {
            const scrollBottom = containerRef.current.scrollHeight - scrollTop - containerHeight
            if (scrollBottom < threshold) {
                isLoadingMore.current = true
                onLoadMore()
            }
        }
    }, [itemHeight, items.length, overscan, onLoadMore, threshold])

    // 重置加载状态当 items 变化时
    useEffect(() => {
        isLoadingMore.current = false
    }, [items])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('scroll', handleScroll)
        handleScroll() // 初始化可见范围

        return () => {
            container.removeEventListener('scroll', handleScroll)
        }
    }, [handleScroll])

    // 优化：如果项目数量少，直接渲染所有
    if (items.length <= 20) {
        return (
            <div ref={containerRef} className={`overflow-auto ${containerClassName}`}>
                <div className={className}>
                    {items.map((item, index) => renderItem(item, index))}
                </div>
            </div>
        )
    }

    const visibleItems = items.slice(visibleRange.start, visibleRange.end)

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${containerClassName}`}
            style={{maxHeight: 'calc(100vh - 300px)'}}
        >
            <div
                className={className}
                style={{
                    height: `${totalHeight}px`,
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: `translateY(${visibleRange.start * itemHeight}px)`
                    }}
                >
                    {visibleItems.map((item, index) =>
                        renderItem(item, visibleRange.start + index)
                    )}
                </div>
            </div>
        </div>
    )
}

// 用于表格行的虚拟滚动组件
interface VirtualTableProps<T> {
    items: T[]
    itemHeight?: number
    overscan?: number
    renderRow: (item: T, index: number) => React.ReactNode
    containerClassName?: string
    onLoadMore?: () => void
}

export function VirtualTable<T>({
                                    items,
                                    itemHeight = 56,
                                    overscan = 5,
                                    renderRow,
                                    containerClassName = "",
                                    onLoadMore
                                }: VirtualTableProps<T>) {
    const [visibleRange, setVisibleRange] = useState({start: 0, end: Math.min(20, items.length)})
    const containerRef = useRef<HTMLDivElement>(null)
    const isLoadingMore = useRef(false)

    const totalHeight = items.length * itemHeight

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return

        const scrollTop = containerRef.current.scrollTop
        const containerHeight = containerRef.current.clientHeight

        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const end = Math.min(
            items.length,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        )

        setVisibleRange({start, end})

        if (onLoadMore && !isLoadingMore.current) {
            const scrollBottom = containerRef.current.scrollHeight - scrollTop - containerHeight
            if (scrollBottom < 100) {
                isLoadingMore.current = true
                onLoadMore()
            }
        }
    }, [itemHeight, items.length, overscan, onLoadMore])

    useEffect(() => {
        isLoadingMore.current = false
    }, [items])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('scroll', handleScroll)
        handleScroll()

        return () => {
            container.removeEventListener('scroll', handleScroll)
        }
    }, [handleScroll])

    // 小数据量时直接渲染
    if (items.length <= 20) {
        return (
            <div className={`overflow-auto ${containerClassName}`}>
                <table className="w-full">
                    <tbody>
                    {items.map((item, index) => renderRow(item, index))}
                    </tbody>
                </table>
            </div>
        )
    }

    const visibleItems = items.slice(visibleRange.start, visibleRange.end)

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${containerClassName}`}
            style={{maxHeight: 'calc(100vh - 300px)'}}
        >
            <table className="w-full" style={{height: `${totalHeight}px`, position: 'relative'}}>
                <tbody
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: `translateY(${visibleRange.start * itemHeight}px)`
                    }}
                >
                {visibleItems.map((item, index) =>
                    renderRow(item, visibleRange.start + index)
                )}
                </tbody>
            </table>
        </div>
    )
}
