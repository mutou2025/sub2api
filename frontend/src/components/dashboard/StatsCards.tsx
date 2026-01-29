
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserDashboardStats } from "@/types/usage"
import { DollarSign, Activity, Zap, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardsProps {
    stats: UserDashboardStats
    loading?: boolean
    balance?: number
    currency?: string
}

export function StatsCards({ stats, loading, balance = 0, currency = '$' }: StatsCardsProps) {
    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-16 bg-muted rounded"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    }

    const items = [
        {
            title: "Balance",
            value: `${currency}${balance.toFixed(2)}`,
            icon: DollarSign,
            description: "Current account balance"
        },
        {
            title: "Total Cost",
            value: `${currency}${stats.total_cost.toFixed(4)}`,
            icon: Activity,
            description: `${stats.cost_trend > 0 ? '+' : ''}${stats.cost_trend}% from last period`,
            trend: stats.cost_trend
        },
        {
            title: "Total Requests",
            value: stats.total_requests.toLocaleString(),
            icon: Zap,
            description: `${stats.request_count_trend > 0 ? '+' : ''}${stats.request_count_trend}% from last period`,
            trend: stats.request_count_trend
        },
        {
            title: "Total Tokens",
            value: stats.total_tokens.toLocaleString(),
            icon: Zap, // Or a Token icon if available
            description: "Total tokens consumed"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.title}
                        </CardTitle>
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            {item.trend !== undefined && (
                                <span className={`mr-1 flex items-center ${item.trend > 0 ? 'text-green-500' : item.trend < 0 ? 'text-red-500' : ''}`}>
                                    {item.trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : item.trend < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
                                </span>
                            )}
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
