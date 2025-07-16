// 상수 정의 (기존 types.ts에서 분리)

// 방 타입별 면적 비율
export const ROOM_AREA_RATIOS = {
  living_room: 0.25,    // 거실: 25% (40평 기준 10평)
  kitchen: 0.08,        // 주방: 8% (40평 기준 3.2평)
  master_bedroom: 0.15, // 안방: 15% (40평 기준 6평)
  small_bedroom: 0.10,  // 작은방: 10% (40평 기준 4평)
  bathroom: 0.05,       // 욕실: 5% (40평 기준 2평)
  entrance: 0.03,       // 현관: 3% (40평 기준 1.2평)
  balcony: 0.04         // 발코니: 4% (40평 기준 1.6평)
} as const;

// 작업 의존성 규칙
export const TASK_DEPENDENCIES = {
  demolition: [],
  electrical: ['demolition'],
  plumbing: ['demolition'],
  carpentry: ['electrical', 'plumbing'],
  painting: ['carpentry'],
  flooring: ['painting'],
  lighting: ['electrical', 'painting'],
  cleanup: ['flooring', 'lighting']
} as const;

// 작업별 기본 소요 시간 (일)
export const BASE_TASK_DURATIONS = {
  demolition: { perSqm: 0.1, minimum: 1, maximum: 5 },
  electrical: { perSqm: 0.2, minimum: 2, maximum: 7 },
  plumbing: { perSqm: 0.3, minimum: 1, maximum: 5 },
  carpentry: { perSqm: 0.4, minimum: 3, maximum: 10 },
  painting: { perSqm: 0.2, minimum: 2, maximum: 8 },
  flooring: { perSqm: 0.3, minimum: 2, maximum: 6 },
  lighting: { perSqm: 0.1, minimum: 1, maximum: 3 },
  cleanup: { perSqm: 0.05, minimum: 1, maximum: 2 }
} as const;

// 주택 유형별 설정
export const HOUSING_TYPES = {
  apartment: {
    label: '아파트',
    description: '일반적인 아파트 단지',
    characteristics: ['표준화된 구조', '엘리베이터 이용', '층간소음 주의']
  },
  house: {
    label: '단독주택',
    description: '독립된 주택',
    characteristics: ['자유로운 구조 변경', '마당 활용 가능', '프라이버시 우수']
  },
  villa: {
    label: '빌라',
    description: '다세대/다가구 주택',
    characteristics: ['층수 제한', '주차 공간 고려', '이웃과의 조화']
  },
  officetel: {
    label: '오피스텔',
    description: '주거와 업무가 가능한 건물',
    characteristics: ['작은 공간 효율성', '상업 지역 위치', '다목적 공간']
  }
} as const;

// 거주 상태별 설정
export const RESIDENCE_STATUS = {
  occupied: {
    label: '거주 중',
    description: '현재 살고 있는 상태',
    constraints: ['생활 공간 확보 필요', '소음 제한 시간', '일부 공간 접근 제한']
  },
  empty: {
    label: '비어있음',
    description: '아무도 살지 않는 상태',
    advantages: ['자유로운 작업 시간', '전체 공간 접근 가능', '소음 제약 없음']
  },
  moving_in: {
    label: '이사 예정',
    description: '곧 이사할 예정',
    considerations: ['이사 일정 조율', '필수 시설 우선 완료', '단계적 진행']
  }
} as const;

// 작업 우선순위별 설정
export const WORK_PRIORITIES = {
  quality: {
    label: '품질 중심',
    description: '높은 품질의 마감 우선',
    characteristics: ['꼼꼼한 작업', '프리미엄 자재', '충분한 시간 확보']
  },
  speed: {
    label: '신속 완료',
    description: '빠른 완공 우선',
    characteristics: ['병렬 작업 최대화', '효율적 자재', '집중적 인력 투입']
  },
  minimal_disruption: {
    label: '생활 불편 최소화',
    description: '일상생활 방해 최소화',
    characteristics: ['공간별 순차 진행', '소음 최소화', '임시 공간 확보']
  }
} as const;

// 프로젝트 상태별 설정
export const PROJECT_STATUS = {
  draft: {
    label: '초안',
    description: '프로젝트 계획 수립 중',
    color: '#6b7280',
    allowedActions: ['edit', 'delete', 'submit']
  },
  analyzing: {
    label: '분석 중',
    description: 'AI가 최적 계획을 생성 중',
    color: '#3b82f6',
    allowedActions: ['cancel']
  },
  completed: {
    label: '계획 완료',
    description: '최적화된 계획이 준비됨',
    color: '#10b981',
    allowedActions: ['view', 'export', 'start_project']
  },
  in_progress: {
    label: '진행 중',
    description: '실제 공사가 진행 중',
    color: '#f59e0b',
    allowedActions: ['view', 'update_progress', 'pause']
  }
} as const;

// 작업 카테고리별 색상
export const TASK_CATEGORY_COLORS = {
  demolition: '#ef4444',    // 빨강 - 철거
  electrical: '#f59e0b',    // 주황 - 전기
  plumbing: '#3b82f6',      // 파랑 - 배관
  carpentry: '#8b5cf6',     // 보라 - 목공
  painting: '#10b981',      // 초록 - 도장
  flooring: '#f97316',      // 주황 - 바닥
  lighting: '#eab308',      // 노랑 - 조명
  cleanup: '#6b7280'        // 회색 - 정리
} as const;

// 알림 유형별 설정
export const NOTIFICATION_TYPES = {
  success: {
    color: '#10b981',
    icon: 'CheckCircle',
    duration: 5000
  },
  error: {
    color: '#ef4444',
    icon: 'XCircle',
    duration: 0 // 수동으로 닫을 때까지
  },
  warning: {
    color: '#f59e0b',
    icon: 'AlertTriangle',
    duration: 7000
  },
  info: {
    color: '#3b82f6',
    icon: 'Info',
    duration: 5000
  }
} as const;

// 폼 유효성 검사 규칙
export const VALIDATION_RULES = {
  totalArea: {
    min: 10,
    max: 200,
    required: true,
    message: '전체 면적은 10평 이상 200평 이하여야 합니다.'
  },
  projectDuration: {
    required: true,
    message: '프로젝트 기간을 선택해주세요.'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
    message: '유효한 이메일 주소를 입력해주세요.'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    required: true,
    message: '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.'
  },
  phone: {
    pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
    message: '올바른 휴대폰 번호를 입력해주세요.'
  }
} as const;