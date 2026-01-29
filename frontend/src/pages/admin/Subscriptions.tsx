
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminAPI } from "@/api/admin"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ColumnDef } from "@tanstack/react-table"
import { UserSubscription } from "@/types"
import { format } from "date-fns"
import {
    Plus,
    Search,
    Loader2,
    Calendar,
    Ban,
    RefreshCw
} from "lucide-react"

export default function Subscriptions() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [isAssignOpen, setIsAssignOpen] = useState(false)
    const [extendId, setExtendId] = useState<number | null>(null)

    // Filters (TODO: Add status and group filters)
    const [search, setSearch] = useState("")

    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['admin-subscriptions', page, pageSize, search],
        queryFn: () => adminAPI.subscriptions.list(page, pageSize, {
            search: search || undefined
        })
    })

    const revokeMutation = useMutation({
        mutationFn: (id: number) => adminAPI.subscriptions.revoke(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })
            toast({ title: "Subscription revoked" })
        },
        onError: (error: any) => {
            toast({
                title: "Error revoking subscription",
                description: error.response?.data?.detail || "Something went wrong",
                variant: "destructive"
            })
        }
    })

    const columns: ColumnDef<UserSubscription>[] = [
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => {
                const user = row.original.user
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{user?.email}</span>
                        {user?.username && <span className="text-xs text-muted-foreground">@{user.username}</span>}
                    </div>
                )
            }
        },
        {
            accessorKey: "group",
            header: "Group",
            cell: ({ row }) => (
                <Badge variant="outline" className="whitespace-nowrap">
                    {row.original.group?.name}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            header: "Usage",
            cell: ({ row }) => {
                // TODO: Add visual progress bars like Vue version if needed
                const daily = row.original.daily_usage_usd
                const limit = row.original.group?.daily_limit_usd
                return (
                    <div className="text-xs">
                        {limit ? (
                            <div>Daily: ${daily?.toFixed(2)} / ${limit.toFixed(2)}</div>
                        ) : (
                            <div>Daily: ${daily?.toFixed(2)}</div>
                        )}
                        {/* Add weekly/monthly if needed */}
                    </div>
                )
            }
        },
        {
            accessorKey: "expires_at",
            header: "Expires",
            cell: ({ row }) => {
                if (!row.original.expires_at) return <span className="text-muted-foreground">Never</span>
                return format(new Date(row.original.expires_at), 'MMM d, yyyy')
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.status === 'active' && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExtendId(row.original.id)}
                            >
                                <Calendar className="h-4 w-4 mr-1" /> Adjust
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm("Are you sure you want to revoke this subscription?")) {
                                        revokeMutation.mutate(row.original.id)
                                    }
                                }}
                            >
                                <Ban className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
                    <p className="text-muted-foreground">Manage user subscriptions and quotas.</p>
                </div>
                <Button onClick={() => setIsAssignOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Assign Subscription
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data?.items || []}
                loading={isLoading}
                pagination={{
                    page,
                    pageSize,
                    total: data?.total || 0
                }}
                onPageChange={setPage}
            />

            <AssignSubscriptionModal
                open={isAssignOpen}
                onOpenChange={setIsAssignOpen}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })}
            />

            {extendId && (
                <ExtendSubscriptionModal
                    open={!!extendId}
                    subscriptionId={extendId}
                    onOpenChange={(open) => !open && setExtendId(null)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })}
                />
            )}
        </div>
    )
}

function AssignSubscriptionModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [userId, setUserId] = useState("")
    const [groupId, setGroupId] = useState("")
    const [days, setDays] = useState(30)

    // In a real app we would need a User Search and Group Select here
    // For now simple inputs
    const assignMutation = useMutation({
        mutationFn: (data: any) => adminAPI.subscriptions.assign(data),
        onSuccess: () => {
            onOpenChange(false)
            onSuccess()
            toast({ title: "Subscription assigned" })
            setUserId("")
            setGroupId("")
        },
        onError: (error: any) => {
            toast({
                title: "Assignment failed",
                description: error.response?.data?.detail || "Unknown error",
                variant: "destructive"
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        assignMutation.mutate({
            user_id: parseInt(userId),
            group_id: parseInt(groupId),
            validity_days: days
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Subscription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input id="userId" type="number" value={userId} onChange={e => setUserId(e.target.value)} required placeholder="Enter User ID" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="groupId">Group ID</Label>
                        <Input id="groupId" type="number" value={groupId} onChange={e => setGroupId(e.target.value)} required placeholder="Enter Group ID" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="days">Validity (Days)</Label>
                        <Input id="days" type="number" value={days} onChange={e => setDays(parseInt(e.target.value))} required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={assignMutation.isPending}>
                            {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ExtendSubscriptionModal({ open, onOpenChange, onSuccess, subscriptionId }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void, subscriptionId: number }) {
    const [days, setDays] = useState(0)

    const extendMutation = useMutation({
        mutationFn: (days: number) => adminAPI.subscriptions.extend(subscriptionId, days),
        onSuccess: () => {
            onOpenChange(false)
            onSuccess()
            toast({ title: "Subscription updated" })
        },
        onError: (error: any) => {
            toast({
                title: "Update failed",
                description: error.response?.data?.detail || "Unknown error",
                variant: "destructive"
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        extendMutation.mutate(days)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adjust Subscription</DialogTitle>
                    <DialogDescription>Add or remove days from this subscription.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="days">Days to Add (use negative to reduce)</Label>
                        <Input id="days" type="number" value={days} onChange={e => setDays(parseInt(e.target.value))} required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={extendMutation.isPending}>
                            {extendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
