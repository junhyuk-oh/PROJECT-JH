'use client'

import { useState, useCallback } from 'react'

/**
 * 로딩 상태와 에러를 관리하는 훅
 */
export function useLoading<T = any>(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset,
    setLoading,
    setError,
    setData
  }
}