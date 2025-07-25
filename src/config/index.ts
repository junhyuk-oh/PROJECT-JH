/**
 * SELFFIN 애플리케이션 설정
 */

export const APP_CONFIG = {
  // 앱 기본 정보
  name: 'SELFFIN',
  description: '반셀프 인테리어 일정 관리 플랫폼',
  version: '1.0.0',
  
  // API 설정
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 30000, // 30초
  },
  
  // 스토리지 키
  storage: {
    projects: 'projects',
    settings: 'settings',
    theme: 'theme',
  },
  
  // 날짜/시간 설정
  date: {
    locale: 'ko-KR',
    timezone: 'Asia/Seoul',
    format: {
      short: 'MM/dd',
      medium: 'yyyy년 MM월 dd일',
      long: 'yyyy년 MM월 dd일 EEEE',
    },
  },
  
  // 프로젝트 설정
  project: {
    types: {
      residential: { label: '주거공간', icon: '🏠' },
      bathroom: { label: '욕실', icon: '🚿' },
      kitchen: { label: '주방', icon: '🍳' },
      commercial: { label: '상업공간', icon: '🏢' },
    },
    defaultDuration: 30, // 기본 공사 기간 (일)
    maxDuration: 365, // 최대 공사 기간 (일)
  },
  
  // 작업 설정
  task: {
    // 작업 타입별 기본 기간 (일)
    defaultDurations: {
      preparation: 1,
      protection: 1,
      demolition: 2,
      plumbing: 3,
      electrical: 3,
      framing: 2,
      flooring: 2,
      tiling: 3,
      painting: 2,
      wallpaper: 1,
      kitchen: 2,
      bathroom: 2,
      inspection: 1,
      waterproofing: 1,
      wall: 2,
      ceiling: 2,
      furniture: 1,
      appliance: 1,
      window: 1,
      cleaning: 1,
    },
    // 소음 작업 가능 시간
    noiseWorkHours: {
      start: 9, // 오전 9시
      end: 18, // 오후 6시
    },
  },
  
  // UI 설정
  ui: {
    // 간트차트 설정
    gantt: {
      dayWidth: 40,
      rowHeight: 50,
      headerHeight: 80,
      leftPanelWidth: 200,
    },
    // 캘린더 설정
    calendar: {
      defaultView: 'month' as const,
      weekStartsOn: 0, // 0 = 일요일
    },
    // 애니메이션 설정
    animation: {
      duration: 200, // ms
      easing: 'ease-in-out',
    },
  },
  
  // 시뮬레이션 설정
  simulation: {
    monteCarloIterations: 1000,
    confidenceLevels: {
      optimistic: 10, // P10
      realistic: 50, // P50
      pessimistic: 90, // P90
    },
  },
  
  // 리스크 임계값
  risk: {
    delayThreshold: 10, // 10% 이상 지연 시 리스크
    criticalPathRatio: 0.5, // 전체 작업의 50% 이상이 임계경로일 때
  },
  
  // 페이지네이션
  pagination: {
    defaultLimit: 20,
    limits: [10, 20, 50, 100],
  },
  
  // 검증 규칙
  validation: {
    project: {
      name: {
        min: 2,
        max: 50,
      },
      budget: {
        min: 1000000, // 100만원
        max: 10000000000, // 100억원
      },
      area: {
        min: 1,
        max: 1000,
      },
    },
  },
  
  // 기능 플래그
  features: {
    ai: false, // AI 기능 활성화 여부
    weather: false, // 날씨 API 연동
    collaboration: false, // 협업 기능
    export: true, // 내보내기 기능
    import: true, // 가져오기 기능
  },
} as const

export type AppConfig = typeof APP_CONFIG