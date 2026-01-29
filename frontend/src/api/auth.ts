import client from './client'
import type { LoginRequest, RegisterRequest, LoginResponse, User, AuthResponse } from '@/types'

export const authAPI = {
    login: (data: LoginRequest) => client.post<any, LoginResponse>('/auth/login', data),
    register: (data: RegisterRequest) => client.post<any, AuthResponse>('/auth/register', data),
    logout: () => client.post('/auth/logout'),
    getCurrentUser: () => client.get<any, { data: User }>('/users/me'),
    login2FA: (data: { temp_token: string; totp_code: string }) =>
        client.post<any, AuthResponse>('/auth/2fa/verify', data),

    // Profile
    updateProfile: (data: { username: string }) => client.put<any, User>('/users/me', data),
    changePassword: (data: any) => client.post('/auth/password/change', data),

    // Settings
    getPublicSettings: () => client.get<any, any>('/settings/public'),

    // TOTP
    getTOTPStatus: () => client.get<any, { enabled: boolean }>('/auth/2fa/status'),
    setupTOTP: () => client.post<any, { secret: string; qr_code: string }>('/auth/2fa/setup'),
    verifyTOTP: (code: string) => client.post<any, { recovery_codes: string[] }>('/auth/2fa/confirm', { code }),
    disableTOTP: (code: string) => client.post('/auth/2fa/disable', { code }),
}
