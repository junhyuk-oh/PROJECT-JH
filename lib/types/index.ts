// 통합 타입 익스포트 파일
// 모든 타입들을 중앙에서 관리하고 익스포트

// 프로젝트 관련 타입들
export type {
  ProjectBasicInfo,
  SpaceSelection,
  StyleSelection,
  ScheduleInfo,
  ProjectData,
  GeneratedTask,
  GanttChartData
} from './project'

// API 관련 타입들
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectResponse,
  UpdateProjectRequest,
  GenerateScheduleRequest,
  GenerateScheduleResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  FileUploadRequest,
  FileUploadResponse,
  ApiErrorCode
} from './api'

// UI 상태 관리 타입들
export type {
  LoadingState,
  ErrorState,
  FormValidation,
  ModalState,
  ToastNotification,
  PaginationState,
  SortState,
  FilterState,
  SearchState,
  ProjectCreationFlow,
  ScheduleGenerationState,
  GanttChartState,
  ThemeConfig,
  UserPreferences,
  NavigationState,
  DataTableState,
  FileUploadState,
  AppState,
  BaseComponentProps,
  InteractiveComponentProps,
  FormComponentProps
} from './ui'

// 상수들
export {
  ROOM_AREA_RATIOS,
  TASK_DEPENDENCIES,
  BASE_TASK_DURATIONS,
  HOUSING_TYPES,
  RESIDENCE_STATUS,
  WORK_PRIORITIES,
  PROJECT_STATUS,
  TASK_CATEGORY_COLORS,
  NOTIFICATION_TYPES,
  VALIDATION_RULES
} from './constants'

// API 에러 코드
export { API_ERROR_CODES } from './api'

// 레거시 호환성을 위한 기본 익스포트들 (기존 import 경로 유지)
export type {
  ProjectBasicInfo as ProjectBasicInfoLegacy,
  SpaceSelection as SpaceSelectionLegacy,
  GeneratedTask as GeneratedTaskLegacy,
  GanttChartData as GanttChartDataLegacy
} from './project'

export {
  ROOM_AREA_RATIOS as ROOM_AREA_RATIOS_LEGACY,
  TASK_DEPENDENCIES as TASK_DEPENDENCIES_LEGACY,
  BASE_TASK_DURATIONS as BASE_TASK_DURATIONS_LEGACY
} from './constants'