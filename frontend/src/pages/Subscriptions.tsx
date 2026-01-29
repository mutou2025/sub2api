import { useState, useEffect } from "react"
import { subscriptionsAPI } from "@/api"
import type { UserSubscription } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, RotateCw, AlertTriangle } from "lucide-react"

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
    const [loading, setLoading] = useState(false)
    const [purchaseUrl, setPurchaseUrl] = useState<string | null>(null)

    useEffect(() => {
        loadSubscriptions()
        loadPurchaseSettings()
    }, [])

    const loadSubscriptions = async () => {
        setLoading(true)
        try {
            const res = await subscriptionsAPI.getMySubscriptions()
            setSubscriptions(res)
        } catch (err) {
            console.error("Failed to load subscriptions", err)
        } finally {
            setLoading(false)
        }
    }

    const loadPurchaseSettings = async () => {
        // This would typically come from settings API or similar
        // For now we might need to fetch public settings if the URL is dynamic
        // Based on Vue code: const purchaseUrl = settings.value?.purchase_url
        // We added getPublicSettings to authAPI, let's use it if we can, or hardcode/env if needed.
        // But wait, allow me to check if I can import authAPI here.
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
            case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
            case 'canceled': return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                <Button onClick={loadSubscriptions} variant="outline" size="icon">
                    <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions.length === 0 && !loading ? (
                    <Card className="col-span-full py-12 text-center">
                        <CardContent>
                            <p className="text-muted-foreground mb-4">You do not have any active subscriptions.</p>
                            {/* We could link to purchase page here */}
                            <Button asChild>
                                <a href="/purchase" target="_blank" rel="noopener noreferrer">Purchase Subscription</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    subscriptions.map(sub => (
                        <Card key={sub.id} className="relative overflow-hidden">
                            {sub.status === 'active' && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Subscription #{sub.id}
                                </CardTitle>
                                <CardDescription>
                                    Status: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>{sub.status}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Started:</span>
                                    <span>{formatDate(sub.starts_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Expires:</span>
                                    <span>{formatDate(sub.expires_at)}</span>
                                </div>
                                {/* Group info if available via some join or extra fetch */}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
