import { useState, useEffect } from "react"
import { usageAPI, keysAPI } from "@/api"
import type { UsageLog, UsageStats, ApiKey, UsageQueryParams } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileText, Box, DollarSign, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/utils/cn"

export default function Usage() {
    const [logs, setLogs] = useState<UsageLog[]>([])
    const [stats, setStats] = useState<UsageStats | null>(null)
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(false)

    const [filters, setFilters] = useState<UsageQueryParams>({
        page: 1,
        page_size: 20,
        api_key_id: undefined
    })

    useEffect(() => {
        loadData()
        loadApiKeys()
    }, [filters.page, filters.api_key_id])

    const loadData = async () => {
        setLoading(true)
        try {
            const [logsRes, statsRes] = await Promise.all([
                usageAPI.query(filters),
                usageAPI.getStats(filters)
            ])
            setLogs(logsRes.items)
            setStats(statsRes)
        } catch (err) {
            console.error("Failed to load usage data", err)
        } finally {
            setLoading(false)
        }
    }

    const loadApiKeys = async () => {
        try {
            const res = await keysAPI.list(1, 100)
            setApiKeys(res.items)
        } catch (err) {
            console.error("Failed to load API keys", err)
        }
    }

    const formatTokens = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(2)}K`
        return val.toString()
    }

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`
        return `${(ms / 1000).toFixed(2)}s`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
                <div className="flex gap-2">
                    <Select
                        value={filters.api_key_id || 0}
                        onChange={(e) => setFilters({ ...filters, api_key_id: Number(e.target.value) || undefined, page: 1 })}
                        className="w-[200px]"
                    >
                        <option value={0}>All API Keys</option>
                        {apiKeys.map(k => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                    </Select>
                    <Button variant="outline" size="icon" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <FileText className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_requests.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                            <Box className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatTokens(stats.total_tokens)}</div>
                            <p className="text-xs text-muted-foreground">
                                In: {formatTokens(stats.total_input_tokens)} / Out: {formatTokens(stats.total_output_tokens)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.total_actual_cost.toFixed(4)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                            <Clock className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(stats.average_duration_ms)}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>API Key</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Tokens</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead className="text-right">Duration</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No usage logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{log.api_key?.name || '-'}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.model}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                            log.stream ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {log.stream ? 'Stream' : 'Sync'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <div>Total: {log.total_tokens}</div>
                                        <div className="text-muted-foreground">
                                            I: {log.input_tokens} / O: {log.output_tokens}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-green-600 dark:text-green-400">
                                        ${log.actual_cost.toFixed(6)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {formatDuration(log.duration_ms)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
