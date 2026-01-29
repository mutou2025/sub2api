
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminAPI } from "@/api/admin"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { PromoCode, PromoCodeUsage } from "@/types/admin"
import { format } from "date-fns"
import {
    Plus,
    Search,
    Loader2,
    Copy,
    Eye,
    Trash2,
    Edit,
    Link as LinkIcon
} from "lucide-react"

export default function PromoCodes() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [search, setSearch] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
    const [viewingUsagesId, setViewingUsagesId] = useState<number | null>(null)

    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['admin-promo-codes', page, pageSize, search],
        queryFn: () => adminAPI.promo.list(page, pageSize, {
            search: search || undefined
        })
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminAPI.promo.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] })
            toast({ title: "Promo code deleted" })
        },
        onError: (error: any) => {
            toast({
                title: "Error deleting promo code",
                description: error.response?.data?.detail || "Something went wrong",
                variant: "destructive"
            })
        }
    })

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text)
        toast({ title: message })
    }

    const columns: ColumnDef<PromoCode>[] = [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">{row.original.code}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(row.original.code, "Code copied")}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            )
        },
        {
            accessorKey: "bonus_amount",
            header: "Bonus",
            cell: ({ row }) => <div className="font-medium">${row.original.bonus_amount.toFixed(2)}</div>
        },
        {
            header: "Usage",
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.used_count} / {row.original.max_uses === 0 ? '∞' : row.original.max_uses}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const isExpired = row.original.expires_at && new Date(row.original.expires_at) < new Date()
                const isMaxUsed = row.original.max_uses > 0 && row.original.used_count >= row.original.max_uses

                let variant: "default" | "secondary" | "destructive" | "outline" = "default"
                let label = row.original.status

                if (row.original.status === 'disabled') {
                    variant = "secondary"
                } else if (isExpired) {
                    variant = "destructive"
                    label = "expired"
                } else if (isMaxUsed) {
                    variant = "outline"
                    label = "max used"
                }

                return <Badge variant={variant}>{label}</Badge>
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
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        const link = `${window.location.origin}/register?promo=${row.original.code}`
                        copyToClipboard(link, "Register link copied")
                    }}>
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingUsagesId(row.original.id)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCode(row.original)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        if (confirm("Delete this promo code?")) {
                            deleteMutation.mutate(row.original.id)
                        }
                    }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Promo Codes</h2>
                    <p className="text-muted-foreground">Manage promotional codes and track usage.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Code
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search codes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
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

            <CreatePromoModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] })}
            />

            {editingCode && (
                <EditPromoModal
                    open={!!editingCode}
                    code={editingCode}
                    onOpenChange={(open) => !open && setEditingCode(null)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] })}
                />
            )}

            {viewingUsagesId && (
                <PromoUsagesModal
                    open={!!viewingUsagesId}
                    codeId={viewingUsagesId}
                    onOpenChange={(open) => !open && setViewingUsagesId(null)}
                />
            )}
        </div>
    )
}

function CreatePromoModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [code, setCode] = useState("")
    const [bonusAmount, setBonusAmount] = useState(1)
    const [maxUses, setMaxUses] = useState(0)
    const [expiresAt, setExpiresAt] = useState("")
    const [notes, setNotes] = useState("")

    const createMutation = useMutation({
        mutationFn: (data: any) => adminAPI.promo.create(data),
        onSuccess: () => {
            onOpenChange(false)
            onSuccess()
            toast({ title: "Promo code created" })
            setCode("")
            setBonusAmount(1)
        },
        onError: (error: any) => {
            toast({
                title: "Failed to create",
                description: error.response?.data?.detail || "Unknown error",
                variant: "destructive"
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate({
            code: code || undefined,
            bonus_amount: bonusAmount,
            max_uses: maxUses,
            expires_at: expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : undefined,
            notes: notes || undefined
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Promo Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code (Optional - Auto generated if empty)</Label>
                        <Input id="code" value={code} onChange={e => setCode(e.target.value)} className="font-mono uppercase" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bonus">Bonus Amount ($)</Label>
                        <Input id="bonus" type="number" step="0.01" min="0" value={bonusAmount} onChange={e => setBonusAmount(parseFloat(e.target.value))} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="maxUses">Max Uses (0 for unlimited)</Label>
                        <Input id="maxUses" type="number" min="0" value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value))} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                        <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditPromoModal({ open, onOpenChange, onSuccess, code }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void, code: PromoCode }) {
    const [formCode, setFormCode] = useState(code.code)
    const [bonusAmount, setBonusAmount] = useState(code.bonus_amount)
    const [maxUses, setMaxUses] = useState(code.max_uses)
    const [status, setStatus] = useState(code.status)
    const [notes, setNotes] = useState(code.notes || "")
    const [expiresAt, setExpiresAt] = useState(code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : "")

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminAPI.promo.update(code.id, data),
        onSuccess: () => {
            onOpenChange(false)
            onSuccess()
            toast({ title: "Promo code updated" })
        },
        onError: (error: any) => {
            toast({
                title: "Failed to update",
                description: error.response?.data?.detail || "Unknown error",
                variant: "destructive"
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            code: formCode,
            bonus_amount: bonusAmount,
            max_uses: maxUses,
            status,
            expires_at: expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0,
            notes: notes
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Promo Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-code">Code</Label>
                        <Input id="edit-code" value={formCode} onChange={e => setFormCode(e.target.value)} className="font-mono uppercase" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-bonus">Bonus Amount ($)</Label>
                        <Input id="edit-bonus" type="number" step="0.01" min="0" value={bonusAmount} onChange={e => setBonusAmount(parseFloat(e.target.value))} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-maxUses">Max Uses</Label>
                        <Input id="edit-maxUses" type="number" min="0" value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value))} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <select
                            id="edit-status"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={status}
                            onChange={e => setStatus(e.target.value as any)}
                        >
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-expiresAt">Expires At</Label>
                        <Input id="edit-expiresAt" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-notes">Notes</Label>
                        <Textarea id="edit-notes" value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            Update
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function PromoUsagesModal({ open, onOpenChange, codeId }: { open: boolean, onOpenChange: (open: boolean) => void, codeId: number }) {
    const [page, setPage] = useState(1)
    const pageSize = 10

    const { data, isLoading } = useQuery({
        queryKey: ['admin-promo-usages', codeId, page],
        queryFn: () => adminAPI.promo.getUsages(codeId, page, pageSize)
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Usage History</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : data?.items.length === 0 ? (
                        <div className="text-center text-muted-foreground p-4">No usages found</div>
                    ) : (
                        <div className="border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-2 text-left">User</th>
                                        <th className="p-2 text-left">Date</th>
                                        <th className="p-2 text-right">Bonus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.items.map((usage: PromoCodeUsage) => (
                                        <tr key={usage.id} className="border-t">
                                            <td className="p-2">
                                                <div className="font-medium">{usage.user?.email || `User #${usage.user_id}`}</div>
                                            </td>
                                            <td className="p-2 text-muted-foreground">
                                                {format(new Date(usage.used_at), 'MMM d, yyyy HH:mm')}
                                            </td>
                                            <td className="p-2 text-right text-green-600 font-medium">
                                                +${usage.bonus_amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {data && data.total > pageSize && (
                        <div className="flex justify-between items-center text-sm">
                            <div>Page {page} of {Math.ceil(data.total / pageSize)}</div>
                            <div className="space-x-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                <Button variant="outline" size="sm" disabled={page * pageSize >= data.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
