import client from './client'
import type { UserSubscription } from '@/types/subscriptions'

export const subscriptionsAPI = {
    getMySubscriptions: () => client.get<any, UserSubscription[]>('/subscriptions/my'),
}
