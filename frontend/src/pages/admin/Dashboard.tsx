
import { useQuery } from "@tanstack/react-query"
import { adminAPI } from "@/api/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Key,
    Server,
    BarChart2,
    UserPlus,
    Database,
    Zap,
    Clock,
    Loader2
} from "lucide-react"

interface DashboardStats {
    total_api_keys: number
    active_api_keys: number
    total_accounts: number
    normal_accounts: number
    error_accounts: number
    today_requests: number
    total_requests: number
    today_new_users: number
    total_users: number
    today_tokens: number
    total_tokens: number
    today_cost: number
    today_actual_cost: number
    total_cost: number
    total_actual_cost: number
    rpm: number
    tpm: number
    average_duration_ms: number
    active_users: number
}

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => adminAPI.getStats() as Promise<DashboardStats>
    })

    const formatTokens = (value: number | undefined): string => {
        if (value === undefined || value === null) return '0'
        if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
        if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
        return value.toLocaleString()
    }

    const formatCost = (value: number): string => {
        if (value >= 1000) return (value / 1000).toFixed(2) + 'K'
        if (value >= 1) return value.toFixed(2)
        if (value >= 0.01) return value.toFixed(3)
        return value.toFixed(4)
    }

    const formatDuration = (ms: number): string => {
        if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
        return `${Math.round(ms)}ms`
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">System overview and statistics.</p>
            </div>

            {/* Row 1: Core Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                                <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">API Keys</p>
                                <p className="text-xl font-bold">{stats.total_api_keys}</p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {stats.active_api_keys} active
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                                <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Accounts</p>
                                <p className="text-xl font-bold">{stats.total_accounts}</p>
                                <div className="text-xs">
                                    <span className="text-green-600 dark:text-green-400">{stats.normal_accounts} active</span>
                                    {stats.error_accounts > 0 && (
                                        <span className="ml-1 text-red-500">{stats.error_accounts} error</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                                <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Today Requests</p>
                                <p className="text-xl font-bold">{stats.today_requests}</p>
                                <p className="text-xs text-muted-foreground">
                                    Total: {stats.total_requests.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
                                <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Users</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    +{stats.today_new_users}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total: {stats.total_users.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Token Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                                <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Today Tokens</p>
                                <p className="text-xl font-bold">{formatTokens(stats.today_tokens)}</p>
                                <p className="text-xs">
                                    <span className="text-amber-600 dark:text-amber-400">${formatCost(stats.today_actual_cost)}</span>
                                    <span className="text-muted-foreground"> / ${formatCost(stats.today_cost)}</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
                                <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Tokens</p>
                                <p className="text-xl font-bold">{formatTokens(stats.total_tokens)}</p>
                                <p className="text-xs">
                                    <span className="text-indigo-600 dark:text-indigo-400">${formatCost(stats.total_actual_cost)}</span>
                                    <span className="text-muted-foreground"> / ${formatCost(stats.total_cost)}</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                                <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground">Performance</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold">{formatTokens(stats.rpm)}</p>
                                    <span className="text-xs text-muted-foreground">RPM</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                        {formatTokens(stats.tpm)}
                                    </p>
                                    <span className="text-xs text-muted-foreground">TPM</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 p-2">
                                <Clock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Avg Response</p>
                                <p className="text-xl font-bold">{formatDuration(stats.average_duration_ms)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.active_users} active users
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TODO: Add charts section in future iteration */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Charts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                        Charts coming soon (requires chart library integration)
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
