import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
  className?: string
  'aria-label'?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  message = '로딩 중...', 
  fullScreen = false,
  className = '',
  'aria-label': ariaLabel = message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const content = (
    <div className={`text-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]}`}
        role="status"
        aria-label={ariaLabel}
      />
      {message && (
        <p className="mt-4 text-gray-600" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}