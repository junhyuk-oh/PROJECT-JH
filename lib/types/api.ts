// API 응답 관련 타입 정의

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 프로젝트 관련 API 타입들
export interface CreateProjectRequest {
  basicInfo: {
    totalArea: number
    housingType: 'apartment' | 'house' | 'villa' | 'officetel'
    buildingAge?: number
    residenceStatus: 'occupied' | 'empty' | 'moving_in'
    preferredStyle: string
    projectDuration: string
    workPriority?: 'quality' | 'speed' | 'minimal_disruption'
  }
  spaces?: any[]
  schedule?: any
}

export interface CreateProjectResponse {
  projectId: string
  status: 'draft' | 'analyzing' | 'completed'
  estimatedCompletion: string
}

export interface GetProjectResponse {
  project: {
    id: string
    userId: string
    basicInfo: any
    spaces: any[]
    schedule?: any
    generatedSchedule?: any
    status: 'draft' | 'analyzing' | 'completed' | 'in_progress'
    createdAt: string
    updatedAt: string
  }
}

export interface UpdateProjectRequest {
  basicInfo?: Partial<CreateProjectRequest['basicInfo']>
  spaces?: any[]
  schedule?: any
}

// 스케줄 생성 API
export interface GenerateScheduleRequest {
  projectId: string
  spaces: any[]
  basicInfo: any
  scheduleInfo?: any
}

export interface GenerateScheduleResponse {
  scheduleId: string
  tasks: any[]
  ganttData: any
  criticalPath: string[]
  totalDays: number
  insights: {
    complexity: number
    warnings: string[]
    suggestions: string[]
    optimizations: string[]
    budgetImpact: number
  }
  generatedAt: string
}

// 사용자 인증 관련
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  token: string
  refreshToken: string
  expiresAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
}

export interface RegisterResponse {
  user: {
    id: string
    email: string
    name: string
  }
  message: string
}

// 파일 업로드 관련
export interface FileUploadRequest {
  file: File
  category: 'project_image' | 'reference_image' | 'document'
  projectId?: string
}

export interface FileUploadResponse {
  fileId: string
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string
}

// 에러 코드 상수
export const API_ERROR_CODES = {
  // 인증 관련
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 사용자 관련
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // 프로젝트 관련
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_ACCESS_DENIED: 'PROJECT_ACCESS_DENIED',
  INVALID_PROJECT_DATA: 'INVALID_PROJECT_DATA',
  
  // 스케줄 관련
  SCHEDULE_GENERATION_FAILED: 'SCHEDULE_GENERATION_FAILED',
  INVALID_SCHEDULE_DATA: 'INVALID_SCHEDULE_DATA',
  
  // 파일 관련
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // 시스템 관련
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // 유효성 검사
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT'
} as const

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]