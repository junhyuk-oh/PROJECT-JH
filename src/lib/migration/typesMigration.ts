/**
 * 타입 마이그레이션 헬퍼
 * 기존 코드를 새로운 타입 시스템으로 점진적 마이그레이션
 */

// 기존 타입을 새 타입으로 매핑
export * from '@/types'

// 레거시 타입 호환성을 위한 별칭
export type {
  Task,
  Project,
  ProjectFormData,
  ScheduleOptions,
  TaskVendor,
  Contractor,
  SimulationResult
} from '@/types'