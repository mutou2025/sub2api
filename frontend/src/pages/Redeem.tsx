import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { redeemAPI, authAPI } from "@/api"
import type { RedeemHistoryItem, RedeemResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Gift, CheckCircle, AlertCircle, Info, Clock, DollarSign, Zap, Badge } from "lucide-react"

export default function Redeem() {
    const { user, refreshUser } = useAuthStore()
    const [code, setCode] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<RedeemResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [history, setHistory] = useState<RedeemHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [contactInfo, setContactInfo] = useState("")

    useEffect(() => {
        loadHistory()
        loadContactInfo()
    }, [])

    const loadHistory = async () => {
        setLoadingHistory(true)
        try {
            const res = await redeemAPI.getHistory()
            setHistory(res)
        } catch (err) {
            console.error("Failed to load history", err)
        } finally {
            setLoadingHistory(false)
        }
    }

    const loadContactInfo = async () => {
        try {
            const settings = await authAPI.getPublicSettings()
            setContactInfo(settings.contact_info || "")
        } catch (err) {
            console.error("Failed to load contact info", err)
        }
    }

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setSubmitting(true)
        setError(null)
        setResult(null)

        try {
            const res = await redeemAPI.redeem(code.trim())
            setResult(res)
            setCode("")
            await refreshUser() // Refresh user balance
            loadHistory() // Refresh history
        } catch (err: any) {
            console.error("Redeem failed", err)
            setError(err.response?.data?.detail || "Failed to redeem code")
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (date: string) => new Date(date).toLocaleString()

    const formatHistoryValue = (item: RedeemHistoryItem) => {
        if (item.type === 'balance' || item.type === 'admin_balance') {
            const sign = item.value >= 0 ? '+' : ''
            return `${sign}$${item.value.toFixed(2)}`
        } else if (item.type === 'subscription') {
            const days = item.validity_days || Math.round(item.value)
            const groupName = item.group?.name || ''
            return groupName ? `${days} Days - ${groupName}` : `${days} Days`
        } else {
            const sign = item.value >= 0 ? '+' : ''
            return `${sign}${item.value} Reqs`
        }
    }

    const getIcon = (type: string) => {
        if (type.includes('balance')) return <DollarSign className="h-4 w-4" />
        if (type === 'subscription') return <Badge className="h-4 w-4" />
        return <Zap className="h-4 w-4" />
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Balance Card */}
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 text-center shadow-lg">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <CreditCard className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium opacity-90">Current Balance</p>
                <p className="mt-2 text-4xl font-bold">${user?.balance?.toFixed(2) || '0.00'}</p>
                <p className="mt-2 text-sm opacity-90">Concurrency: {user?.concurrency || 0} requests</p>
            </div>

            {/* Redeem Form */}
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Redeem Code</label>
                            <div className="relative">
                                <Gift className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    placeholder="Enter your redemption code"
                                    className="pl-10"
                                    disabled={submitting}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Input the redemption code to add balance or services.</p>
                        </div>
                        <Button type="submit" className="w-full" disabled={!code.trim() || submitting}>
                            {submitting ? 'Redeeming...' : 'Redeem Code'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Success Message */}
            {result && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-medium text-green-900 dark:text-green-300">Redeem Successful</h3>
                            <p className="text-sm text-green-700 dark:text-green-400">{result.message}</p>
                            <div className="text-sm font-medium text-green-800 dark:text-green-300 pt-1">
                                {result.type === 'balance' && `Added: $${result.value.toFixed(2)}`}
                                {result.type === 'concurrency' && `Added: ${result.value} requests`}
                                {result.type === 'subscription' && (
                                    <span>
                                        Subscription Assigned
                                        {result.group_name && ` - ${result.group_name}`}
                                        {result.validity_days && ` (${result.validity_days} days)`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                        <div className="space-y-1">
                            <h3 className="font-medium text-red-900 dark:text-red-300">Redeem Failed</h3>
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <div className="text-sm space-y-2">
                        <h3 className="font-medium">About Redemption Codes</h3>
                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                            <li>Codes can be used to top up balance or increase concurrency limits.</li>
                            <li>Some codes may grant specific subscription plans.</li>
                            <li>
                                Please contact support if you encounter issues.
                                {contactInfo && <span className="ml-1 font-medium bg-background px-1 rounded">{contactInfo}</span>}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                {loadingHistory ? (
                    <div className="flex justify-center p-8"><Clock className="animate-spin h-6 w-6 text-muted-foreground" /></div>
                ) : history.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                        <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No redemption history found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map(item => (
                            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full 
                            ${item.type.includes('balance')
                                            ? item.value >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {item.type === 'subscription' ? 'Subscription Assigned' :
                                                item.type.includes('admin') ? 'Admin Adjustment' : 'Code Redeemed'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.used_at)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold text-sm 
                            ${item.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatHistoryValue(item)}
                                    </p>
                                    <p className="text-xs font-mono text-muted-foreground">{item.code.slice(0, 8)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
