import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@/api/auth'

interface PublicSettings {
    site_name?: string
    site_logo?: string
    site_subtitle?: string
    doc_url?: string
    home_content?: string
    email_verification_enabled?: boolean
    turnstile_site_key?: string
}

interface AppState {
    publicSettings: PublicSettings | null
    publicSettingsLoaded: boolean
    fetchPublicSettings: () => Promise<PublicSettings>

    // Derived getters helpers if needed, or just access state directly
    getSiteName: () => string
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            publicSettings: null,
            publicSettingsLoaded: false,

            fetchPublicSettings: async () => {
                try {
                    const settings = await authAPI.getPublicSettings()
                    set({
                        publicSettings: settings,
                        publicSettingsLoaded: true
                    })
                    return settings
                } catch (error) {
                    console.error("Failed to load public settings", error)
                    throw error
                }
            },

            getSiteName: () => {
                return get().publicSettings?.site_name || 'Sub2API'
            }
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({
                publicSettings: state.publicSettings,
                publicSettingsLoaded: state.publicSettingsLoaded
            })
        }
    )
)
