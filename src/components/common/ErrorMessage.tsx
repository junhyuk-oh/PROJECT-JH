import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  error: string | Error | null
  onRetry?: () => void
  fullScreen?: boolean
}

export function ErrorMessage({ error, onRetry, fullScreen = false }: ErrorMessageProps) {
  const errorMessage = error instanceof Error ? error.message : error || '오류가 발생했습니다'

  const content = (
    <div className="text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-700 mb-4">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        {content}
      </div>
    )
  }

  return content
}