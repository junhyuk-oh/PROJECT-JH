/**
 * 캘린더 관련 상수 통합
 */

export * from './taskTypes'
export * from './taskStatus'

// 캘린더 뷰 관련 상수
export const CALENDAR_VIEW = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
} as const

// 작업 표시 관련 상수
export const TASK_DISPLAY = {
  MAX_ICONS_PER_DATE: 3,
  ARROW_SYMBOLS: {
    START: '→',
    ONGOING: '━',
    END: '←'
  }
} as const

// 날짜 포맷
export const DATE_FORMATS = {
  FULL_DATE: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  },
  SHORT_DATE: {
    month: 'numeric',
    day: 'numeric'
  },
  MONTH_YEAR: {
    year: 'numeric',
    month: 'long'
  }
} as const

// 특수 표시 아이콘
export const SPECIAL_INDICATORS = {
  CRITICAL_PATH: '⭐',
  NOISE_WORK: '🔊',
  DRYING_TIME: '🕐',
  WEATHER_DEPENDENT: '🌤️'
} as const