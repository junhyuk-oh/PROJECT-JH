'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useErrorHandler } from './useErrorHandler'
import { useLoadingState } from './useLoadingState'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null
  })
  
  const { handleError } = useErrorHandler()
  const isMountedRef = useRef(true)

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await asyncFunction()
      
      if (!isMountedRef.current) return

      setState({ data, isLoading: false, error: null })
      onSuccess?.(data)
      return data
    } catch (error) {
      if (!isMountedRef.current) return

      const err = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, isLoading: false, error: err }))
      handleError(err)
      onError?.(err)
      throw err
    }
  }, [asyncFunction, handleError, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, dependencies)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// 특정 API 호출을 위한 전용 훅
export function useApiCall<T, P = any>(
  apiFunction: (params?: P) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { loadingState, startLoading, stopLoading } = useLoadingState()
  const { handleError } = useErrorHandler()
  const [data, setData] = useState<T | null>(null)
  const isMountedRef = useRef(true)

  const call = useCallback(async (params?: P): Promise<T | null> => {
    if (!isMountedRef.current) return null

    startLoading()
    try {
      const result = await apiFunction(params)
      
      if (!isMountedRef.current) return null

      setData(result)
      stopLoading()
      options.onSuccess?.(result)
      return result
    } catch (error) {
      if (!isMountedRef.current) return null

      stopLoading()
      const err = error instanceof Error ? error : new Error(String(error))
      handleError(err)
      options.onError?.(err)
      throw err
    }
  }, [apiFunction, startLoading, stopLoading, handleError, options])

  const reset = useCallback(() => {
    setData(null)
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    isLoading: loadingState.isLoading,
    loadingState,
    call,
    reset
  }
}