// 실제 건설업계 기준 상수 정의

// 공사 단계별 정의 - 실제 시공 순서 반영
export const CONSTRUCTION_PHASES = {
  // 1단계: 철거 및 준비
  PHASE_1_PREP: {
    demolition: {
      name: '철거 작업',
      description: '기존 설비 및 마감재 철거',
      baseTime: { perSqm: 0.3, minimum: 2, maximum: 7 }, // 평당 0.3일
      baseCost: { perSqm: 25000, minimum: 200000 }, // 평당 25,000원
      dependencies: [],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: true,
      criticalPath: true
    },
    site_preparation: {
      name: '현장 정리',
      description: '철거 후 폐기물 처리 및 현장 정리',
      baseTime: { perSqm: 0.1, minimum: 1, maximum: 2 },
      baseCost: { perSqm: 15000, minimum: 100000 },
      dependencies: ['demolition'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true
    }
  },

  // 2단계: 구조 및 설비 러프인
  PHASE_2_ROUGH_IN: {
    structural_work: {
      name: '구조 작업',
      description: '벽체 구조 변경 및 보강',
      baseTime: { perSqm: 0.4, minimum: 3, maximum: 10 },
      baseCost: { perSqm: 80000, minimum: 500000 },
      dependencies: ['site_preparation'],
      canRunParallel: false,
      requiresInspection: true,
      noisyWork: true,
      criticalPath: true
    },
    electrical_rough: {
      name: '전기 배선',
      description: '전기 배선 및 배전반 작업',
      baseTime: { perSqm: 0.25, minimum: 2, maximum: 5 },
      baseCost: { perSqm: 45000, minimum: 300000 },
      dependencies: ['structural_work'],
      canRunParallel: true,
      requiresInspection: true,
      noisyWork: false,
      criticalPath: true
    },
    plumbing_rough: {
      name: '배관 작업',
      description: '급수, 배수관 설치',
      baseTime: { perSqm: 0.2, minimum: 1, maximum: 4 },
      baseCost: { perSqm: 35000, minimum: 250000 },
      dependencies: ['structural_work'],
      canRunParallel: true,
      requiresInspection: true,
      noisyWork: false,
      criticalPath: false
    },
    hvac_rough: {
      name: '냉난방 배관',
      description: '보일러 및 냉난방 배관',
      baseTime: { perSqm: 0.15, minimum: 1, maximum: 3 },
      baseCost: { perSqm: 25000, minimum: 200000 },
      dependencies: ['plumbing_rough'],
      canRunParallel: true,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: false
    }
  },

  // 3단계: 단열 및 벽체 마감
  PHASE_3_WALLS: {
    insulation: {
      name: '단열 작업',
      description: '벽체 단열재 시공',
      baseTime: { perSqm: 0.2, minimum: 2, maximum: 4 },
      baseCost: { perSqm: 30000, minimum: 200000 },
      dependencies: ['electrical_rough', 'plumbing_rough'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true
    },
    drywall: {
      name: '석고보드 시공',
      description: '벽체 석고보드 설치',
      baseTime: { perSqm: 0.3, minimum: 3, maximum: 6 },
      baseCost: { perSqm: 40000, minimum: 300000 },
      dependencies: ['insulation'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true
    },
    drywall_finishing: {
      name: '벽체 마감',
      description: '석고보드 퍼티 및 사포 작업',
      baseTime: { perSqm: 0.25, minimum: 2, maximum: 4 },
      baseCost: { perSqm: 25000, minimum: 150000 },
      dependencies: ['drywall'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true,
      dryingTime: 1 // 건조 시간 1일
    }
  },

  // 4단계: 바닥 작업
  PHASE_4_FLOORING: {
    flooring_prep: {
      name: '바닥 준비',
      description: '바닥 평탄화 및 방수',
      baseTime: { perSqm: 0.2, minimum: 2, maximum: 4 },
      baseCost: { perSqm: 20000, minimum: 150000 },
      dependencies: ['drywall_finishing'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true,
      dryingTime: 2 // 건조 시간 2일
    },
    flooring_install: {
      name: '바닥재 시공',
      description: '바닥재 설치',
      baseTime: { perSqm: 0.4, minimum: 3, maximum: 8 },
      baseCost: { perSqm: 0, minimum: 0 }, // 재료별로 별도 계산
      dependencies: ['flooring_prep'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true
    }
  },

  // 5단계: 도장 작업
  PHASE_5_PAINTING: {
    primer: {
      name: '프라이머 도장',
      description: '벽면 프라이머 작업',
      baseTime: { perSqm: 0.15, minimum: 1, maximum: 3 },
      baseCost: { perSqm: 15000, minimum: 100000 },
      dependencies: ['flooring_install'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true,
      dryingTime: 1
    },
    base_paint: {
      name: '1차 도장',
      description: '벽면 1차 페인트 작업',
      baseTime: { perSqm: 0.2, minimum: 2, maximum: 4 },
      baseCost: { perSqm: 0, minimum: 0 }, // 재료별로 별도 계산
      dependencies: ['primer'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true,
      dryingTime: 1
    },
    finish_paint: {
      name: '2차 도장',
      description: '벽면 2차 페인트 작업',
      baseTime: { perSqm: 0.2, minimum: 2, maximum: 4 },
      baseCost: { perSqm: 0, minimum: 0 }, // 재료별로 별도 계산
      dependencies: ['base_paint'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true,
      dryingTime: 2
    }
  },

  // 6단계: 마감 설비
  PHASE_6_FINISH: {
    electrical_finish: {
      name: '전기 마감',
      description: '스위치, 콘센트, 조명 설치',
      baseTime: { perSqm: 0.15, minimum: 2, maximum: 4 },
      baseCost: { perSqm: 25000, minimum: 200000 },
      dependencies: ['finish_paint'],
      canRunParallel: true,
      requiresInspection: true,
      noisyWork: false,
      criticalPath: false
    },
    plumbing_finish: {
      name: '배관 마감',
      description: '수전, 배수구 마감 설치',
      baseTime: { perSqm: 0.1, minimum: 1, maximum: 3 },
      baseCost: { perSqm: 20000, minimum: 150000 },
      dependencies: ['finish_paint'],
      canRunParallel: true,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: false
    },
    carpentry_finish: {
      name: '목공 마감',
      description: '문틀, 걸레받이, 몰딩 설치',
      baseTime: { perSqm: 0.25, minimum: 2, maximum: 5 },
      baseCost: { perSqm: 35000, minimum: 250000 },
      dependencies: ['finish_paint'],
      canRunParallel: true,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: false
    }
  },

  // 7단계: 최종 마무리
  PHASE_7_COMPLETION: {
    final_inspection: {
      name: '최종 점검',
      description: '전체 공사 품질 점검',
      baseTime: { perSqm: 0.05, minimum: 1, maximum: 2 },
      baseCost: { perSqm: 5000, minimum: 50000 },
      dependencies: ['electrical_finish', 'plumbing_finish', 'carpentry_finish'],
      canRunParallel: false,
      requiresInspection: true,
      noisyWork: false,
      criticalPath: true
    },
    final_cleanup: {
      name: '최종 청소',
      description: '전체 현장 마무리 청소',
      baseTime: { perSqm: 0.1, minimum: 1, maximum: 2 },
      baseCost: { perSqm: 10000, minimum: 80000 },
      dependencies: ['final_inspection'],
      canRunParallel: false,
      requiresInspection: false,
      noisyWork: false,
      criticalPath: true
    }
  }
} as const;

// 재료별 실제 비용 (2024년 기준, 42평 기준)
export const MATERIAL_COSTS = {
  flooring: {
    laminate: { perSqm: 180000, premium: 250000 }, // 강화마루
    hardwood: { perSqm: 350000, premium: 500000 }, // 원목마루
    tile: { perSqm: 200000, premium: 400000 }, // 타일
    carpet: { perSqm: 120000, premium: 200000 } // 카펫
  },
  walls: {
    wallpaper: { perSqm: 80000, premium: 150000 }, // 도배
    paint: { perSqm: 50000, premium: 80000 }, // 페인트
    tile: { perSqm: 250000, premium: 450000 }, // 벽 타일
    paneling: { perSqm: 300000, premium: 500000 } // 패널링
  },
  fixtures: {
    kitchen_sink: { standard: 800000, premium: 2000000 },
    bathroom_full: { standard: 3000000, premium: 8000000 },
    lighting_basic: { perRoom: 200000, premium: 500000 }
  }
} as const;

// 공간별 특수 작업 정의
export const SPECIAL_ROOM_TASKS = {
  kitchen: {
    cabinet_demolition: {
      name: '기존 싱크대 철거',
      baseTime: { fixed: 1 },
      baseCost: { fixed: 150000 },
      dependencies: ['demolition']
    },
    waterproofing: {
      name: '주방 방수',
      baseTime: { fixed: 2 },
      baseCost: { fixed: 300000 },
      dependencies: ['plumbing_rough'],
      dryingTime: 2
    },
    cabinet_install: {
      name: '싱크대 설치',
      baseTime: { fixed: 3 },
      baseCost: { fixed: 0 }, // 제품 선택에 따라
      dependencies: ['waterproofing', 'electrical_rough']
    }
  },
  bathroom: {
    waterproofing: {
      name: '욕실 방수',
      baseTime: { fixed: 3 },
      baseCost: { fixed: 500000 },
      dependencies: ['plumbing_rough'],
      dryingTime: 3,
      criticalPath: true
    },
    tile_install: {
      name: '욕실 타일',
      baseTime: { fixed: 5 },
      baseCost: { perSqm: 200000, minimum: 800000 },
      dependencies: ['waterproofing'],
      dryingTime: 1
    },
    fixture_install: {
      name: '욕실 기구 설치',
      baseTime: { fixed: 2 },
      baseCost: { fixed: 0 }, // 제품 선택에 따라
      dependencies: ['tile_install']
    }
  }
} as const;

// 작업 제약 조건
export const WORK_CONSTRAINTS = {
  // 소음 제한
  noisyWorkHours: {
    weekdays: { start: 9, end: 18 },
    saturdays: { start: 9, end: 17 },
    sundays: { start: 10, end: 16 }
  },
  
  // 병렬 작업 제한 (동시에 할 수 없는 작업들)
  exclusiveGroups: [
    ['demolition', 'structural_work'], // 구조 작업은 동시에 불가
    ['drywall', 'electrical_rough'], // 배선과 석고보드는 동시에 불가
    ['painting', 'flooring_install'] // 도장과 바닥재는 동시에 불가
  ],

  // 필수 대기 시간 (건조, 양생 등)
  mandatoryWaitTimes: {
    concrete: 7, // 콘크리트 양생
    waterproofing: 3, // 방수 건조
    primer: 1, // 프라이머 건조
    paint: 1, // 페인트 건조
    adhesive: 1 // 접착제 건조
  },

  // 검사 필요 단계
  inspectionRequired: [
    'structural_work',
    'electrical_rough',
    'plumbing_rough',
    'electrical_finish',
    'final_inspection'
  ]
} as const;

// 프로젝트 규모별 조정 계수
export const SCALE_FACTORS = {
  // 면적별 효율성 계수 (큰 면적일수록 효율적)
  area: {
    small: { threshold: 20, timeFactor: 1.2, costFactor: 1.1 }, // 20평 이하
    medium: { threshold: 40, timeFactor: 1.0, costFactor: 1.0 }, // 20-40평
    large: { threshold: 60, timeFactor: 0.9, costFactor: 0.95 }, // 40-60평
    xlarge: { threshold: 100, timeFactor: 0.8, costFactor: 0.9 } // 60평 이상
  },

  // 스코프별 복잡도 계수
  scope: {
    partial: { timeFactor: 0.7, costFactor: 0.8 }, // 부분 리모델링
    full: { timeFactor: 1.0, costFactor: 1.0 } // 전체 리모델링
  },

  // 품질 등급별 계수
  quality: {
    budget: { timeFactor: 0.8, costFactor: 0.7 },
    standard: { timeFactor: 1.0, costFactor: 1.0 },
    premium: { timeFactor: 1.3, costFactor: 1.8 }
  }
} as const;

// 예상 총 비용 기준 (42평 전체 리모델링 기준)
export const REFERENCE_COSTS = {
  budget_42pyeong: 25000000, // 2천5백만원 (최소한의 기본 리모델링)
  standard_42pyeong: 45000000, // 4천5백만원 (일반적인 리모델링)
  premium_42pyeong: 80000000, // 8천만원 (고급 리모델링)
  luxury_42pyeong: 150000000 // 1억5천만원 (최고급 리모델링)
} as const;