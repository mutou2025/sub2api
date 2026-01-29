
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrendDataPoint, ModelStat } from "@/types/usage"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Note: Assuming 'recharts' will be available. If not, user needs to install it.

interface UsageChartsProps {
    trendData: TrendDataPoint[]
    modelStats: ModelStat[]
    loading?: boolean
    granularity: 'day' | 'hour'
    onGranularityChange: (val: 'day' | 'hour') => void
}

export function UsageCharts({ trendData, modelStats, loading, granularity, onGranularityChange }: UsageChartsProps) {
    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2">
            <Card className="animate-pulse h-[350px]">
                <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
                <CardContent><div className="h-full bg-muted/20 rounded"></div></CardContent>
            </Card>
            <Card className="animate-pulse h-[350px]">
                <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
                <CardContent><div className="h-full bg-muted/20 rounded"></div></CardContent>
            </Card>
        </div>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Usage Trend</CardTitle>
                    <Select value={granularity} onValueChange={(v: any) => onGranularityChange(v)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Granularity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Daily</SelectItem>
                            <SelectItem value="hour">Hourly</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                                />
                                <Bar dataKey="cost" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Model Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {modelStats.map(model => (
                            <div key={model.model} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{model.model}</span>
                                    <span className="text-muted-foreground">${model.total_cost.toFixed(4)}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(model.total_cost / Math.max(...modelStats.map(m => m.total_cost), 0.0001)) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{model.total_requests} reqs</span>
                                    <span>{model.total_tokens.toLocaleString()} tokens</span>
                                </div>
                            </div>
                        ))}
                        {modelStats.length === 0 && <div className="text-center text-muted-foreground py-10">No usage data</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
