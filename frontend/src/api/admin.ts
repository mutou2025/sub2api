import client from './client'
import type { AdminStats, Proxy, Account, AdminGroup, ProxyCreateRequest, GroupCreateRequest, AccountCreateRequest, AdminUser, PromoCode, PromoCodeUsage, PromoCodeCreateRequest } from '@/types/admin'
import type { UserSubscription } from '@/types'

export const adminAPI = {
    getStats: () => client.get<any, AdminStats>('/admin/stats'),

    proxies: {
        list: (params?: any) => client.get<any, Proxy[]>('/admin/proxies', { params }),
        getAll: () => client.get<any, Proxy[]>('/admin/proxies/all'),
        create: (data: ProxyCreateRequest) => client.post<any, Proxy>('/admin/proxies', data),
        update: (id: number, data: Partial<ProxyCreateRequest>) => client.put<any, Proxy>(`/admin/proxies/${id}`, data),
        delete: (id: number) => client.delete(`/admin/proxies/${id}`),
        test: (id: number) => client.post(`/admin/proxies/${id}/test`),
        batchTest: (ids: number[]) => client.post('/admin/proxies/batch-test', { ids }),
    },

    groups: {
        list: (params?: any) => client.get<any, AdminGroup[]>('/admin/groups', { params }),
        getAll: () => client.get<any, AdminGroup[]>('/admin/groups/all'),
        create: (data: GroupCreateRequest) => client.post<any, AdminGroup>('/admin/groups', data),
        update: (id: number, data: Partial<GroupCreateRequest>) => client.put<any, AdminGroup>(`/admin/groups/${id}`, data),
        delete: (id: number) => client.delete(`/admin/groups/${id}`),
    },

    accounts: {
        list: (page: number, pageSize: number, params?: any) => client.get<any, { items: Account[], total: number }>('/admin/accounts', { params: { page, page_size: pageSize, ...params } }),
        create: (data: AccountCreateRequest) => client.post<any, Account>('/admin/accounts', data),
        update: (id: number, data: any) => client.put<any, Account>(`/admin/accounts/${id}`, data),
        delete: (id: number) => client.delete(`/admin/accounts/${id}`),
        refreshCredentials: (id: number) => client.post(`/admin/accounts/${id}/refresh`),
        clearError: (id: number) => client.post(`/admin/accounts/${id}/clear-error`),
        clearRateLimit: (id: number) => client.post(`/admin/accounts/${id}/clear-rate-limit`),
        setSchedulable: (id: number, schedulable: boolean) => client.patch<any, Account>(`/admin/accounts/${id}/schedulable`, { schedulable }),
        bulkUpdate: (ids: number[], data: any) => client.post('/admin/accounts/bulk-update', { ids, ...data }),
    },

    users: {
        list: (page: number, pageSize: number, params?: any) => client.get<any, { items: AdminUser[], total: number }>('/admin/users', { params: { page, page_size: pageSize, ...params } }),
        get: (id: number) => client.get<any, AdminUser>(`/admin/users/${id}`),
        create: (data: any) => client.post<any, AdminUser>('/admin/users', data),
        update: (id: number, data: any) => client.put<any, AdminUser>(`/admin/users/${id}`, data),
        delete: (id: number) => client.delete(`/admin/users/${id}`),
        toggleStatus: (id: number, status: string) => client.patch(`/admin/users/${id}/status`, { status }),
        getApiKeys: (id: number) => client.get(`/admin/users/${id}/api-keys`),
        deposit: (id: number, amount: number) => client.post(`/admin/users/${id}/deposit`, { amount }),
        withdraw: (id: number, amount: number) => client.post(`/admin/users/${id}/withdraw`, { amount }),
    },

    subscriptions: {
        list: (page: number, pageSize: number, params?: any) => client.get<any, { items: UserSubscription[], total: number }>('/admin/subscriptions', { params: { page, page_size: pageSize, ...params } }),
        assign: (data: any) => client.post<any, UserSubscription>('/admin/subscriptions/assign', data),
        extend: (id: number, days: number) => client.post(`/admin/subscriptions/${id}/extend`, { days }),
        revoke: (id: number) => client.post(`/admin/subscriptions/${id}/revoke`),
    },

    promo: {
        list: (page: number, pageSize: number, params?: any) => client.get<any, { items: PromoCode[], total: number }>('/admin/promo-codes', { params: { page, page_size: pageSize, ...params } }),
        create: (data: PromoCodeCreateRequest) => client.post<any, PromoCode>('/admin/promo-codes', data),
        update: (id: number, data: any) => client.put<any, PromoCode>(`/admin/promo-codes/${id}`, data),
        delete: (id: number) => client.delete(`/admin/promo-codes/${id}`),
        getUsages: (id: number, page: number, pageSize: number) => client.get<any, { items: PromoCodeUsage[], total: number }>(`/admin/promo-codes/${id}/usages`, { params: { page, page_size: pageSize } }),
    }
}
