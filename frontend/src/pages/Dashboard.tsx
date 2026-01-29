
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { usageAPI } from "@/api/usage"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { UsageCharts } from "@/components/dashboard/UsageCharts"
import type { UserDashboardStats, TrendDataPoint, ModelStat } from "@/types/usage"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function Dashboard() {
    const { user, checkAuth } = useAuthStore()
    const [stats, setStats] = useState<UserDashboardStats | null>(null)
    const [trend, setTrend] = useState<TrendDataPoint[]>([])
    const [models, setModels] = useState<ModelStat[]>([])
    const [loading, setLoading] = useState(true)
    const [chartsLoading, setChartsLoading] = useState(true)
    const [granularity, setGranularity] = useState<'day' | 'hour'>('day')

    useEffect(() => {
        checkAuth() // Ensure user data is fresh (balance etc)
        loadData()
    }, [])

    useEffect(() => {
        loadCharts()
    }, [granularity])

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await usageAPI.getDashboardStats()
            setStats(res)
            await loadCharts()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadCharts = async () => {
        setChartsLoading(true)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - 7) // Last 7 days

        try {
            const [trendRes, modelsRes] = await Promise.all([
                usageAPI.getDashboardTrend({
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    granularity
                }),
                usageAPI.getDashboardModels({
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                })
            ])
            setTrend(trendRes.trend || [])
            setModels(modelsRes.models || [])
        } catch (err) {
            console.error(err)
        } finally {
            setChartsLoading(false)
        }
    }

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {stats && (
                <StatsCards
                    stats={stats}
                    loading={loading}
                    balance={user?.balance}
                    currency={user?.currency}
                />
            )}

            <UsageCharts
                trendData={trend}
                modelStats={models}
                loading={chartsLoading}
                granularity={granularity}
                onGranularityChange={setGranularity}
            />
        </div>
    )
}
