import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export default function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
                {children || <Outlet />}
            </main>
        </div>
    )
}
