import client from './client'
import type { ApiKey, ApiKeyListResponse, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/types/keys'

export const keysAPI = {
    list: (page: number, pageSize: number, options?: { signal?: AbortSignal }) =>
        client.get<any, ApiKeyListResponse>('/keys', {
            params: { page, page_size: pageSize },
            signal: options?.signal
        }),
    create: (data: CreateApiKeyRequest) => client.post<any, ApiKey>('/keys', data),
    update: (id: number, data: UpdateApiKeyRequest) => client.put<any, ApiKey>(`/keys/${id}`, data),
    delete: (id: number) => client.delete(`/keys/${id}`),
    toggleStatus: (id: number, status: 'active' | 'inactive') =>
        client.patch<any, ApiKey>(`/keys/${id}/status`, { status }),
}

export const userGroupsAPI = {
    getAvailable: () => client.get<any, any[]>('/groups/available').then(res => res.data || res),
}
