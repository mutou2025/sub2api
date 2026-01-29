
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminAPI } from "@/api/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, AlertTriangle } from "lucide-react"

interface SettingsForm {
    registration_enabled: boolean
    email_verify_enabled: boolean
    promo_code_enabled: boolean
    password_reset_enabled: boolean
    totp_enabled: boolean
    turnstile_enabled: boolean
    turnstile_site_key: string
    turnstile_secret_key: string
    default_balance: number
    default_concurrency: number
    site_name: string
    site_subtitle: string
    api_base_url: string
    contact_info: string
    doc_url: string
}

export default function Settings() {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<SettingsForm>({
        registration_enabled: true,
        email_verify_enabled: false,
        promo_code_enabled: false,
        password_reset_enabled: false,
        totp_enabled: false,
        turnstile_enabled: false,
        turnstile_site_key: '',
        turnstile_secret_key: '',
        default_balance: 0,
        default_concurrency: 1,
        site_name: '',
        site_subtitle: '',
        api_base_url: '',
        contact_info: '',
        doc_url: ''
    })

    const { isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            // Assuming there's a settings endpoint
            const data = await (adminAPI as any).settings?.get?.()
            if (data) setForm(prev => ({ ...prev, ...data }))
            return data
        },
        enabled: false // Disable if no API exists yet
    })

    const saveMutation = useMutation({
        mutationFn: (data: SettingsForm) => (adminAPI as any).settings?.update?.(data) || Promise.resolve(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
            toast({ title: "Settings saved" })
        },
        onError: (error: any) => {
            toast({
                title: "Failed to save settings",
                description: error.response?.data?.detail || "Unknown error",
                variant: "destructive"
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        saveMutation.mutate(form)
    }

    const updateField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage system configuration and preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registration</CardTitle>
                        <CardDescription>Configure user registration options.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Enable Registration</Label>
                                <p className="text-sm text-muted-foreground">Allow new users to register.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.registration_enabled}
                                onChange={e => updateField('registration_enabled', e.target.checked)}
                                className="h-4 w-4"
                            />
                        </div>
                        <div className="flex items-center justify-between border-t pt-4">
                            <div>
                                <Label>Email Verification</Label>
                                <p className="text-sm text-muted-foreground">Require email verification for new accounts.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.email_verify_enabled}
                                onChange={e => updateField('email_verify_enabled', e.target.checked)}
                                className="h-4 w-4"
                            />
                        </div>
                        <div className="flex items-center justify-between border-t pt-4">
                            <div>
                                <Label>Promo Code</Label>
                                <p className="text-sm text-muted-foreground">Allow promo code redemption during registration.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.promo_code_enabled}
                                onChange={e => updateField('promo_code_enabled', e.target.checked)}
                                className="h-4 w-4"
                            />
                        </div>
                        <div className="flex items-center justify-between border-t pt-4">
                            <div>
                                <Label>Two-Factor Authentication (TOTP)</Label>
                                <p className="text-sm text-muted-foreground">Enable TOTP-based 2FA for users.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.totp_enabled}
                                onChange={e => updateField('totp_enabled', e.target.checked)}
                                className="h-4 w-4"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Default Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Defaults</CardTitle>
                        <CardDescription>Default values for new users.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="default_balance">Default Balance ($)</Label>
                            <Input
                                id="default_balance"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.default_balance}
                                onChange={e => updateField('default_balance', parseFloat(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">Initial balance for new users.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="default_concurrency">Default Concurrency</Label>
                            <Input
                                id="default_concurrency"
                                type="number"
                                min="1"
                                value={form.default_concurrency}
                                onChange={e => updateField('default_concurrency', parseInt(e.target.value) || 1)}
                            />
                            <p className="text-xs text-muted-foreground">Max concurrent requests for new users.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Site Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Site</CardTitle>
                        <CardDescription>Public-facing site configuration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="site_name">Site Name</Label>
                                <Input
                                    id="site_name"
                                    value={form.site_name}
                                    onChange={e => updateField('site_name', e.target.value)}
                                    placeholder="Sub2API"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="site_subtitle">Site Subtitle</Label>
                                <Input
                                    id="site_subtitle"
                                    value={form.site_subtitle}
                                    onChange={e => updateField('site_subtitle', e.target.value)}
                                    placeholder="Your API Gateway"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_base_url">API Base URL</Label>
                            <Input
                                id="api_base_url"
                                value={form.api_base_url}
                                onChange={e => updateField('api_base_url', e.target.value)}
                                placeholder="https://api.example.com"
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">Base URL for API endpoints shown to users.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_info">Contact Info</Label>
                            <Input
                                id="contact_info"
                                value={form.contact_info}
                                onChange={e => updateField('contact_info', e.target.value)}
                                placeholder="support@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doc_url">Documentation URL</Label>
                            <Input
                                id="doc_url"
                                type="url"
                                value={form.doc_url}
                                onChange={e => updateField('doc_url', e.target.value)}
                                placeholder="https://docs.example.com"
                                className="font-mono text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Cloudflare Turnstile */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cloudflare Turnstile</CardTitle>
                        <CardDescription>Bot protection for login and registration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Enable Turnstile</Label>
                                <p className="text-sm text-muted-foreground">Protect forms with Cloudflare Turnstile.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.turnstile_enabled}
                                onChange={e => updateField('turnstile_enabled', e.target.checked)}
                                className="h-4 w-4"
                            />
                        </div>
                        {form.turnstile_enabled && (
                            <div className="border-t pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="turnstile_site_key">Site Key</Label>
                                    <Input
                                        id="turnstile_site_key"
                                        value={form.turnstile_site_key}
                                        onChange={e => updateField('turnstile_site_key', e.target.value)}
                                        placeholder="0x4AAAAAAA..."
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="turnstile_secret_key">Secret Key</Label>
                                    <Input
                                        id="turnstile_secret_key"
                                        type="password"
                                        value={form.turnstile_secret_key}
                                        onChange={e => updateField('turnstile_secret_key', e.target.value)}
                                        placeholder="0x4AAAAAAA..."
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Warning */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        Some settings may require a server restart to take effect. Make sure to verify changes in a staging environment first.
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    )
}
