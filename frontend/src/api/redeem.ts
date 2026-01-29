import client from './client'
import type { RedeemHistoryItem, RedeemResult } from '@/types/redeem'

export const redeemAPI = {
    redeem: (code: string) => client.post<any, RedeemResult>('/redeem', { code }),
    getHistory: () => client.get<any, RedeemHistoryItem[]>('/redeem/history'),
}
