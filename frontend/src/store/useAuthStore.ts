import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authAPI } from '@/api/auth'

interface AuthState {
    user: User | null
    token: string | null
    runMode: 'standard' | 'simple'
    isAuthenticated: boolean
    isAdmin: boolean
    login: (credentials: LoginRequest) => Promise<any>
    login2FA: (tempToken: string, totpCode: string) => Promise<User>
    register: (data: RegisterRequest) => Promise<User>
    logout: () => void
    setToken: (token: string) => Promise<User>
    refreshUser: () => Promise<User>
    checkAuth: () => void
    setUser: (user: User) => void
}

const AUTH_TOKEN_KEY = 'auth_token'

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            runMode: 'standard',
            isAuthenticated: false,
            isAdmin: false,

            login: async (credentials) => {
                try {
                    const response = await authAPI.login(credentials)

                    if (response.totp_required) {
                        return response // Return for UI to handle 2FA
                    }

                    const { access_token, user } = response
                    const runMode = user.run_mode || 'standard'

                    set({
                        user,
                        token: access_token,
                        runMode,
                        isAuthenticated: true,
                        isAdmin: user.role === 'admin'
                    })

                    localStorage.setItem(AUTH_TOKEN_KEY, access_token)
                    // Start auto refresh logic if needed (implemented in useEffect in App usually)

                    return response
                } catch (error) {
                    get().logout()
                    throw error
                }
            },

            login2FA: async (tempToken, totpCode) => {
                try {
                    const response = await authAPI.login2FA({ temp_token: tempToken, totp_code: totpCode })
                    const { access_token, user } = response
                    const runMode = user.run_mode || 'standard'

                    set({
                        user,
                        token: access_token,
                        runMode,
                        isAuthenticated: true,
                        isAdmin: user.role === 'admin'
                    })

                    localStorage.setItem(AUTH_TOKEN_KEY, access_token)
                    return user
                } catch (error) {
                    get().logout()
                    throw error
                }
            },

            register: async (data) => {
                try {
                    const response = await authAPI.register(data)
                    const { access_token, user } = response
                    const runMode = user.run_mode || 'standard'

                    set({
                        user,
                        token: access_token,
                        runMode,
                        isAuthenticated: true,
                        isAdmin: user.role === 'admin'
                    })

                    localStorage.setItem(AUTH_TOKEN_KEY, access_token)
                    return user
                } catch (error) {
                    get().logout()
                    throw error
                }
            },

            setToken: async (newToken) => {
                set({ token: newToken })
                localStorage.setItem(AUTH_TOKEN_KEY, newToken)
                try {
                    const userData = await get().refreshUser()
                    return userData
                } catch (e) {
                    get().logout()
                    throw e
                }
            },

            logout: () => {
                // authAPI.logout().catch(console.error) // Optional server-side logout
                localStorage.removeItem(AUTH_TOKEN_KEY)
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isAdmin: false
                })
            },

            refreshUser: async () => {
                const { token } = get()
                if (!token) throw new Error('Not authenticated')

                try {
                    const response = await authAPI.getCurrentUser()
                    const user = response.data
                    const runMode = user.run_mode || 'standard'

                    set({
                        user,
                        runMode,
                        isAuthenticated: true,
                        isAdmin: user.role === 'admin'
                    })
                    return user
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                        get().logout()
                    }
                    throw error
                }
            },

            checkAuth: () => {
                const token = localStorage.getItem(AUTH_TOKEN_KEY)
                if (token) {
                    set({ token, isAuthenticated: true })
                    get().refreshUser().catch(() => {
                        // specific handling if refresh failed silently? 
                        // logout is handled in refreshUser catch
                    })
                }
            },

            setUser: (user) => {
                set({ user })
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                runMode: state.runMode,
                isAuthenticated: state.isAuthenticated,
                isAdmin: state.isAdmin
            }),
        }
    )
)

// Axios import needed for refreshUser error check, added here to avoid circular dep issues in store file
import axios from 'axios'
