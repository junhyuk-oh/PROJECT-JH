/**
 * 인테리어 프로젝트 관련 상수 정의
 */

// 작업 시간 관련 상수
export const WORKING_HOURS = {
  DEFAULT_START: '09:00',
  DEFAULT_END: '18:00',
  EARLY_START: '08:00',
  LATE_END: '19:00'
} as const

// 요일 상수
export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
} as const

// 작업 소음 레벨
export const NOISE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none'
} as const

// DIY 난이도
export const DIY_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
} as const

// 가격 범위
export const PRICE_RANGES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

// 기본 설정값
export const DEFAULT_VALUES = {
  MIN_WORKERS: 1,
  MAX_WORKERS: 5,
  MIN_BOOKING_DAYS: 1,
  MAX_BOOKING_DAYS: 14,
  DRYING_TIME_UNIT: 'hours',
  CURRENCY_UNIT: 'KRW'
} as const

// 프로젝트 규모별 승수
export const SIZE_MULTIPLIERS = {
  SMALL: 0.8,    // 20평 이하
  MEDIUM: 1.0,   // 20-30평
  LARGE: 1.2,    // 30-40평
  XLARGE: 1.5    // 40평 이상
} as const

// 공정 순서 (옵시디언 가이드 기반)
export const PROCESS_ORDER = [
  'preparation',     // 준비
  'protection',      // 양생
  'demolition',      // 철거
  'window',          // 창호 (제작 기간 고려)
  'plumbing',        // 설비
  'electrical',      // 전기
  'waterproofing',   // 방수
  'carpentry',       // 목공
  'tile',            // 타일
  'painting',        // 페인트
  'flooring',        // 바닥
  'wallpaper',       // 도배
  'furniture',       // 가구
  'appliance',       // 가전
  'lighting',        // 조명
  'cleaning',        // 청소
  'inspection'       // 검수
] as const

// 병렬 진행 가능한 작업 조합
export const PARALLEL_TASKS = [
  ['electrical', 'plumbing'],
  ['painting', 'flooring'],
  ['furniture', 'lighting']
] as const

// 날씨 영향을 받는 작업 타입
export const WEATHER_DEPENDENT_TASKS = [
  'waterproofing',
  'painting',
  'wallpaper'
] as const

// 예산 단위
export const BUDGET_UNITS = {
  TOTAL: '총액',
  PER_PYEONG: '평당',
  PER_UNIT: '개당',
  PER_SET: '세트당'
} as const