/**
 * 작업 타입 관련 상수
 */

// 작업 타입별 이모지 아이콘
export const TASK_ICONS: Record<string, string> = {
  demolition: '🔨',      // 철거
  electrical: '⚡',      // 전기
  plumbing: '🚿',       // 설비
  waterproofing: '💧',  // 방수
  tile: '🏠',           // 타일
  painting: '🎨',       // 페인트
  flooring: '🪵',       // 바닥
  carpentry: '🔧',      // 목공
  wallpaper: '📋',      // 도배
  furniture: '🪑',      // 가구
  appliance: '🔌',      // 가전
  lighting: '💡',       // 조명
  cleaning: '🧹',       // 청소
  preparation: '📝',    // 준비
  protection: '🛡️'      // 보호
} as const

// 작업 타입별 색상
export const TASK_TYPE_COLORS: Record<string, string> = {
  demolition: '#EF4444',     // 빨강
  electrical: '#F59E0B',     // 주황
  plumbing: '#3B82F6',      // 파랑
  waterproofing: '#06B6D4', // 하늘
  tile: '#8B5CF6',          // 보라
  painting: '#EC4899',      // 핑크
  flooring: '#84CC16',      // 연두
  carpentry: '#F97316',     // 진한주황
  wallpaper: '#A78BFA',     // 연보라
  furniture: '#6366F1',     // 남색
  appliance: '#14B8A6',     // 청록
  lighting: '#FBBF24',      // 노랑
  cleaning: '#10B981',      // 초록
  preparation: '#9CA3AF',   // 회색
  protection: '#6B7280'     // 진회색
} as const

// 작업 타입 한글 매핑
export const TASK_TYPE_LABELS: Record<string, string> = {
  demolition: '철거',
  electrical: '전기',
  plumbing: '설비',
  waterproofing: '방수',
  tile: '타일',
  painting: '페인트',
  flooring: '바닥재',
  carpentry: '목공',
  wallpaper: '도배',
  furniture: '가구',
  appliance: '가전',
  lighting: '조명',
  cleaning: '청소',
  preparation: '준비',
  protection: '보호'
} as const

// 작업 타입별 기본 설정
export const TASK_TYPE_CONFIG = {
  // 소음이 높은 작업들
  noisyTasks: ['demolition', 'carpentry', 'drilling'],
  
  // 날씨에 민감한 작업들
  weatherSensitiveTasks: ['painting', 'waterproofing', 'wallpaper'],
  
  // 건조 시간이 필요한 작업들
  dryingRequiredTasks: ['waterproofing', 'painting', 'tile'],
  
  // DIY 가능한 작업들
  diyPossibleTasks: ['painting', 'wallpaper', 'cleaning', 'preparation']
} as const