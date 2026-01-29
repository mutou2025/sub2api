import type { Group } from './keys'

export interface RedeemHistoryItem {
    id: number
    user_id: number
    code: string
    type: 'balance' | 'admin_balance' | 'concurrency' | 'admin_concurrency' | 'subscription'
    value: number
    validity_days?: number
    used_at: string
    group?: Group
}

export interface RedeemResult {
    message: string
    type: string
    value: number
    new_balance?: number
    new_concurrency?: number
    group_name?: string
    validity_days?: number
}
