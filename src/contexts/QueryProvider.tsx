'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode, Suspense } from 'react'
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking'
import { LazyReactQueryDevtools } from '@/components/common/LazyComponents'

interface QueryProviderProps {
  children: ReactNode
}

function QueryProviderInner({ children }: QueryProviderProps) {
  usePerformanceTracking()
  
  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <LazyReactQueryDevtools 
            initialIsOpen={false}
          />
        </Suspense>
      )}
    </>
  )
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
          refetchOnWindowFocus: false,
          retry: (failureCount, error) => {
            if (failureCount < 2) return true
            return false
          },
        },
        mutations: {
          retry: false,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <QueryProviderInner>
        {children}
      </QueryProviderInner>
    </QueryClientProvider>
  )
}