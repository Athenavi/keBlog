import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {Skeleton} from "@/components/ui/skeleton"

export default function ActivityLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Skeleton className="h-10 w-64 mb-2"/>
                <Skeleton className="h-4 w-96"/>
            </div>

            {/* 统计卡片骨架 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20"/>
                            <Skeleton className="h-4 w-4"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2"/>
                            <Skeleton className="h-3 w-24"/>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 活动列表骨架 */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2"/>
                    <Skeleton className="h-4 w-64"/>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({length: 5}).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0"/>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-5 w-6"/>
                                        <Skeleton className="h-5 w-32"/>
                                        <Skeleton className="h-5 w-16"/>
                                    </div>

                                    <Skeleton className="h-4 w-64"/>

                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-3 w-16"/>
                                        <Skeleton className="h-3 w-20"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
