// 실제 인테리어 공사 단계와 순서
export interface ConstructionPhase {
  id: string
  name: string
  description: string
  order: number
  canRunParallel: boolean
  requiredSkills: string[]
  typicalDuration: { min: number; max: number } // days per 평
}

export interface TaskConfig {
  id: string
  name: string
  phase: string
  category: string
  dependencies: string[]
  durationPerSqm: number // days per 평
  minDuration: number
  maxDuration: number
  costPerSqm: number // KRW per 평
  materials: string[]
  skills: string[]
  canRunParallel: boolean
  requiresInspection: boolean
  dryingTime?: number // additional days for drying/curing
}

// 실제 공사 순서를 반영한 7단계 공정
export const CONSTRUCTION_PHASES: ConstructionPhase[] = [
  {
    id: 'demolition',
    name: '철거 및 해체',
    description: '기존 설비, 마감재, 구조물 철거',
    order: 1,
    canRunParallel: false,
    requiredSkills: ['철거기사', '안전관리자'],
    typicalDuration: { min: 0.3, max: 0.8 }
  },
  {
    id: 'roughing',
    name: '골조 및 배관/전기 1차',
    description: '구조 보강, 전기/배관 배선, 단열재',
    order: 2,
    canRunParallel: true,
    requiredSkills: ['전기기사', '배관기사', '목공기사'],
    typicalDuration: { min: 0.4, max: 1.0 }
  },
  {
    id: 'walls',
    name: '벽체 및 천장',
    description: '벽체 시공, 석고보드, 퍼티, 천장',
    order: 3,
    canRunParallel: false,
    requiredSkills: ['목공기사', '도배기사'],
    typicalDuration: { min: 0.5, max: 1.2 }
  },
  {
    id: 'flooring',
    name: '바닥재 시공',
    description: '마루, 타일, 카펫 등 바닥재 설치',
    order: 4,
    canRunParallel: false,
    requiredSkills: ['바닥재기사', '타일기사'],
    typicalDuration: { min: 0.3, max: 0.8 }
  },
  {
    id: 'painting',
    name: '도장 및 마감',
    description: '페인트, 도배, 벽지 등 벽면 마감',
    order: 5,
    canRunParallel: false,
    requiredSkills: ['도장기사', '도배기사'],
    typicalDuration: { min: 0.2, max: 0.6 }
  },
  {
    id: 'finishing',
    name: '마무리 공사',
    description: '전기/배관 마감, 조명, 가구 설치',
    order: 6,
    canRunParallel: true,
    requiredSkills: ['전기기사', '배관기사', '목공기사'],
    typicalDuration: { min: 0.3, max: 0.7 }
  },
  {
    id: 'completion',
    name: '청소 및 검수',
    description: '마무리 청소, 하자 점검, 인수인계',
    order: 7,
    canRunParallel: false,
    requiredSkills: ['청소업체', '감리'],
    typicalDuration: { min: 0.1, max: 0.3 }
  }
]

// 2024년 기준 실제 시공 단가 (서울 기준)
export const REALISTIC_COSTS = {
  // 철거 비용 (평당)
  demolition: {
    light: 80000,     // 가벽, 도배지만
    medium: 150000,   // 타일, 마루 포함
    heavy: 250000     // 욕실, 주방 전체
  },
  
  // 전기공사 (평당)
  electrical: {
    basic: 180000,    // 기본 배선
    standard: 280000, // 콘센트, 스위치 추가
    premium: 450000   // 스마트홈, 고급 조명
  },
  
  // 배관공사 (평당)
  plumbing: {
    basic: 120000,    // 기본 배관
    standard: 220000, // 급배수 교체
    premium: 380000   // 전체 교체 + 보일러
  },
  
  // 바닥재 (평당)
  flooring: {
    laminate: 180000,  // 강화마루
    engineered: 280000, // 엔지니어드 우드
    hardwood: 450000,  // 원목마루
    tile: 220000,      // 타일
    marble: 380000,    // 대리석
    carpet: 120000     // 카펫
  },
  
  // 벽면 마감 (평당)
  walls: {
    paint: 45000,      // 페인트
    wallpaper: 80000,  // 일반 벽지
    fabric: 150000,    // 패브릭 벽지
    tile: 280000,      // 벽 타일
    stone: 450000,     // 천연석
    paneling: 320000   // 목재 패널
  },
  
  // 주방 (전체)
  kitchen: {
    countertop_only: 1200000,   // 상판만
    door_only: 2800000,         // 도어만
    full_budget: 8000000,       // 저가형 전체
    full_standard: 15000000,    // 일반형 전체
    full_premium: 28000000      // 고급형 전체
  },
  
  // 욕실 (전체)
  bathroom: {
    tile_only: 3500000,         // 타일만
    fixtures_only: 4200000,     // 기구만
    waterproof: 1800000,        // 방수만
    full_budget: 12000000,      // 저가형 전체
    full_standard: 22000000,    // 일반형 전체
    full_premium: 40000000      // 고급형 전체
  }
}

