
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminAPI } from "@/api/admin"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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
import { AdminUser } from "@/types/admin"
import { format } from "date-fns"
import {
    MoreHorizontal,
    Plus,
    Search,
    Loader2,
    Shield,
    Ban,
    CheckCircle,
    User as UserIcon,
    DollarSign,
    Key
} from "lucide-react"

export default function Users() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // De-bounce search
    const [debouncedSearch, setDebouncedSearch] = useState("")
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, pageSize, debouncedSearch, roleFilter, statusFilter],
        queryFn: () => adminAPI.users.list(page, pageSize, {
            search: debouncedSearch || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined
        })
    })

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
            adminAPI.users.toggleStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast({ title: "Status updated" })
        },
        onError: (error: any) => {
            toast({
                title: "Error updating status",
                description: error.response?.data?.detail || "Something went wrong",
                variant: "destructive"
            })
        }
    })

    const columns: ColumnDef<AdminUser>[] = [
        {
            accessorKey: "email",
            header: "User",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium">{row.original.email}</div>
                        {row.original.username && (
                            <div className="text-xs text-muted-foreground">@{row.original.username}</div>
                        )}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
                    {row.original.role}
                </Badge>
            )
        },
        {
            accessorKey: "balance",
            header: "Balance",
            cell: ({ row }) => (
                <div className="font-medium">
                    ${(row.original.balance || 0).toFixed(2)}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'outline' : 'destructive'} className={row.original.status === 'active' ? 'border-green-500 text-green-500' : ''}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "created_at",
            header: "Joined",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.original.created_at), 'MMM d, yyyy')}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Key className="mr-2 h-4 w-4" /> API Keys
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <DollarSign className="mr-2 h-4 w-4" /> Balance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'active' ? (
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => toggleStatusMutation.mutate({ id: user.id, status: 'disabled' })}
                                >
                                    <Ban className="mr-2 h-4 w-4" /> Disable User
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="text-green-600 focus:text-green-600"
                                    onClick={() => toggleStatusMutation.mutate({ id: user.id, status: 'active' })}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Activate User
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage users, roles, and balances.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create User
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {/* Add Role/Status filters here if needed */}
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

            <UserCreateModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
            />
        </div>
    )
}

function UserCreateModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
    const [role, setRole] = useState("user")

    const createMutation = useMutation({
        mutationFn: (data: any) => adminAPI.users.create(data),
        onSuccess: () => {
            onOpenChange(false)
            onSuccess()
            toast({ title: "User created successfully" })
            setEmail("")
            setPassword("")
            setUsername("")
        },
        onError: (error: any) => {
            toast({
                title: "Failed to create user",
                description: error.response?.data?.detail || "Unknown error",
                variant: "destructive"
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate({ email, password, username, role })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>Add a new user to the system.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username (Optional)</Label>
                        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
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
