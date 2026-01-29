
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
