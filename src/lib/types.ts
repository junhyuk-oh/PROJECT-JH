/**
 * 인테리어 프로젝트 관리 시스템 타입 정의
 */

// 프로젝트 타입
export interface Project {
  id: string
  name: string
  type: ProjectType
  startDate: Date
  budget: number
  area: number
  currentState: string
  totalDuration: number
  createdAt: string
  updatedAt?: string
}

// 프로젝트 유형
export type ProjectType = 
  | 'residential'  // 주거공간
  | 'bathroom'     // 욕실
  | 'kitchen'      // 주방
  | 'commercial'   // 상업공간

// 작업 타입
export interface Task {
  id: string
  name: string
  type: TaskType
  duration: number
  dependencies: string[]
  startDate?: Date
  endDate?: Date
  earlyStart?: number
  earlyFinish?: number
  lateStart?: number
  lateFinish?: number
  slack?: number
  isCritical?: boolean
  vendor?: TaskVendor
  progress?: number // 진행률 (0-100)
  // 신규 필드 - 작업 제약사항 및 상세정보
  timeConstraints?: {
    workingHours?: string // "09:00-18:00"
    restrictedDays?: number[] // [0, 6] 일요일, 토요일
  }
  weatherDependent?: boolean
  noiseLevel?: 'high' | 'medium' | 'low'
  diyPossible?: boolean
  diyDifficulty?: 'easy' | 'medium' | 'hard' | 'expert'
  criticalNotes?: string[]
  minimumWorkers?: number
  dryingTime?: number // 건조/양생 시간 (시간 단위)
  costRange?: {
    min: number
    max: number
    unit?: string // "평당", "개당" 등
  }
}

// 작업 유형
export type TaskType = 
  | 'preparation'      // 준비
  | 'protection'       // 양생
  | 'demolition'       // 철거
  | 'plumbing'         // 배관/설비
  | 'electrical'       // 전기
  | 'waterproofing'    // 방수
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
  | 'inspection'       // 검수
  | 'other'            // 기타

// 작업 업체 정보
export interface TaskVendor {
  name: string
  contact: string
  phone: string
  cost?: number
  workingHours?: string // "09:00-18:00"
  holidays?: number[] // 휴무일 [0, 6]
  minimumBookingDays?: number // 최소 예약 필요일
}

// 업체 정보 (상세)
export interface Contractor {
  id: string
  name: string
  specialty: TaskType[]
  phone: string
  email: string
  rating: number
  priceRange: 'low' | 'medium' | 'high'
  workingHours: string
  holidays: number[]
  minimumBookingDays: number
  certifications?: string[]
}

// 가격 범위
export interface PriceRange {
  min: number
  max: number
  unit?: string
}

// 시간 제약
export interface TimeConstraints {
  workingHours?: string
  restrictedDays?: number[]
}

// 프로젝트 진행 상태
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
} as const

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS]

// 일정 타입
export interface Schedule {
  projectId: string
  tasks: ScheduledTask[]
  criticalPath: string[]
  totalDuration: number
  startDate: Date
  endDate: Date
  createdAt: Date
}

// 스케줄된 작업
export interface ScheduledTask extends Task {
  startDate: Date
  endDate: Date
  status: TaskStatus
}

// 작업 상태
export type TaskStatus = 
  | 'pending'      // 대기중
  | 'in_progress'  // 진행중
  | 'completed'    // 완료
  | 'delayed'      // 지연
  | 'cancelled'    // 취소

// 일정 생성 옵션
export interface ScheduleOptions {
  projectType: ProjectType
  area: number
  budget: number
  startDate: Date
  preferences?: {
    workingDays?: number[]  // 작업 가능 요일 (0: 일요일, 6: 토요일)
    holidays?: Date[]       // 공휴일
    priority?: 'speed' | 'cost' | 'quality'
  }
}

// CPM 계산 결과
export interface CPMResult {
  tasks: Task[]
  criticalPath: string[]
  totalDuration: number
  projectStart: Date
  projectEnd: Date
}

// 간트차트 설정
export interface GanttChartSettings {
  showCriticalPath: boolean
  showDependencies: boolean
  showVendorInfo: boolean
  zoomLevel: 'day' | 'week' | 'month'
}

// AI 추천 결과
export interface AIRecommendation {
  type: 'schedule' | 'vendor' | 'budget' | 'risk'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionItems?: string[]
}

// 대시보드 통계
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  upcomingTasks: number
  delayedTasks: number
  totalBudget: number
  spentBudget: number
}