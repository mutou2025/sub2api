import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Subscriptions from '@/pages/Subscriptions'
import Profile from '@/pages/Profile'
import Keys from '@/pages/Keys'
import Usage from '@/pages/Usage'
import Redeem from '@/pages/Redeem'
import Setup from '@/pages/Setup'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminAccounts from '@/pages/admin/Accounts'
import AdminProxies from '@/pages/admin/Proxies'
import AdminGroups from '@/pages/admin/Groups'
import AdminUsers from '@/pages/admin/Users'
import AdminSubscriptions from '@/pages/admin/Subscriptions'
import AdminPromoCodes from '@/pages/admin/PromoCodes'
import AdminSettings from '@/pages/admin/Settings'
import AdminUsage from '@/pages/admin/Usage'

// Layouts
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'

console.log("router.tsx: Creating router configuration")
const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    /*
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/setup',
        element: <Setup />,
    },
    {
        path: '/',
        element: <ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'subscriptions',
                element: <Subscriptions />,
            },
            {
                path: 'profile',
                element: <Profile />,
            },
            {
                path: 'keys',
                element: <Keys />,
            },
            {
                path: 'usage',
                element: <Usage />,
            },
            {
                path: 'redeem',
                element: <Redeem />,
            },
        ],
    },
    {
        path: '/admin',
        element: <ProtectedRoute adminOnly><AdminLayout><Outlet /></AdminLayout></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <AdminDashboard />,
            },
            {
                path: 'accounts',
                element: <AdminAccounts />,
            },
            {
                path: 'proxies',
                element: <AdminProxies />,
            },
            {
                path: 'groups',
                element: <AdminGroups />,
            },
            {
                path: 'users',
                element: <AdminUsers />,
            },
            {
                path: 'subscriptions',
                element: <AdminSubscriptions />,
            },
            {
                path: 'promo-codes',
                element: <AdminPromoCodes />,
            },
            {
                path: 'settings',
                element: <AdminSettings />,
            },
            {
                path: 'usage',
                element: <AdminUsage />,
            },
        ],
    },
    */
])

export { router }
