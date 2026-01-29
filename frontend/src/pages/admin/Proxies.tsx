import { useState, useEffect } from "react"
import { adminAPI } from "@/api/admin"
import type { Proxy } from "@/types/admin"
// import { useTableLoader } from "@/hooks/useTableLoader" // Proxies API usually doesn't have pagination params in this project?
// Based on api/admin.ts: list: (params?: any) => client.get<any, Proxy[]>('/admin/proxies', { params })
// It seems it returns an array directly, not { items, total }
// So we will fetch manually or adapt.

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCcw, Search, MoreHorizontal, Edit, Trash, Play, Globe } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export default function Proxies() {
    const [proxies, setProxies] = useState<Proxy[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        setLoading(true)
        try {
            const res = await adminAPI.proxies.getAll() // Using getAll for client-side filtering or list if needed
            setProxies(res)
        } catch (err) {
            toast({ title: "Failed to load proxies", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const filteredProxies = proxies.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.host.includes(search)
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }: { row: Proxy }) => (
                <div className="font-medium">{row.name}</div>
            )
        },
        {
            header: "Protocol",
            accessorKey: "protocol",
            cell: ({ row }: { row: Proxy }) => (
                <Badge variant="outline" className="uppercase">{row.protocol}</Badge>
            )
        },
        {
            header: "Address",
            cell: ({ row }: { row: Proxy }) => (
                <div className="text-sm font-mono text-muted-foreground">
                    {row.host}:{row.port}
                </div>
            )
        },
        {
            header: "Location",
            accessorKey: "country_code",
            cell: ({ row }: { row: Proxy }) => row.country_code ? (
                <div className="flex items-center gap-2">
                    <span className="text-lg">{getFlagEmoji(row.country_code)}</span>
                    <span className="text-sm text-muted-foreground">{row.country_code}</span>
                </div>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Latency",
            accessorKey: "latency_ms",
            cell: ({ row }: { row: Proxy }) => {
                if (row.latency_status === 'failed') return <Badge variant="destructive">Failed</Badge>
                if (!row.latency_ms) return <span className="text-muted-foreground">-</span>

                let color = "bg-green-100 text-green-800"
                if (row.latency_ms > 500) color = "bg-yellow-100 text-yellow-800"
                if (row.latency_ms > 1000) color = "bg-red-100 text-red-800"

                return <Badge className={`${color} border-0`} variant="outline">{row.latency_ms}ms</Badge>
            }
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }: { row: Proxy }) => (
                <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            cell: ({ row }: { row: Proxy }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(row)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTest(row)}>
                            <Play className="mr-2 h-4 w-4" /> Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const getFlagEmoji = (countryCode: string) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    const handleEdit = (proxy: Proxy) => {
        // TODO: Implement edit modal
        console.log("Edit", proxy)
    }

    const handleDelete = async (proxy: Proxy) => {
        if (!confirm(`Are you sure you want to delete ${proxy.name}?`)) return
        try {
            await adminAPI.proxies.delete(proxy.id)
            toast({ title: "Proxy deleted" })
            load()
        } catch (err) {
            toast({ title: "Failed to delete proxy", variant: "destructive" })
        }
    }

    const handleTest = async (proxy: Proxy) => {
        try {
            toast({ title: "Testing connection..." })
            await adminAPI.proxies.test(proxy.id)
            toast({ title: "Test initiated" })
            // The test is async on backend usually, might need reload or websocket
            setTimeout(load, 2000)
        } catch (err) {
            toast({ title: "Failed to initiate test", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Proxies</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Proxy
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search proxies..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => load()}>
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="rounded-md border">
                {/* Using a simple table since we don't have server-side pagination for proxies yet */}
                <DataTable
                    columns={columns}
                    data={filteredProxies}
                    loading={loading}
                    pagination={{ page: 1, pageSize: 100, total: filteredProxies.length }} // Client-side pagination placeholder
                />
            </div>
        </div>
    )
}
