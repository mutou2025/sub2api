import { Outlet, Navigate, Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Users, LayoutDashboard, Key, Shield, Settings, Server, Globe, Box, Tag, Gift, AlertCircle } from "lucide-react"
import { cn } from "@/utils/cn"

export default function AdminLayout() {
    const { user, isAdmin } = useAuthStore()
    const location = useLocation()

    if (!user || !isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
        { name: "Accounts", href: "/admin/accounts", icon: Server },
        { name: "Proxies", href: "/admin/proxies", icon: Globe },
        { name: "Groups", href: "/admin/groups", icon: Box },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: Key },
        { name: "Promo Codes", href: "/admin/promocodes", icon: Tag },
        { name: "Redemptions", href: "/admin/redemptions", icon: Gift },
        { name: "Settings", href: "/admin/settings", icon: Settings },
        { name: "Usage", href: "/admin/usage", icon: AlertCircle },
    ]

    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) return location.pathname === item.href
        return location.pathname.startsWith(item.href)
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card border-r">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Admin
                    </h2>
                </div>
                <nav className="space-y-1 px-4">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive(item)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="mt-8 px-4">
                    <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        ← Back to User Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-muted/20">
                <div className="container mx-auto p-6 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
