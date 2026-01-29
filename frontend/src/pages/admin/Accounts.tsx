import { useState, useEffect } from "react"
import { adminAPI } from "@/api/admin"
import type { Account } from "@/types/admin"
import { useTableLoader } from "@/hooks/useTableLoader"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCcw, Search, MoreHorizontal, Edit, Trash, Play, ShieldAlert, Wifi } from "lucide-react"
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
import { formatDistanceToNow } from "date-fns"

export default function Accounts() {
    const [search, setSearch] = useState("")
    const {
        data,
        loading,
        pagination,
        load,
        setParams,
        params
    } = useTableLoader<Account>({
        fetchFn: adminAPI.accounts.list,
        initialParams: { platform: '', type: '', status: '', search: '' }
    })

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setParams(p => ({ ...p, search }))
        }, 500)
        return () => clearTimeout(timer)
    }, [search, setParams])

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }: { row: Account }) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    {row.notes && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{row.notes}</div>}
                </div>
            )
        },
        {
            header: "Platform",
            accessorKey: "platform",
            cell: ({ row }: { row: Account }) => (
                <div className="flex gap-2">
                    <Badge variant="outline">{row.platform}</Badge>
                    <Badge variant="secondary" className="text-xs">{row.type}</Badge>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }: { row: Account }) => {
                const colors = {
                    active: "bg-green-100 text-green-800 border-green-200",
                    inactive: "bg-gray-100 text-gray-800 border-gray-200",
                    error: "bg-red-100 text-red-800 border-red-200",
                    expired: "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
                return (
                    <Badge className={colors[row.status] || colors.inactive} variant="outline">
                        {row.status}
                    </Badge>
                )
            }
        },
        {
            header: "Schedulable",
            accessorKey: "schedulable",
            cell: ({ row }: { row: Account }) => (
                <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${row.schedulable ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">{row.schedulable ? 'Yes' : 'No'}</span>
                </div>
            )
        },
        {
            header: "Proxy",
            accessorKey: "proxy",
            cell: ({ row }: { row: Account }) => row.proxy ? (
                <div className="text-sm flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {row.proxy.name}
                </div>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Today Stats",
            cell: ({ row }: { row: Account }) => row.today_stats ? (
                <div className="text-xs space-y-0.5">
                    <div>Reqs: {row.today_stats.requests}</div>
                    <div>Cost: ${row.today_stats.cost.toFixed(4)}</div>
                </div>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Last Used",
            accessorKey: "last_used_at",
            cell: ({ row }: { row: Account }) => row.last_used_at ? (
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(row.last_used_at), { addSuffix: true })}
                </span>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Actions",
            cell: ({ row }: { row: Account }) => (
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
                        <DropdownMenuItem onClick={() => handleRefresh(row)}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Token
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleClearError(row)}>
                            <ShieldAlert className="mr-2 h-4 w-4" /> Clear Error
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

    const handleEdit = (account: Account) => {
        // TODO: Implement edit modal
        console.log("Edit", account)
    }

    const handleDelete = async (account: Account) => {
        if (!confirm(`Are you sure you want to delete ${account.name}?`)) return
        try {
            await adminAPI.accounts.delete(account.id)
            toast({ title: "Account deleted" })
            load()
        } catch (err) {
            toast({ title: "Failed to delete account", variant: "destructive" })
        }
    }

    const handleTest = async (account: Account) => {
        toast({ title: "Testing connection..." })
        // TODO: Implement test modal/action
    }

    const handleRefresh = async (account: Account) => {
        try {
            await adminAPI.accounts.refreshCredentials(account.id)
            toast({ title: "Credentials refreshed" })
            load()
        } catch (err) {
            toast({ title: "Failed to refresh credentials", variant: "destructive" })
        }
    }

    const handleClearError = async (account: Account) => {
        try {
            await adminAPI.accounts.clearError(account.id)
            toast({ title: "Error status cleared" })
            load()
        } catch (err) {
            toast({ title: "Failed to clear error", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Account
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search accounts..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={params.status}
                    onValueChange={(val) => setParams(p => ({ ...p, status: val === 'all' ? '' : val }))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => load()}>
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setParams(p => ({ ...p, page }))}
            />
        </div>
    )
}
