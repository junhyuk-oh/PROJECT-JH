import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function usePerformanceTracking() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // React Query 캐시 상태 모니터링
    const interval = setInterval(() => {
      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()
      
      const stats = {
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
        cacheSize: new Blob([JSON.stringify(queryClient.getQueryData)]).size
      }

      // 성능 문제가 있는 경우에만 로그
      if (stats.totalQueries > 20 || stats.staleQueries > 10) {
        console.log('⚠️ React Query Performance Warning:', stats)
      }
    }, 5000) // 5초마다 체크

    return () => clearInterval(interval)
  }, [queryClient])

  // 쿼리 실행 시간 측정
  useEffect(() => {
    const queryCache = queryClient.getQueryCache()
    
    const unsubscribe = queryCache.subscribe((event) => {
      if (event?.type === 'updated' && event.query.state.status === 'success') {
        const query = event.query
        const dataUpdatedAt = query.state.dataUpdatedAt
        
        if (dataUpdatedAt) {
          // 쿼리 성공 로그 (개발환경에서만)
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Query Success:', {
              queryKey: query.queryKey,
              dataSize: new Blob([JSON.stringify(query.state.data)]).size
            })
          }
        }
      }
    })

    return unsubscribe
  }, [queryClient])
}

// 컴포넌트 렌더링 성능 추적
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // 렌더링이 16ms(60fps) 이상 걸리면 경고
      if (renderTime > 16) {
        console.warn(`🎨 Slow Render (${componentName}):`, `${renderTime.toFixed(2)}ms`)
      }
    }
  })
}