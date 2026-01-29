import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { authAPI } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Wallet, Calendar } from "lucide-react"

export function ProfileInfo() {
    const { user, setUser } = useAuthStore()
    const [username, setUsername] = useState(user?.username || "")
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const updatedUser = await authAPI.updateProfile({ username })
            setUser(updatedUser)
            setIsEditing(false)
        } catch (err) {
            console.error("Failed to update profile", err)
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${user.balance?.toFixed(2) || "0.00"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concurrency Limit</CardTitle>
                        <User className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.concurrency || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email / Username</label>
                            {isEditing ? (
                                <form onSubmit={handleUpdate} className="flex gap-2">
                                    <Input
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        disabled={loading}
                                    />
                                    <Button type="submit" disabled={loading}>Save</Button>
                                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between p-2 border rounded-md">
                                    <span>{user.username}</span>
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role</label>
                            <div className="p-2 border rounded-md bg-muted/50 text-muted-foreground">
                                {user.role}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
