// UI 상태 관리 관련 타입 정의

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface ErrorState {
  hasError: boolean
  error?: Error | null
  errorCode?: string
  message?: string
  retryCount?: number
}

export interface FormValidation {
  isValid: boolean
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  isSubmitting: boolean
}

export interface ModalState {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  dismissible?: boolean
}

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  [key: string]: any
}

export interface SearchState {
  query: string
  filters: FilterState
  sort: SortState
  pagination: PaginationState
}

// 프로젝트 생성 플로우 상태
export interface ProjectCreationFlow {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  isComplete: boolean
  stepData: {
    basicInfo?: any
    spaces?: any[]
    schedule?: any
    style?: any
  }
  validation: {
    [stepNumber: number]: FormValidation
  }
}

// 스케줄 생성 상태
export interface ScheduleGenerationState {
  status: 'idle' | 'analyzing' | 'generating' | 'complete' | 'error'
  progress: number
  currentTask?: string
  result?: {
    tasks: any[]
    ganttData: any
    criticalPath: string[]
    totalDays: number
    insights: any
  }
  error?: ErrorState
}

// 간트차트 UI 상태
export interface GanttChartState {
  timeRange: {
    start: Date
    end: Date
  }
  viewMode: 'day' | 'week' | 'month'
  selectedTasks: string[]
  highlightedCriticalPath: boolean
  zoomLevel: number
  showDependencies: boolean
  showMilestones: boolean
  groupBy: 'space' | 'category' | 'none'
}

// 테마 설정
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
  fontSize: 'sm' | 'md' | 'lg'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  animations: boolean
}

// 사용자 설정
export interface UserPreferences {
  theme: ThemeConfig
  language: 'ko' | 'en'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    analytics: boolean
    marketing: boolean
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    fontSize: 'normal' | 'large' | 'xlarge'
  }
}

// 네비게이션 상태
export interface NavigationState {
  currentPath: string
  breadcrumbs: Array<{
    label: string
    href: string
    isActive: boolean
  }>
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
}

// 데이터 테이블 상태
export interface DataTableState<T = any> {
  data: T[]
  loading: LoadingState
  error: ErrorState
  selection: {
    selectedIds: string[]
    allSelected: boolean
  }
  search: SearchState
  columns: Array<{
    key: string
    label: string
    sortable: boolean
    filterable: boolean
    visible: boolean
    width?: number
  }>
}

// 파일 업로드 상태
export interface FileUploadState {
  files: Array<{
    id: string
    file: File
    status: 'pending' | 'uploading' | 'success' | 'error'
    progress: number
    url?: string
    error?: string
  }>
  maxFiles: number
  maxSize: number
  acceptedTypes: string[]
  multiple: boolean
}

// 전역 앱 상태
export interface AppState {
  user: {
    isAuthenticated: boolean
    profile: any | null
    preferences: UserPreferences
  }
  navigation: NavigationState
  notifications: ToastNotification[]
  loading: {
    global: LoadingState
    components: Record<string, LoadingState>
  }
  errors: {
    global: ErrorState
    components: Record<string, ErrorState>
  }
}

// 컴포넌트 props 기본 타입들
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  testId?: string
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
}

export interface FormComponentProps extends BaseComponentProps {
  name: string
  value?: any
  onChange?: (value: any) => void
  onBlur?: () => void
  error?: string | string[]
  required?: boolean
  disabled?: boolean
}