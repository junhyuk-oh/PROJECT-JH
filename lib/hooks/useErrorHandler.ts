'use client'

import { useState, useCallback } from 'react'
import { ErrorState } from '@/lib/types/ui'
import { errorToErrorState, ErrorReporter, createErrorHandler } from '@/lib/utils/errorHandler'

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null
  })

  const handleError = useCallback((error: unknown) => {
    const newErrorState = errorToErrorState(error)
    setErrorState(newErrorState)
    ErrorReporter.report(error)
    return newErrorState
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null
    })
  }, [])

  const retry = useCallback((operation: () => void | Promise<void>) => {
    clearError()
    try {
      const result = operation()
      if (result instanceof Promise) {
        result.catch(handleError)
      }
    } catch (error) {
      handleError(error)
    }
  }, [handleError, clearError])

  return {
    errorState,
    handleError,
    clearError,
    retry
  }
}