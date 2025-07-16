// 레거시 호환성을 위한 타입 re-export
// 새로운 모듈화된 타입 시스템으로 마이그레이션 중

// 기존 import 경로 호환성을 위해 모든 타입들을 re-export
export type {
  ProjectBasicInfo,
  SpaceSelection,
  StyleSelection,
  ScheduleInfo,
  ProjectData,
  GeneratedTask,
  GanttChartData,
  ApiResponse,
  ApiError,
  LoadingState,
  ErrorState,
  FormValidation
} from './types/index'

export {
  ROOM_AREA_RATIOS,
  TASK_DEPENDENCIES,
  BASE_TASK_DURATIONS,
  API_ERROR_CODES
} from './types/index'

// 새로운 타입 시스템 사용을 권장하는 주석
// TODO: 새로운 프로젝트에서는 '@/lib/types'에서 직접 import하여 사용하세요
// 예: import { ProjectBasicInfo, ROOM_AREA_RATIOS } from '@/lib/types'