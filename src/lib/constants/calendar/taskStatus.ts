import { TaskStatus } from '@/lib/types'

/**
 * 작업 상태 관련 상수
 */

// 상태별 배경 색상
export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#E0E7FF',      // 연한 보라색
  in_progress: '#FEF3C7',  // 연한 노란색
  completed: '#D1FAE5',    // 연한 초록색
  delayed: '#FED7D7',      // 연한 빨간색
  cancelled: '#F7FAFC'     // 연한 회색
} as const

// 상태별 텍스트 색상
export const STATUS_TEXT_COLORS: Record<TaskStatus, string> = {
  pending: '#6366F1',      // 진한 보라색
  in_progress: '#F59E0B',  // 진한 노란색
  completed: '#10B981',    // 진한 초록색
  delayed: '#DC2626',      // 진한 빨간색
  cancelled: '#6B7280'     // 진한 회색
} as const

// 상태 한글 매핑
export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
  delayed: '지연',
  cancelled: '취소'
} as const

// 상태별 아이콘 (필요시 사용)
export const STATUS_ICONS = {
  pending: '⏳',
  in_progress: '🔄',
  completed: '✅',
  delayed: '⚠️',
  cancelled: '❌'
} as const

// 상태 우선순위 (정렬용)
export const STATUS_PRIORITY: Record<TaskStatus, number> = {
  delayed: 1,
  in_progress: 2,
  pending: 3,
  completed: 4,
  cancelled: 5
} as const