// 실제 작업별 세부 설정
export const TASK_CONFIGS: TaskConfig[] = [
  // 철거 단계
  {
    id: 'demo_light',
    name: '일반 철거',
    phase: 'demolition',
    category: 'demolition',
    dependencies: [],
    durationPerSqm: 0.15,
    minDuration: 1,
    maxDuration: 3,
    costPerSqm: 80000,
    materials: ['폐기물 포대', '보호필름'],
    skills: ['철거기사'],
    canRunParallel: false,
    requiresInspection: false
  },
  {
    id: 'demo_heavy',
    name: '전체 철거',
    phase: 'demolition',
    category: 'demolition',
    dependencies: [],
    durationPerSqm: 0.3,
    minDuration: 2,
    maxDuration: 5,
    costPerSqm: 150000,
    materials: ['폐기물 포대', '보호필름', '절단 도구'],
    skills: ['철거기사', '안전관리자'],
    canRunParallel: false,
    requiresInspection: true
  },
  
  // 1차 골조 및 설비
  {
    id: 'electrical_rough',
    name: '전기 1차 배선',
    phase: 'roughing',
    category: 'electrical',
    dependencies: ['demo_light', 'demo_heavy'],
    durationPerSqm: 0.2,
    minDuration: 2,
    maxDuration: 4,
    costPerSqm: 180000,
    materials: ['전선', '배선관', '분전반'],
    skills: ['전기기사'],
    canRunParallel: true,
    requiresInspection: true
  },
  {
    id: 'plumbing_rough',
    name: '배관 1차 작업',
    phase: 'roughing',
    category: 'plumbing',
    dependencies: ['demo_light', 'demo_heavy'],
    durationPerSqm: 0.25,
    minDuration: 2,
    maxDuration: 5,
    costPerSqm: 220000,
    materials: ['급수관', '배수관', '보온재'],
    skills: ['배관기사'],
    canRunParallel: true,
    requiresInspection: true
  },
  
  // 욕실 방수 (특별 공정)
  {
    id: 'bathroom_waterproof',
    name: '욕실 방수',
    phase: 'roughing',
    category: 'plumbing',
    dependencies: ['plumbing_rough'],
    durationPerSqm: 1.0,
    minDuration: 3,
    maxDuration: 5,
    costPerSqm: 180000,
    materials: ['방수재', '프라이머', '메쉬'],
    skills: ['방수기사'],
    canRunParallel: false,
    requiresInspection: true,
    dryingTime: 3
  },
  
  // 벽체 및 천장
  {
    id: 'framing',
    name: '목공 골조',
    phase: 'walls',
    category: 'carpentry',
    dependencies: ['electrical_rough', 'plumbing_rough'],
    durationPerSqm: 0.3,
    minDuration: 2,
    maxDuration: 6,
    costPerSqm: 120000,
    materials: ['목재', '철물', '단열재'],
    skills: ['목공기사'],
    canRunParallel: false,
    requiresInspection: false
  },
  {
    id: 'drywall',
    name: '석고보드 시공',
    phase: 'walls',
    category: 'carpentry',
    dependencies: ['framing'],
    durationPerSqm: 0.25,
    minDuration: 2,
    maxDuration: 4,
    costPerSqm: 85000,
    materials: ['석고보드', '나사', '퍼티'],
    skills: ['목공기사'],
    canRunParallel: false,
    requiresInspection: false,
    dryingTime: 1
  },
  
  // 바닥재
  {
    id: 'flooring_laminate',
    name: '강화마루 시공',
    phase: 'flooring',
    category: 'flooring',
    dependencies: ['drywall'],
    durationPerSqm: 0.2,
    minDuration: 1,
    maxDuration: 3,
    costPerSqm: 180000,
    materials: ['강화마루', '언더레이', '몰딩'],
    skills: ['바닥재기사'],
    canRunParallel: false,
    requiresInspection: false
  },
  {
    id: 'flooring_hardwood',
    name: '원목마루 시공',
    phase: 'flooring',
    category: 'flooring',
    dependencies: ['drywall'],
    durationPerSqm: 0.35,
    minDuration: 2,
    maxDuration: 5,
    costPerSqm: 450000,
    materials: ['원목마루', '접착제', '마감재'],
    skills: ['바닥재기사'],
    canRunParallel: false,
    requiresInspection: false,
    dryingTime: 1
  },
  {
    id: 'flooring_tile',
    name: '타일 시공',
    phase: 'flooring',
    category: 'flooring',
    dependencies: ['drywall'],
    durationPerSqm: 0.4,
    minDuration: 2,
    maxDuration: 4,
    costPerSqm: 220000,
    materials: ['타일', '시멘트', '줄눈재'],
    skills: ['타일기사'],
    canRunParallel: false,
    requiresInspection: false,
    dryingTime: 2
  },
  
  // 도장 및 마감
  {
    id: 'painting',
    name: '페인트 도장',
    phase: 'painting',
    category: 'painting',
    dependencies: ['flooring_laminate', 'flooring_hardwood', 'flooring_tile'],
    durationPerSqm: 0.15,
    minDuration: 2,
    maxDuration: 4,
    costPerSqm: 45000,
    materials: ['페인트', '프라이머', '롤러'],
    skills: ['도장기사'],
    canRunParallel: false,
    requiresInspection: false,
    dryingTime: 2
  },
  {
    id: 'wallpaper',
    name: '벽지 도배',
    phase: 'painting',
    category: 'painting',
    dependencies: ['flooring_laminate', 'flooring_hardwood', 'flooring_tile'],
    durationPerSqm: 0.2,
    minDuration: 1,
    maxDuration: 3,
    costPerSqm: 80000,
    materials: ['벽지', '접착제', '도구'],
    skills: ['도배기사'],
    canRunParallel: false,
    requiresInspection: false,
    dryingTime: 1
  },
  
  // 마무리 공사
  {
    id: 'electrical_finish',
    name: '전기 마감',
    phase: 'finishing',
    category: 'electrical',
    dependencies: ['painting', 'wallpaper'],
    durationPerSqm: 0.1,
    minDuration: 1,
    maxDuration: 2,
    costPerSqm: 65000,
    materials: ['콘센트', '스위치', '조명'],
    skills: ['전기기사'],
    canRunParallel: true,
    requiresInspection: true
  },
  {
    id: 'plumbing_finish',
    name: '배관 마감',
    phase: 'finishing',
    category: 'plumbing',
    dependencies: ['painting', 'wallpaper'],
    durationPerSqm: 0.1,
    minDuration: 1,
    maxDuration: 2,
    costPerSqm: 45000,
    materials: ['수전', '배수구', '실리콘'],
    skills: ['배관기사'],
    canRunParallel: true,
    requiresInspection: true
  },
  
  // 주방/욕실 전용
  {
    id: 'kitchen_install',
    name: '주방 설치',
    phase: 'finishing',
    category: 'carpentry',
    dependencies: ['electrical_finish', 'plumbing_finish'],
    durationPerSqm: 1.5,
    minDuration: 3,
    maxDuration: 7,
    costPerSqm: 800000,
    materials: ['싱크대', '상판', '타일'],
    skills: ['목공기사', '타일기사'],
    canRunParallel: false,
    requiresInspection: true
  },
  {
    id: 'bathroom_install',
    name: '욕실 설치',
    phase: 'finishing',
    category: 'plumbing',
    dependencies: ['bathroom_waterproof', 'electrical_finish'],
    durationPerSqm: 2.0,
    minDuration: 5,
    maxDuration: 10,
    costPerSqm: 1200000,
    materials: ['변기', '세면대', '타일', '샤워부스'],
    skills: ['배관기사', '타일기사'],
    canRunParallel: false,
    requiresInspection: true
  },
  
  // 청소 및 완료
  {
    id: 'cleanup',
    name: '마무리 청소',
    phase: 'completion',
    category: 'cleanup',
    dependencies: ['electrical_finish', 'plumbing_finish', 'kitchen_install', 'bathroom_install'],
    durationPerSqm: 0.05,
    minDuration: 1,
    maxDuration: 2,
    costPerSqm: 25000,
    materials: ['청소용품'],
    skills: ['청소업체'],
    canRunParallel: false,
    requiresInspection: false
  }
]