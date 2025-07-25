/**
 * SELFFIN 프로젝트 중앙 타입 정의
 * 모든 타입은 이 파일에서 export하여 사용
 */

// ============================================
// 기본 엔티티 타입
// ============================================

/**
 * 작업(Task) 타입 정의
 */
export interface Task {
  id: string
  name: string
  type: TaskType
  duration: number
  startDate?: Date
  endDate?: Date
  dependencies: string[]
  resources?: string[]
  progress?: number
  isCritical?: boolean
  
  // CPM 계산을 위한 속성들
  earlyStart?: number
  earlyFinish?: number
  lateStart?: number
  lateFinish?: number
  
  // 추가 속성들
  timeConstraints?: TimeConstraint[]
  weatherDependent?: boolean
  noiseLevel?: 'low' | 'medium' | 'high'
  diyPossible?: boolean
  diyDifficulty?: 1 | 2 | 3 | 4 | 5
  criticalNotes?: string[]
  minimumWorkers?: number
  dryingTime?: number
  costRange?: {
    min: number
    max: number
  }
}

/**
 * 작업 타입 enum
 */
export type TaskType = 
  | 'preparation'      // 준비
  | 'protection'       // 양생
  | 'demolition'       // 철거
  | 'plumbing'         // 배관/설비
  | 'electrical'       // 전기
  | 'waterproofing'    // 방수
  | 'framing'          // 프레임
  | 'flooring'         // 바닥
  | 'painting'         // 도색
  | 'tile'             // 타일
  | 'carpentry'        // 목공
  | 'wallpaper'        // 도배
  | 'wall'             // 벽체
  | 'ceiling'          // 천장
  | 'furniture'        // 가구
  | 'appliance'        // 가전
  | 'window'           // 창호
  | 'lighting'         // 조명
  | 'cleaning'         // 청소
  | 'kitchen'          // 주방
  | 'bathroom'         // 욕실
  | 'inspection'       // 검수
  | 'other'            // 기타

/**
 * 시간 제약 조건
 */
export interface TimeConstraint {
  type: 'work_hours' | 'no_weekend' | 'weather' | 'drying'
  description: string
}

/**
 * 일정 데이터
 */
export interface ScheduleData {
  schedule: Task[]
  criticalPath: string[]
  totalDuration: number
}

/**
 * 프로젝트 타입
 */
export interface Project {
  id: string
  name: string
  type: ProjectType
  startDate: Date
  budget: number
  area: number
  currentState: string
  specificRequirements?: string
  schedule: ScheduleData
  createdAt: string
  
  // 리스크 평가 정보
  weatherSensitivity?: number
  complexity?: 'simple' | 'normal' | 'complex'
  scheduleFlexibility?: 'flexible' | 'normal' | 'strict'
}

/**
 * 프로젝트 타입 enum
 */
export type ProjectType = 'residential' | 'bathroom' | 'kitchen' | 'commercial'

/**
 * 프로젝트 생성 폼 데이터
 */
export interface ProjectFormData {
  name: string
  type: ProjectType
  startDate: Date
  budget: number
  area: number
  currentState: string
  specificRequirements: string
  
  // 리스크 평가
  weatherSensitivity?: number
  complexity?: 'simple' | 'normal' | 'complex'
  scheduleFlexibility?: 'flexible' | 'normal' | 'strict'
}

// ============================================
// 스케줄링 관련 타입
// ============================================

/**
 * 스케줄 옵션
 */
export interface ScheduleOptions {
  projectType: ProjectType
  area: number
  budget: number
  startDate: Date
  currentState: string
  customTasks?: Task[]
  specificRequirements?: string
  
  // 리스크 평가
  weatherSensitivity?: number
  complexity?: 'simple' | 'normal' | 'complex'
  scheduleFlexibility?: 'flexible' | 'normal' | 'strict'
}

/**
 * CPM 분석 단계
 */
