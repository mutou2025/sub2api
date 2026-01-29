export interface ApiKey {
    id: number
    name: string
    key: string
    group_id: number
    user_id: number
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
    last_used_at?: string
    ip_whitelist: string[]
    ip_blacklist: string[]
    group?: Group
}

export interface Group {
    id: number
    name: string
    description: string | null
    platform: 'openai' | 'anthropic' | 'gemini' | 'other'
    subscription_type: 'subscription' | 'usage'
    rate_multiplier: number
    status: 'active' | 'inactive'
    daily_limit_usd?: number
    weekly_limit_usd?: number
    monthly_limit_usd?: number
}

export interface ApiKeyListResponse {
    items: ApiKey[]
    total: number
    page: number
    page_size: number
    pages: number
}

export interface CreateApiKeyRequest {
    name: string
    group_id: number
    status?: 'active' | 'inactive'
    use_custom_key?: boolean
    custom_key?: string
    enable_ip_restriction?: boolean
    ip_whitelist?: string[]
    ip_blacklist?: string[]
}

export interface UpdateApiKeyRequest {
    name?: string
    group_id?: number
    status?: 'active' | 'inactive'
    enable_ip_restriction?: boolean
    ip_whitelist?: string[]
    ip_blacklist?: string[]
}
