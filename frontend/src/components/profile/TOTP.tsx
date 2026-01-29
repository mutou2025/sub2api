import { useState, useEffect } from "react"
import { authAPI } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, Smartphone } from "lucide-react"

export function TOTP() {
    const [enabled, setEnabled] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showSetup, setShowSetup] = useState(false)
    const [setupData, setSetupData] = useState<{ secret: string; qr_code: string } | null>(null)
    const [verifyCode, setVerifyCode] = useState("")
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
    const [showRecovery, setShowRecovery] = useState(false)

    useEffect(() => {
        loadStatus()
    }, [])

    const loadStatus = async () => {
        try {
            const res = await authAPI.getTOTPStatus()
            setEnabled(res.enabled)
        } catch (err) {
            console.error("Failed to load TOTP status", err)
        } finally {
            setLoading(false)
        }
    }

    const startSetup = async () => {
        try {
            const data = await authAPI.setupTOTP()
            setSetupData(data)
            setShowSetup(true)
        } catch (err) {
            console.error("Failed to start TOTP setup", err)
        }
    }

    const handleVerify = async () => {
        try {
            const res = await authAPI.verifyTOTP(verifyCode)
            setEnabled(true)
            setRecoveryCodes(res.recovery_codes)
            setShowSetup(false)
            setShowRecovery(true)
            setVerifyCode("")
        } catch (err) {
            console.error("Failed to verify code", err)
            alert("Invalid code")
        }
    }

    const disable2FA = async () => {
        const code = prompt("Enter your 6-digit code to disable 2FA:")
        if (!code) return

        try {
            await authAPI.disableTOTP(code)
            setEnabled(false)
            alert("Two-factor authentication disabled")
        } catch (err) {
            console.error("Failed to disable 2FA", err)
            alert("Failed to disable 2FA. Check your code.")
        }
    }

    if (loading) return null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Two-Factor Authentication</CardTitle>
                <Smartphone className={`h-4 w-4 ${enabled ? "text-green-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                        <p className="font-medium">Status: {enabled ? "Enabled" : "Disabled"}</p>
                        <p className="text-sm text-muted-foreground">
                            {enabled
                                ? "Your account is secured with 2FA."
                                : "Add an extra layer of security to your account."}
                        </p>
                    </div>
                    <Button
                        variant={enabled ? "destructive" : "default"}
                        onClick={enabled ? disable2FA : startSetup}
                    >
                        {enabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                </div>
            </CardContent>

            <Dialog open={showSetup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setup 2FA</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                            {setupData?.qr_code && (
                                <img src={setupData.qr_code} alt="QR Code" className="w-48 h-48 border rounded-lg" />
                            )}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                            <p className="text-xs font-mono bg-muted p-2 rounded">{setupData?.secret}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Verification Code</label>
                            <Input
                                value={verifyCode}
                                onChange={e => setVerifyCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="text-center tracking-widest text-lg"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowSetup(false)}>Cancel</Button>
                            <Button onClick={handleVerify} disabled={verifyCode.length !== 6}>Verify & Enable</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showRecovery}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            2FA Enabled Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Save your recovery codes!</p>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    If you lose access to your device, these codes are the only way to recover your account.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {recoveryCodes.map((code, i) => (
                                <div key={i} className="bg-muted p-2 rounded text-center font-mono text-sm select-all">
                                    {code}
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowRecovery(false)}>I have saved these codes</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