export interface AnalysisStep {
  id: string
  title: string
  description: string
  icon: string
  status: 'pending' | 'processing' | 'completed'
  progress?: number
}

// ============================================
// 시뮬레이션 관련 타입
// ============================================

/**
 * Monte Carlo 시뮬레이션 결과
 */
export interface SimulationResult {
  p10: number      // 10% 확률로 완료되는 기간
  p50: number      // 50% 확률로 완료되는 기간 (중앙값)
  p90: number      // 90% 확률로 완료되는 기간
  mean: number     // 평균 완료 기간
  stdDev: number   // 표준편차
  histogram: number[] // 히스토그램 데이터
  confidence: number  // 신뢰도 (0-100)
  minDuration: number // 최소 기간
  maxDuration: number // 최대 기간
}

/**
 * 작업 변동성 정보
 */
export interface TaskVariation {
  taskId: string
  optimistic: number    // 낙관적 추정 (최소 시간)
  mostLikely: number    // 가장 가능성 높은 시간
  pessimistic: number   // 비관적 추정 (최대 시간)
}

// ============================================
// 업체/계약자 관련 타입
// ============================================

/**
 * 업체 정보
 */
export interface Contractor {
  id: string
  name: string
  specialty: string[]
  rating: number
  priceLevel: '저가' | '중간' | '고가'
  availability: 'immediate' | 'busy' | 'booked'
  contact: string
  portfolio?: string[]
  workingHours?: string
  holidays?: string[]
  minimumBookingDays?: number
}

/**
 * 작업 업체 정보 (레거시 호환)
 */
export interface TaskVendor {
  id: string
  name: string
  contact: string
  specialty: string[]
  rating: number
  priceLevel: string
  availability: string
  workingHours?: string
  holidays?: string[]
  minimumBookingDays?: number
}

// ============================================
// UI/UX 관련 타입
// ============================================

/**
 * 네비게이션 아이템
 */
export interface NavItem {
  label: string
  href: string
  icon: (props: { className?: string }) => React.ReactElement
}

/**
 * 프로젝트 필터 타입
 */
export type ProjectFilter = 'all' | 'in-progress' | 'completed'

/**
 * 일정 필터 타입
 */
export type ScheduleFilter = 'all' | 'today' | 'week' | 'month'


/**
 * 뷰 모드 타입
 */
export type ViewMode = 'gantt' | 'calendar' | 'list'

// ============================================
// 통계 관련 타입
// ============================================

/**
 * 작업 통계
 */
export interface TaskStatistics {
  total: number
  completed: number
  inProgress: number
  pending: number
  delayed: number
  todayTasks: Task[]
  weekTasks: Task[]
  criticalTasks: Task[]
  weatherDependentTasks: Task[]
}

/**
 * 프로젝트 상태
 */
export interface ProjectStatus {
  label: string
  color: string
  detail: string
}

// ============================================
// 리스크 관련 타입
// ============================================

/**
 * 리스크 요인
 */
export interface RiskFactor {
  id: string
  factor: string
  impact: 'high' | 'medium' | 'low'
  description: string
  icon: React.ReactNode
  mitigation: string
  action?: string
}

/**
 * What-if 시나리오
 */
export interface Scenario {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  adjustments: {
    taskDelays?: { [taskId: string]: number }
    globalDelay?: number
    resourceBoost?: number
    weatherImpact?: number
  }
  color: string
}

// ============================================
// API/서비스 관련 타입
// ============================================

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 페이지네이션 정보
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 부분적 업데이트를 위한 DeepPartial 타입
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>
} : T

/**
 * ID를 가진 엔티티의 기본 타입
 */
export interface Entity {
  id: string
  createdAt: string
  updatedAt?: string
}

/**
 * 로딩 상태 타입
 */
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

/**
 * 폼 필드 에러 타입
 */
export interface FormErrors {
  [field: string]: string | undefined
}