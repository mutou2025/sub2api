import client from './client'
import type { UsageLog, UsageStats, UsageQueryParams, UserDashboardStats, DashboardTrendResponse, DashboardModelsResponse } from '@/types/usage'

interface UsageResponse {
    items: UsageLog[]
    total: number
    page: number
    page_size: number
    pages: number
}

export const usageAPI = {
    query: (params: UsageQueryParams, signal?: AbortSignal) =>
        client.get<UsageResponse>('/usage/logs', { params, signal }).then(res => res.data),

    getStats: (params: UsageQueryParams) =>
        client.get<UsageStats>('/usage/stats', { params }).then(res => res.data),

    getDashboardStats: () =>
        client.get<any, UserDashboardStats>('/usage/dashboard/stats'),

    getDashboardTrend: (params: { start_date: string; end_date: string; granularity: 'day' | 'hour' }) =>
        client.get<any, DashboardTrendResponse>('/usage/dashboard/trend', { params }),

    getDashboardModels: (params: { start_date: string; end_date: string }) =>
        client.get<any, DashboardModelsResponse>('/usage/dashboard/models', { params })
}
