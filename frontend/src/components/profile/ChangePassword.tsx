import { useState } from "react"
import { authAPI } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match" })
            return
        }

        setLoading(true)
        setMessage(null)
        try {
            await authAPI.changePassword({
                old_password: currentPassword,
                new_password: newPassword
            })
            setMessage({ type: 'success', text: "Password updated successfully" })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: "Failed to update password. Please check your current password." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading}>Update Password</Button>
                </form>
            </CardContent>
        </Card>
    )
}
