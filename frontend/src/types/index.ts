export interface User {
    id: number
    email: string
    username: string
    role: 'user' | 'admin'
    avatar_url?: string
    run_mode?: 'standard' | 'simple'
    created_at?: string
    [key: string]: any
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    invite_code?: string
}

export interface AuthResponse {
    access_token: string
    user: User
    expires_in: number
}

export interface LoginResponse extends AuthResponse {
    totp_required?: boolean
    temp_token?: string
}

export * from './keys'
export * from './subscriptions'
export * from './usage'
export * from './redeem'
export * from './admin'
