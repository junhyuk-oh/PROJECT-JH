/**
 * 통합 상수 정의
 */

// ============================================
// 작업 관련 상수
// ============================================

export const TASK_ICONS: Record<string, string> = {
  preparation: '📋',
  protection: '🛡️',
  demolition: '🔨',
  plumbing: '🔧',
  electrical: '⚡',
  framing: '🏗️',
  flooring: '🪵',
  tiling: '🧱',
  painting: '🎨',
  wallpaper: '🖼️',
  kitchen: '🍳',
  bathroom: '🚿',
  inspection: '✅',
  waterproofing: '💧',
  wall: '🧱',
  ceiling: '🏠',
  furniture: '🪑',
  appliance: '🔌',
  window: '🪟',
  cleaning: '🧹',
}

export const TASK_TYPE_LABELS: Record<string, string> = {
  preparation: '준비작업',
  protection: '양생작업',
  demolition: '철거',
  plumbing: '배관',
  electrical: '전기',
  framing: '목공',
  flooring: '바닥재',
  tiling: '타일',
  painting: '도장',
  wallpaper: '도배',
  kitchen: '주방',
  bathroom: '욕실',
  inspection: '검사',
  waterproofing: '방수',
  wall: '벽체',
  ceiling: '천장',
  furniture: '가구',
  appliance: '가전',
  window: '창호',
  cleaning: '청소',
}

export const TASK_COLORS: Record<string, string> = {
  demolition: '#DC2626',
  plumbing: '#059669',
  electrical: '#FBBF24',
  framing: '#7C3AED',
  flooring: '#92400E',
  tiling: '#0891B2',
  painting: '#E11D48',
  wallpaper: '#7C2D12',
  kitchen: '#EA580C',
  bathroom: '#0E7490',
  preparation: '#6B7280',
  protection: '#6B7280',
  inspection: '#059669',
  waterproofing: '#1E40AF',
  wall: '#7C3AED',
  ceiling: '#7C3AED',
  furniture: '#92400E',
  appliance: '#6366F1',
  window: '#0891B2',
  cleaning: '#10B981',
  // Gantt chart specific colors
  critical: '#DC2626',
  completed: '#10B981',
  inProgress: '#F59E0B',
  pending: '#3B82F6',
}

// ============================================
// 상태 관련 상수
// ============================================

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
} as const

export const STATUS_COLORS = {
  [TASK_STATUS.PENDING]: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  [TASK_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  [TASK_STATUS.DELAYED]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
}

export const STATUS_LABELS = {
  [TASK_STATUS.PENDING]: '대기',
  [TASK_STATUS.IN_PROGRESS]: '진행중',
  [TASK_STATUS.COMPLETED]: '완료',
  [TASK_STATUS.DELAYED]: '지연',
}

// ============================================
// 프로젝트 관련 상수
// ============================================

export const PROJECT_TYPES = {
  RESIDENTIAL: 'residential',
  BATHROOM: 'bathroom',
  KITCHEN: 'kitchen',
  COMMERCIAL: 'commercial',
} as const

export const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPES.RESIDENTIAL]: '주거공간',
  [PROJECT_TYPES.BATHROOM]: '욕실',
  [PROJECT_TYPES.KITCHEN]: '주방',
  [PROJECT_TYPES.COMMERCIAL]: '상업공간',
}

export const PROJECT_TYPE_ICONS = {
  [PROJECT_TYPES.RESIDENTIAL]: '🏠',
  [PROJECT_TYPES.BATHROOM]: '🚿',
  [PROJECT_TYPES.KITCHEN]: '🍳',
  [PROJECT_TYPES.COMMERCIAL]: '🏢',
}

// ============================================
// 날씨 관련 상수
// ============================================

export const WEATHER_CONDITIONS = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAINY: 'rainy',
  SNOWY: 'snowy',
  STORMY: 'stormy',
} as const

export const WEATHER_ICONS = {
  [WEATHER_CONDITIONS.SUNNY]: '☀️',
  [WEATHER_CONDITIONS.CLOUDY]: '☁️',
  [WEATHER_CONDITIONS.RAINY]: '🌧️',
  [WEATHER_CONDITIONS.SNOWY]: '❄️',
  [WEATHER_CONDITIONS.STORMY]: '⛈️',
}

// ============================================
// 리스크 관련 상수
// ============================================

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export const RISK_COLORS = {
  [RISK_LEVELS.LOW]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: '🟢',
  },
  [RISK_LEVELS.MEDIUM]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: '🟡',
  },
  [RISK_LEVELS.HIGH]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '🔴',
  },
}

export const RISK_LABELS = {
  [RISK_LEVELS.LOW]: '낮음',
  [RISK_LEVELS.MEDIUM]: '보통',
  [RISK_LEVELS.HIGH]: '높음',
}

// ============================================
// UI 관련 상수
// ============================================

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const

export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
} as const

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: {
    default: 'ease-in-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ============================================
// 에러 메시지
// ============================================

export const ERROR_MESSAGES = {
  NETWORK: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
  NOT_FOUND: '요청하신 내용을 찾을 수 없습니다.',
  VALIDATION: '입력한 정보를 다시 확인해주세요.',
  PERMISSION: '권한이 없습니다.',
} as const

// ============================================
// 성공 메시지
// ============================================

export const SUCCESS_MESSAGES = {
  SAVE: '저장되었습니다.',
  DELETE: '삭제되었습니다.',
  UPDATE: '수정되었습니다.',
  CREATE: '생성되었습니다.',
} as const