import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { cn } from "@/utils/cn"
import {
    LayoutDashboard,
    Key,
    BarChart2,
    CreditCard,
    Gift,
    User,
    Settings,
    Users,
    FolderOpen,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const { isAdmin, runMode, logout } = useAuthStore()
    const navigate = useNavigate()
    const isSimpleMode = runMode === 'simple'

    const toggleSidebar = () => setCollapsed(!collapsed)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                    collapsed && "justify-center px-2"
                )
            }
            title={collapsed ? label : undefined}
        >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{label}</span>}
        </NavLink>
    )

    return (
        <aside
            className={cn(
                "flex flex-col border-r bg-card transition-all duration-300",
                collapsed ? "w-[60px]" : "w-64"
            )}
        >
            <div className="flex h-14 items-center border-b px-4">
                {!collapsed && <span className="font-semibold text-lg">Sub2API</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto h-8 w-8", collapsed && "ml-0")}
                    onClick={toggleSidebar}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {isAdmin ? (
                        <>
                            <div className={cn("mb-2 px-2 text-xs font-semibold text-muted-foreground", collapsed && "hidden")}>
                                Admin
                            </div>
                            <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavItem to="/admin/users" icon={Users} label="Users" />
                            <NavItem to="/admin/groups" icon={FolderOpen} label="Groups" />
                            <NavItem to="/admin/accounts" icon={CreditCard} label="Accounts" />
                            <NavItem to="/admin/proxies" icon={Users} label="Proxies" />
                            <NavItem to="/admin/subscriptions" icon={Calendar} label="Subscriptions" />
                            <NavItem to="/admin/promo-codes" icon={Gift} label="Promo Codes" />
                            <NavItem to="/admin/usage" icon={BarChart2} label="Usage" />
                            <NavItem to="/admin/settings" icon={Settings} label="Settings" />

                            {/* Personal Section for Admin */}
                            <div className={cn("mt-4 mb-2 px-2 text-xs font-semibold text-muted-foreground", collapsed && "hidden")}>
                                My Account
                            </div>
                            <NavItem to="/keys" icon={Key} label="API Keys" />
                            {!isSimpleMode && <NavItem to="/usage" icon={BarChart2} label="Usage" />}
                            <NavItem to="/profile" icon={User} label="Profile" />
                        </>
                    ) : (
                        <>
                            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavItem to="/keys" icon={Key} label="API Keys" />
                            {!isSimpleMode && (
                                <>
                                    <NavItem to="/usage" icon={BarChart2} label="Usage" />
                                    <NavItem to="/subscriptions" icon={CreditCard} label="Subscriptions" />
                                    <NavItem to="/redeem" icon={Gift} label="Redeem" />
                                </>
                            )}
                            <NavItem to="/profile" icon={User} label="Profile" />
                        </>
                    )}
                </nav>
            </div>

            <div className="border-t p-2">
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20", collapsed && "justify-center px-0")}
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    {!collapsed && "Logout"}
                </Button>
            </div>
        </aside>
    )
}
