// 중앙화된 에러 처리 시스템

import { ApiError, ApiErrorCode, API_ERROR_CODES } from '@/lib/types/api'
import { ErrorState } from '@/lib/types/ui'

export class AppError extends Error {
  public readonly code: ApiErrorCode
  public readonly isOperational: boolean
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: ApiErrorCode = API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    // V8의 스택 트레이스 최적화
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// 에러 팩토리 함수들
export const createError = {
  // 인증 관련 에러
  unauthorized: (message: string = '인증이 필요합니다') =>
    new AppError(message, API_ERROR_CODES.UNAUTHORIZED, 401),
  
  invalidToken: (message: string = '유효하지 않은 토큰입니다') =>
    new AppError(message, API_ERROR_CODES.INVALID_TOKEN, 401),
  
  tokenExpired: (message: string = '토큰이 만료되었습니다') =>
    new AppError(message, API_ERROR_CODES.TOKEN_EXPIRED, 401),

  // 사용자 관련 에러
  userNotFound: (message: string = '사용자를 찾을 수 없습니다') =>
    new AppError(message, API_ERROR_CODES.USER_NOT_FOUND, 404),
  
  emailExists: (message: string = '이미 존재하는 이메일입니다') =>
    new AppError(message, API_ERROR_CODES.EMAIL_ALREADY_EXISTS, 409),
  
  invalidCredentials: (message: string = '이메일 또는 비밀번호가 올바르지 않습니다') =>
    new AppError(message, API_ERROR_CODES.INVALID_CREDENTIALS, 401),

  // 프로젝트 관련 에러
  projectNotFound: (message: string = '프로젝트를 찾을 수 없습니다') =>
    new AppError(message, API_ERROR_CODES.PROJECT_NOT_FOUND, 404),
  
  projectAccessDenied: (message: string = '프로젝트에 접근할 권한이 없습니다') =>
    new AppError(message, API_ERROR_CODES.PROJECT_ACCESS_DENIED, 403),
  
  invalidProjectData: (message: string = '프로젝트 데이터가 유효하지 않습니다', details?: any) =>
    new AppError(message, API_ERROR_CODES.INVALID_PROJECT_DATA, 400, true, details),

  // 스케줄 관련 에러
  scheduleGenerationFailed: (message: string = '스케줄 생성에 실패했습니다', details?: any) =>
    new AppError(message, API_ERROR_CODES.SCHEDULE_GENERATION_FAILED, 500, true, details),
  
  invalidScheduleData: (message: string = '스케줄 데이터가 유효하지 않습니다', details?: any) =>
    new AppError(message, API_ERROR_CODES.INVALID_SCHEDULE_DATA, 400, true, details),

  // 파일 관련 에러
  fileTooLarge: (maxSize: number) =>
    new AppError(
      `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}까지 업로드 가능합니다`,
      API_ERROR_CODES.FILE_TOO_LARGE,
      413,
      true,
      { maxSize }
    ),
  
  invalidFileType: (allowedTypes: string[]) =>
    new AppError(
      `지원하지 않는 파일 형식입니다. 허용된 형식: ${allowedTypes.join(', ')}`,
      API_ERROR_CODES.INVALID_FILE_TYPE,
      400,
      true,
      { allowedTypes }
    ),

  // 유효성 검사 에러
  validationError: (message: string = '입력 데이터가 유효하지 않습니다', details?: any) =>
    new AppError(message, API_ERROR_CODES.VALIDATION_ERROR, 400, true, details),
  
  missingField: (fieldName: string) =>
    new AppError(
      `필수 필드가 누락되었습니다: ${fieldName}`,
      API_ERROR_CODES.MISSING_REQUIRED_FIELD,
      400,
      true,
      { fieldName }
    ),

  // 네트워크 및 시스템 에러
  networkError: (message: string = '네트워크 연결에 문제가 발생했습니다') =>
    new AppError(message, API_ERROR_CODES.SERVICE_UNAVAILABLE, 503),
  
  rateLimitExceeded: (retryAfter?: number) =>
    new AppError(
      '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요',
      API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      429,
      true,
      { retryAfter }
    )
}

// 에러를 ErrorState로 변환하는 함수
export function errorToErrorState(error: unknown): ErrorState {
  if (error instanceof AppError) {
    return {
      hasError: true,
      error,
      errorCode: error.code,
      message: error.message
    }
  }

  if (error instanceof Error) {
    return {
      hasError: true,
      error,
      errorCode: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: error.message
    }
  }

  return {
    hasError: true,
    error: new Error(String(error)),
    errorCode: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: '알 수 없는 오류가 발생했습니다'
  }
}

// 에러 복구 및 재시도 로직
export class ErrorRecovery {
  private static retryDelays = [1000, 2000, 4000, 8000] // 지수 백오프

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    shouldRetry: (error: unknown) => boolean = defaultShouldRetry
  ): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error
        }

        const delay = this.retryDelays[attempt] || 8000
        await this.delay(delay)
      }
    }

    throw lastError
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 기본 재시도 조건
function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof AppError) {
    // 네트워크 오류나 서버 오류만 재시도
    return error.statusCode >= 500 || error.code === API_ERROR_CODES.SERVICE_UNAVAILABLE
  }
  
  if (error instanceof Error) {
    // 네트워크 관련 에러 메시지 패턴
    const networkErrorPatterns = [
      'fetch failed',
      'network error',
      'connection refused',
      'timeout'
    ]
    
    return networkErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    )
  }

  return false
}

// 에러 로깅 및 리포팅
export class ErrorReporter {
  static report(error: unknown, context?: Record<string, any>): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AppError && {
          code: error.code,
          statusCode: error.statusCode,
          details: error.details
        })
      } : error,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorInfo)
    }

    // 프로덕션 환경에서는 외부 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorInfo)
    }
  }

  private static async sendToErrorService(errorInfo: any): Promise<void> {
    try {
      // 실제 환경에서는 Sentry, Rollbar 등의 서비스를 사용
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }
}

// 유틸리티 함수
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)}${units[unitIndex]}`
}

// React 컴포넌트에서 사용할 에러 핸들링 훅을 위한 헬퍼
export function createErrorHandler(
  onError?: (error: ErrorState) => void
) {
  return (error: unknown) => {
    const errorState = errorToErrorState(error)
    ErrorReporter.report(error)
    onError?.(errorState)
    return errorState
  }
}