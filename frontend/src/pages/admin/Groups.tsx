import { useState, useEffect } from "react"
import { adminAPI } from "@/api/admin"
import type { AdminGroup } from "@/types/admin"

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCcw, Search, MoreHorizontal, Edit, Trash, Box } from "lucide-react"
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

export default function Groups() {
    const [groups, setGroups] = useState<AdminGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [platformFilter, setPlatformFilter] = useState("all")

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        setLoading(true)
        try {
            const res = await adminAPI.groups.getAll()
            setGroups(res)
        } catch (err) {
            toast({ title: "Failed to load groups", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
        const matchesPlatform = platformFilter === 'all' || g.platform === platformFilter
        return matchesSearch && matchesPlatform
    })

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }: { row: AdminGroup }) => (
                <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.name}</span>
                </div>
            )
        },
        {
            header: "Platform",
            accessorKey: "platform",
            cell: ({ row }: { row: AdminGroup }) => (
                <Badge variant="secondary">{row.platform}</Badge>
            )
        },
        {
            header: "Type",
            accessorKey: "subscription_type",
            cell: ({ row }: { row: AdminGroup }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">
                        {row.subscription_type}
                    </Badge>
                    {row.subscription_type === 'subscription' && (
                        <span className="text-xs text-muted-foreground">
                            Limit: {row.daily_limit_usd ? `$${row.daily_limit_usd}/d` : 'No Limit'}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "Multiplier",
            accessorKey: "rate_multiplier",
            cell: ({ row }: { row: AdminGroup }) => (
                <span className="font-mono">{row.rate_multiplier}x</span>
            )
        },
        {
            header: "Exclusive",
            accessorKey: "is_exclusive",
            cell: ({ row }: { row: AdminGroup }) => (
                <Badge variant={row.is_exclusive ? "default" : "secondary"}>
                    {row.is_exclusive ? "Exclusive" : "Public"}
                </Badge>
            )
        },
        {
            header: "Accounts",
            accessorKey: "account_count",
            cell: ({ row }: { row: AdminGroup }) => (
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    {row.account_count || 0}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }: { row: AdminGroup }) => (
                <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            cell: ({ row }: { row: AdminGroup }) => (
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const handleEdit = (group: AdminGroup) => {
        // TODO: Implement edit modal
        console.log("Edit", group)
    }

    const handleDelete = async (group: AdminGroup) => {
        if (!confirm(`Are you sure you want to delete ${group.name}?`)) return
        try {
            await adminAPI.groups.delete(group.id)
            toast({ title: "Group deleted" })
            load()
        } catch (err) {
            toast({ title: "Failed to delete group", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Group
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search groups..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={platformFilter}
                    onValueChange={setPlatformFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => load()}>
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="rounded-md border">
                <DataTable
                    columns={columns}
                    data={filteredGroups}
                    loading={loading}
                    pagination={{ page: 1, pageSize: 100, total: filteredGroups.length }}
                />
            </div>
        </div>
    )
}
