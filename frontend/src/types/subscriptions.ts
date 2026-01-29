import type { Group } from './keys'
import type { User } from './index'

export interface UserSubscription {
    id: number
    user_id: number
    group_id: number
    status: 'active' | 'expired' | 'canceled'
    starts_at: string
    expires_at: string
    created_at: string
    updated_at: string
    group: Group
    user?: User

    // Usage tracking fields (virtual/aggregated)
    daily_usage_usd?: number
    weekly_usage_usd?: number
    monthly_usage_usd?: number
    total_usage_usd?: number

    // Reset window info
    daily_window_start?: string
    weekly_window_start?: string
    monthly_window_start?: string
}
