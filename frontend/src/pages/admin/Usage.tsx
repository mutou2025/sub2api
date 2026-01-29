
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { adminAPI } from "@/api/admin"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
    Search,
    RefreshCw,
    Download,
    BarChart2,
    DollarSign,
    Zap,
    Clock
} from "lucide-react"

interface UsageLog {
    id: number
    created_at: string
    user?: { email: string }
    api_key?: { name: string }
    account?: { name: string }
    model: string
    group?: { name: string }
    stream: boolean
    input_tokens: number
    output_tokens: number
    total_cost: number
    actual_cost: number
    duration_ms: number
}

interface UsageStats {
    total_requests: number
    total_tokens: number
    total_cost: number
    avg_duration_ms: number
}

export default function AdminUsage() {
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [search, setSearch] = useState("")

    // Date range - default to last 7 days
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 6)
    const [startDate, setStartDate] = useState(weekAgo.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

    const { data: logsData, isLoading, refetch } = useQuery({
        queryKey: ['admin-usage-logs', page, pageSize, search, startDate, endDate],
        queryFn: () => (adminAPI as any).usage?.list?.({
            page,
            page_size: pageSize,
            search: search || undefined,
            start_date: startDate,
            end_date: endDate
        }) || Promise.resolve({ items: [], total: 0 })
    })

    const { data: statsData } = useQuery<UsageStats>({
        queryKey: ['admin-usage-stats', startDate, endDate],
        queryFn: () => (adminAPI as any).usage?.getStats?.({
            start_date: startDate,
            end_date: endDate
        }) || Promise.resolve({ total_requests: 0, total_tokens: 0, total_cost: 0, avg_duration_ms: 0 })
    })

    const formatTokens = (value: number): string => {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
        if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
        return value.toLocaleString()
    }

    const columns: ColumnDef<UsageLog>[] = [
        {
            accessorKey: "created_at",
            header: "Time",
            cell: ({ row }) => format(new Date(row.original.created_at), 'MM/dd HH:mm')
        },
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => (
                <span className="text-xs">{row.original.user?.email?.split('@')[0] || '-'}</span>
            )
        },
        {
            accessorKey: "model",
            header: "Model",
            cell: ({ row }) => (
                <code className="text-xs bg-muted px-1 rounded">{row.original.model}</code>
            )
        },
        {
            accessorKey: "tokens",
            header: "Tokens",
            cell: ({ row }) => (
                <div className="text-xs">
                    <span className="text-green-600">{formatTokens(row.original.input_tokens)}</span>
                    {' / '}
                    <span className="text-blue-600">{formatTokens(row.original.output_tokens)}</span>
                </div>
            )
        },
        {
            accessorKey: "total_cost",
            header: "Cost",
            cell: ({ row }) => (
                <span className="text-xs font-medium">${row.original.total_cost?.toFixed(4)}</span>
            )
        },
        {
            accessorKey: "duration_ms",
            header: "Duration",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {row.original.duration_ms >= 1000
                        ? `${(row.original.duration_ms / 1000).toFixed(1)}s`
                        : `${row.original.duration_ms}ms`
                    }
                </span>
            )
        },
        {
            accessorKey: "stream",
            header: "Type",
            cell: ({ row }) => (
                <span className={`text-xs ${row.original.stream ? 'text-purple-600' : 'text-gray-500'}`}>
                    {row.original.stream ? 'Stream' : 'Sync'}
                </span>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Usage</h2>
                    <p className="text-muted-foreground">View system-wide usage logs and statistics.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                            <BarChart2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Requests</p>
                            <p className="text-xl font-bold">{statsData?.total_requests?.toLocaleString() || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                            <Zap className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tokens</p>
                            <p className="text-xl font-bold">{formatTokens(statsData?.total_tokens || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Cost</p>
                            <p className="text-xl font-bold">${statsData?.total_cost?.toFixed(2) || '0.00'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 p-2">
                            <Clock className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Avg Duration</p>
                            <p className="text-xl font-bold">
                                {statsData?.avg_duration_ms
                                    ? (statsData.avg_duration_ms >= 1000
                                        ? `${(statsData.avg_duration_ms / 1000).toFixed(1)}s`
                                        : `${Math.round(statsData.avg_duration_ms)}ms`)
                                    : '-'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user, model..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-36"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-36"
                    />
                </div>
                <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" /> Export
                </Button>
            </div>

            {/* Usage Table */}
            <DataTable
                columns={columns}
                data={logsData?.items || []}
                loading={isLoading}
                pagination={{
                    page,
                    pageSize,
                    total: logsData?.total || 0
                }}
                onPageChange={setPage}
            />
        </div>
    )
}
