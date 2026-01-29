import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

import { router } from './router'

function App() {
  console.log("App.tsx: Render with providers and REAL router")
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    console.log("App.tsx: Running checkAuth effect")
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
