
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Settings,
    Database,
    Server,
    UserCheck,
    Check,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle
} from "lucide-react"

interface SetupFormData {
    database: {
        host: string
        port: number
        user: string
        password: string
        dbname: string
        sslmode: string
    }
    redis: {
        host: string
        port: number
        password: string
        db: number
    }
    admin: {
        email: string
        password: string
    }
}

const STEPS = [
    { id: 'database', title: 'Database', icon: Database },
    { id: 'redis', title: 'Redis', icon: Server },
    { id: 'admin', title: 'Admin', icon: UserCheck },
    { id: 'complete', title: 'Complete', icon: Check }
]

export default function SetupWizard() {
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [testingDb, setTestingDb] = useState(false)
    const [testingRedis, setTestingRedis] = useState(false)
    const [dbConnected, setDbConnected] = useState(false)
    const [redisConnected, setRedisConnected] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")

    const [formData, setFormData] = useState<SetupFormData>({
        database: {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: '',
            dbname: 'sub2api',
            sslmode: 'disable'
        },
        redis: {
            host: 'localhost',
            port: 6379,
            password: '',
            db: 0
        },
        admin: {
            email: '',
            password: ''
        }
    })

    const updateDatabase = (key: keyof typeof formData.database, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            database: { ...prev.database, [key]: value }
        }))
    }

    const updateRedis = (key: keyof typeof formData.redis, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            redis: { ...prev.redis, [key]: value }
        }))
    }

    const updateAdmin = (key: keyof typeof formData.admin, value: string) => {
        setFormData(prev => ({
            ...prev,
            admin: { ...prev.admin, [key]: value }
        }))
    }

    const testDatabase = async () => {
        setTestingDb(true)
        setError("")
        try {
            const res = await fetch('/setup/database/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData.database)
            })
            if (res.ok) {
                setDbConnected(true)
            } else {
                const data = await res.json()
                setError(data.detail || 'Database connection failed')
            }
        } catch (e) {
            setError('Connection test failed')
        } finally {
            setTestingDb(false)
        }
    }

    const testRedis = async () => {
        setTestingRedis(true)
        setError("")
        try {
            const res = await fetch('/setup/redis/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData.redis)
            })
            if (res.ok) {
                setRedisConnected(true)
            } else {
                const data = await res.json()
                setError(data.detail || 'Redis connection failed')
            }
        } catch (e) {
            setError('Connection test failed')
        } finally {
            setTestingRedis(false)
        }
    }

    const performInstall = async () => {
        setLoading(true)
        setError("")
        try {
            const serverPort = window.location.port
                ? parseInt(window.location.port)
                : (window.location.protocol === 'https:' ? 443 : 80)

            const res = await fetch('/setup/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    server: {
                        host: '0.0.0.0',
                        port: serverPort,
                        mode: 'release'
                    }
                })
            })
            if (res.ok) {
                setSuccess(true)
                // Wait for service restart then redirect
                setTimeout(() => {
                    window.location.href = '/login'
                }, 5000)
            } else {
                const data = await res.json()
                setError(data.detail || 'Installation failed')
            }
        } catch (e) {
            setError('Installation failed')
        } finally {
            setLoading(false)
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 0: return dbConnected
            case 1: return redisConnected
            case 2: return formData.admin.email && formData.admin.password.length >= 6 && formData.admin.password === confirmPassword
            default: return true
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted p-4">
            <div className="w-full max-w-2xl">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg mb-4">
                        <Settings className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold">Setup Wizard</h1>
                    <p className="text-muted-foreground mt-2">Configure your Sub2API instance</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${currentStep > index
                                ? 'bg-primary text-primary-foreground'
                                : currentStep === index
                                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                {currentStep > index ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${currentStep >= index ? '' : 'text-muted-foreground'}`}>
                                {step.title}
                            </span>
                            {index < STEPS.length - 1 && (
                                <div className={`mx-3 h-0.5 w-12 ${currentStep > index ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card>
                    <CardContent className="p-8">
                        {/* Step 1: Database */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold">Database Configuration</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Configure your PostgreSQL database connection</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Host</Label>
                                        <Input value={formData.database.host} onChange={e => updateDatabase('host', e.target.value)} placeholder="localhost" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Port</Label>
                                        <Input type="number" value={formData.database.port} onChange={e => updateDatabase('port', parseInt(e.target.value))} placeholder="5432" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Username</Label>
                                        <Input value={formData.database.user} onChange={e => updateDatabase('user', e.target.value)} placeholder="postgres" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={formData.database.password} onChange={e => updateDatabase('password', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Database Name</Label>
                                        <Input value={formData.database.dbname} onChange={e => updateDatabase('dbname', e.target.value)} placeholder="sub2api" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SSL Mode</Label>
                                        <select value={formData.database.sslmode} onChange={e => updateDatabase('sslmode', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="disable">Disable</option>
                                            <option value="require">Require</option>
                                            <option value="verify-ca">Verify CA</option>
                                            <option value="verify-full">Verify Full</option>
                                        </select>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" onClick={testDatabase} disabled={testingDb}>
                                    {testingDb ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : dbConnected ? <Check className="h-4 w-4 mr-2 text-green-500" /> : null}
                                    {testingDb ? 'Testing...' : dbConnected ? 'Connected' : 'Test Connection'}
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Redis */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold">Redis Configuration</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Configure your Redis cache connection</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Host</Label>
                                        <Input value={formData.redis.host} onChange={e => updateRedis('host', e.target.value)} placeholder="localhost" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Port</Label>
                                        <Input type="number" value={formData.redis.port} onChange={e => updateRedis('port', parseInt(e.target.value))} placeholder="6379" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Password (optional)</Label>
                                        <Input type="password" value={formData.redis.password} onChange={e => updateRedis('password', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Database</Label>
                                        <Input type="number" value={formData.redis.db} onChange={e => updateRedis('db', parseInt(e.target.value))} placeholder="0" />
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" onClick={testRedis} disabled={testingRedis}>
                                    {testingRedis ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : redisConnected ? <Check className="h-4 w-4 mr-2 text-green-500" /> : null}
                                    {testingRedis ? 'Testing...' : redisConnected ? 'Connected' : 'Test Connection'}
                                </Button>
                            </div>
                        )}

                        {/* Step 3: Admin */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold">Admin Account</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Create the initial administrator account</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={formData.admin.email} onChange={e => updateAdmin('email', e.target.value)} placeholder="admin@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={formData.admin.password} onChange={e => updateAdmin('password', e.target.value)} placeholder="At least 6 characters" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
                                        {confirmPassword && formData.admin.password !== confirmPassword && (
                                            <p className="text-sm text-destructive">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Complete */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold">Ready to Install</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Review your configuration and complete the setup</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="rounded-xl bg-muted p-4">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Database</h3>
                                        <p>{formData.database.user}@{formData.database.host}:{formData.database.port}/{formData.database.dbname}</p>
                                    </div>
                                    <div className="rounded-xl bg-muted p-4">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Redis</h3>
                                        <p>{formData.redis.host}:{formData.redis.port}</p>
                                    </div>
                                    <div className="rounded-xl bg-muted p-4">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Admin Email</h3>
                                        <p>{formData.admin.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mt-6 rounded-xl border border-green-500/50 bg-green-500/10 p-4 flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Installation Complete!</p>
                                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">Redirecting to login page...</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="mt-8 flex justify-between">
                            {currentStep > 0 && !success ? (
                                <Button variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)}>
                                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                            ) : <div />}

                            {currentStep < 3 ? (
                                <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                                    Next <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : !success && (
                                <Button onClick={performInstall} disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {loading ? 'Installing...' : 'Complete Installation'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
