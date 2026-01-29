import { useState, useEffect } from "react"
import { keysAPI, userGroupsAPI } from "@/api"
import type { ApiKey, Group, CreateApiKeyRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, RefreshCw, Trash2, Copy, Check, Shield } from "lucide-react"
import { cn } from "@/utils/cn"

export default function Keys() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<CreateApiKeyRequest>({
        name: "",
        group_id: 0,
        status: "active",
        use_custom_key: false,
        custom_key: "",
        enable_ip_restriction: false,
        ip_whitelist: [],
        ip_blacklist: []
    })

    // Helper for IP strings
    const [ipWhitelistStr, setIpWhitelistStr] = useState("")
    const [ipBlacklistStr, setIpBlacklistStr] = useState("")

    useEffect(() => {
        loadKeys()
        loadGroups()
    }, [currentPage])

    const loadKeys = async () => {
        setLoading(true)
        try {
            const res = await keysAPI.list(currentPage, 10)
            setKeys(res.items)
        } catch (err) {
            console.error("Failed to load keys", err)
        } finally {
            setLoading(false)
        }
    }

    const loadGroups = async () => {
        try {
            const res = await userGroupsAPI.getAvailable()
            setGroups(res)
        } catch (err) {
            console.error("Failed to load groups", err)
        }
    }

    const handleCopy = async (text: string, id: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 1000)
        } catch (err) {
            console.error("Failed to copy", err)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this API key?")) return
        try {
            await keysAPI.delete(id)
            loadKeys()
        } catch (err) {
            console.error("Failed to delete key", err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await keysAPI.create({
                ...formData,
                ip_whitelist: formData.enable_ip_restriction ? ipWhitelistStr.split('\n').filter(Boolean) : [],
                ip_blacklist: formData.enable_ip_restriction ? ipBlacklistStr.split('\n').filter(Boolean) : []
            })
            setShowCreateModal(false)
            loadKeys()
            // Reset form
            setFormData({
                name: "",
                group_id: 0,
                status: "active",
                use_custom_key: false,
                custom_key: "",
                enable_ip_restriction: false
            })
            setIpWhitelistStr("")
            setIpBlacklistStr("")
        } catch (err) {
            console.error("Failed to create key", err)
            alert("Failed to create key")
        } finally {
            setSubmitting(false)
        }
    }

    const maskKey = (key: string) => {
        if (key.length <= 12) return key
        return `${key.slice(0, 8)}...${key.slice(-4)}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadKeys} disabled={loading}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Key
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No API keys found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            keys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {key.name}
                                            {(key.ip_whitelist?.length > 0 || key.ip_blacklist?.length > 0) && (
                                                <Shield className="h-3 w-3 text-blue-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-mono text-xs bg-muted/50 p-1 rounded w-fit">
                                            {maskKey(key.key)}
                                            <button
                                                onClick={() => handleCopy(key.key, key.id)}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {copiedId === key.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {key.group?.name || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                            key.status === 'active' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {key.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(key.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={keys.length < 10 || loading}
                >
                    Next
                </Button>
            </div>

            <Dialog open={showCreateModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My API Key"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Group</label>
                            <Select
                                value={formData.group_id}
                                onChange={e => setFormData({ ...formData, group_id: Number(e.target.value) })}
                                required
                            >
                                <option value={0} disabled>Select a group</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.subscription_type === 'subscription' ? 'Sub' : 'Usage'})</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="customKey"
                                checked={formData.use_custom_key}
                                onChange={e => setFormData({ ...formData, use_custom_key: e.target.checked })}
                            />
                            <label htmlFor="customKey" className="text-sm">Use Custom Key</label>
                        </div>

                        {formData.use_custom_key && (
                            <div className="space-y-2">
                                <Input
                                    value={formData.custom_key}
                                    onChange={e => setFormData({ ...formData, custom_key: e.target.value })}
                                    placeholder="sk-..."
                                    className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground">Min 16 chars, alphanumeric only</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="ipRestriction"
                                checked={formData.enable_ip_restriction}
                                onChange={e => setFormData({ ...formData, enable_ip_restriction: e.target.checked })}
                            />
                            <label htmlFor="ipRestriction" className="text-sm">Enable IP Restriction</label>
                        </div>

                        {formData.enable_ip_restriction && (
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Whitelist IPs (one per line)"
                                    value={ipWhitelistStr}
                                    onChange={e => setIpWhitelistStr(e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <Textarea
                                    placeholder="Blacklist IPs (one per line)"
                                    value={ipBlacklistStr}
                                    onChange={e => setIpBlacklistStr(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
