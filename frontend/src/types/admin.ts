import type { User, UserSubscription } from './index'

export interface AdminStats {
    total_users: number
    active_subscriptions: number
    total_requests: number
    total_revenue: number
    platform_usage: Record<string, number>
}

export interface Proxy {
    id: number
    name: string
    protocol: 'http' | 'https' | 'socks5' | 'socks5h'
    host: string
    port: number
    username?: string
    password?: string
    country_code?: string
    latency_ms?: number
    latency_status: 'unknown' | 'success' | 'failed'
    status: 'active' | 'inactive'
    account_count?: number
}

export interface AdminGroup {
    id: number
    name: string
    description?: string
    platform: 'openai' | 'anthropic' | 'gemini' | 'claude_code'
    rate_multiplier: number
    is_exclusive: boolean
    subscription_type: 'standard' | 'subscription'
    daily_limit_usd?: number
    weekly_limit_usd?: number
    monthly_limit_usd?: number
    status: 'active' | 'inactive'
    account_count?: number
    image_price_1k?: number
    image_price_2k?: number
    image_price_4k?: number
    claude_code_only?: boolean
    fallback_group_id?: number
    model_routing_enabled?: boolean
}

export interface Account {
    id: number
    name: string
    platform: string
    type: string
    status: 'active' | 'inactive' | 'error' | 'expired'
    schedulable: boolean
    priority: number
    rate_multiplier?: number
    last_used_at?: string
    expires_at?: number
    notes?: string
    proxy?: Proxy
    groups?: AdminGroup[]
    auto_pause_on_expired?: boolean
    today_stats?: {
        requests: number
        tokens: number
        cost: number
    }
}

export interface ProxyCreateRequest {
    name: string
    protocol: string
    host: string
    port: number
    username?: string
    password?: string
}

export interface GroupCreateRequest {
    name: string
    description?: string
    platform: string
    rate_multiplier: number
    is_exclusive: boolean
    subscription_type: string
    status?: string
}

export interface AccountCreateRequest {
    name: string
    platform: string
    type: string
    credentials: Record<string, any>
    proxy_id?: number
    group_ids?: number[]
}

export interface AdminUser extends User {
    notes?: string
    status: 'active' | 'disabled' | 'banned'
    role: 'admin' | 'user'
    subscriptions?: UserSubscription[]
    api_keys_count?: number
    created_at: string
}

export interface PromoCode {
    id: number
    code: string
    bonus_amount: number
    max_uses: number
    used_count: number
    status: 'active' | 'disabled'
    expires_at?: string
    notes?: string
    created_at: string
}

export interface PromoCodeUsage {
    id: number
    user_id: number
    promo_code_id: number
    bonus_amount: number
    used_at: string
    user?: {
        email: string
        username?: string
    }
}

export interface PromoCodeCreateRequest {
    code?: string
    bonus_amount: number
    max_uses?: number
    expires_at?: number
    notes?: string
}
