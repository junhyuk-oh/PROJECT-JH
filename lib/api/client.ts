// 중앙화된 API 클라이언트

import { ApiResponse, ApiError, API_ERROR_CODES } from '@/lib/types/api'
import { AppError, ErrorRecovery } from '@/lib/utils/errorHandler'

export interface RequestConfig extends RequestInit {
  params?: Record<string, string>
  timeout?: number
  retries?: number
}

export class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit
  private timeout: number
  private retries: number

  constructor(
    baseURL: string = '/api',
    timeout: number = 10000,
    retries: number = 3
  ) {
    this.baseURL = baseURL
    this.timeout = timeout
    this.retries = retries
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  // 토큰 설정 (인증 후 호출)
  setAuthToken(token: string): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`
    }
  }

  // 토큰 제거 (로그아웃 시 호출)
  clearAuthToken(): void {
    const { Authorization, ...headers } = this.defaultHeaders as any
    this.defaultHeaders = headers
  }

  // 기본 요청 메소드
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      params,
      timeout = this.timeout,
      retries = this.retries,
      headers,
      ...requestConfig
    } = config

    // URL 구성
    let url = `${this.baseURL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    // 헤더 병합
    const mergedHeaders = {
      ...this.defaultHeaders,
      ...headers
    }

    // AbortController로 타임아웃 처리
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const makeRequest = async (): Promise<T> => {
      try {
        const response = await fetch(url, {
          ...requestConfig,
          headers: mergedHeaders,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          await this.handleHttpError(response)
        }

        const data: ApiResponse<T> = await response.json()
        
        if (!data.success) {
          throw new AppError(
            data.error?.message || '서버에서 오류가 발생했습니다',
            data.error?.code || API_ERROR_CODES.INTERNAL_SERVER_ERROR,
            response.status,
            true,
            data.error?.details
          )
        }

        return data.data as T
      } catch (error) {
        clearTimeout(timeoutId)
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new AppError(
            '요청 시간이 초과되었습니다',
            API_ERROR_CODES.SERVICE_UNAVAILABLE,
            408
          )
        }

        throw error
      }
    }

    // 재시도 로직 적용
    return ErrorRecovery.withRetry(makeRequest, retries)
  }

  private async handleHttpError(response: Response): Promise<never> {
    let errorData: ApiResponse
    
    try {
      errorData = await response.json()
    } catch {
      // JSON 파싱 실패 시 기본 에러 메시지
      throw new AppError(
        `HTTP ${response.status}: ${response.statusText}`,
        API_ERROR_CODES.INTERNAL_SERVER_ERROR,
        response.status
      )
    }

    const error = errorData.error || {
      code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: response.statusText
    }

    throw new AppError(
      error.message,
      error.code,
      response.status,
      true,
      error.details
    )
  }

  // HTTP 메소드별 편의 메소드들
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // 파일 업로드용 특별 메소드
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    config?: Omit<RequestConfig, 'headers'>
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동 설정)
    const { 'Content-Type': _, ...headersWithoutContentType } = this.defaultHeaders as any

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        ...headersWithoutContentType,
        ...config?.headers
      }
    })
  }

  // 스트리밍 데이터 처리용 메소드
  async stream(
    endpoint: string,
    onData: (chunk: string) => void,
    config?: RequestConfig
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...config,
      headers: {
        ...this.defaultHeaders,
        ...config?.headers
      }
    })

    if (!response.ok) {
      await this.handleHttpError(response)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new AppError('스트림을 읽을 수 없습니다', API_ERROR_CODES.INTERNAL_SERVER_ERROR)
    }

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        onData(chunk)
      }
    } finally {
      reader.releaseLock()
    }
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient()

// 개발 환경에서 요청/응답 로깅
if (process.env.NODE_ENV === 'development') {
  const originalRequest = apiClient['request']
  apiClient['request'] = async function<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    console.group(`🌐 API Request: ${config.method || 'GET'} ${endpoint}`)
    console.log('Config:', config)
    
    const startTime = Date.now()
    try {
      const result = await originalRequest.call(this, endpoint, config)
      const duration = Date.now() - startTime
      console.log(`✅ Success (${duration}ms):`, result)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Error (${duration}ms):`, error)
      throw error
    } finally {
      console.groupEnd()
    }
  }
}