'use client'

import { useState, useCallback } from 'react'
import { LoadingState } from '@/lib/types/ui'

export function useLoadingState(initialLoading: boolean = false) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading,
    message: undefined,
    progress: undefined
  })

  const setLoading = useCallback((
    isLoading: boolean, 
    message?: string, 
    progress?: number
  ) => {
    setLoadingState({
      isLoading,
      message,
      progress
    })
  }, [])

  const startLoading = useCallback((message?: string) => {
    setLoading(true, message)
  }, [setLoading])

  const stopLoading = useCallback(() => {
    setLoading(false)
  }, [setLoading])

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
      message: message || prev.message
    }))
  }, [])

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    startLoading(message)
    try {
      const result = await operation()
      stopLoading()
      return result
    } catch (error) {
      stopLoading()
      throw error
    }
  }, [startLoading, stopLoading])

  return {
    loadingState,
    setLoading,
    startLoading,
    stopLoading,
    updateProgress,
    withLoading,
    isLoading: loadingState.isLoading
  }
}