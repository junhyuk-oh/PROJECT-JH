// 작업 마스터 데이터베이스
export interface TaskMaster {
  id: string;
  name: string;
  category: 'demolition' | 'plumbing' | 'electrical' | 'waterproofing' | 'tiling' | 'carpentry' | 'painting' | 'installation' | 'cleaning';
  baseDuration: number; // 10평 기준 일수
  dependencies: string[]; // 선행작업 ID 배열
  dependencyDelay?: number; // 선행작업 완료 후 대기시간 (시간 단위)
  noiseLevel: 'high' | 'medium' | 'low' | 'none';
  dustLevel: 'high' | 'medium' | 'low' | 'none';
  requiredSpecialists: string[]; // 필요 전문가
  isDIYPossible: boolean;
  weatherSensitive: boolean;
  tips: string[];
  warnings: string[];
  workingHours?: {
    weekday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: null;
  };
}

// 공간별 작업 템플릿
export const spaceTaskTemplates: Record<string, string[]> = {
  kitchen: [
    'kitchen_demolition',
    'kitchen_plumbing_rough',
    'kitchen_electrical_rough',
    'kitchen_ceiling',
    'kitchen_wall',
    'kitchen_waterproofing',
    'kitchen_tiling',
    'kitchen_cabinet',
    'kitchen_countertop',
    'kitchen_sink',
    'kitchen_appliances',
    'kitchen_finishing'
  ],
  bathroom: [
    'bathroom_demolition',
    'bathroom_plumbing_rough',
    'bathroom_electrical_rough',
    'bathroom_waterproofing',
    'bathroom_waterproofing_inspection',
    'bathroom_tiling',
    'bathroom_ceiling',
    'bathroom_fixtures',
    'bathroom_vanity',
    'bathroom_finishing'
  ],
  livingRoom: [
    'living_demolition',
    'living_electrical',
    'living_ceiling',
    'living_wall_prep',
    'living_flooring',
    'living_painting',
    'living_molding',
    'living_finishing'
  ],
  bedroom: [
    'bedroom_demolition',
    'bedroom_electrical',
    'bedroom_ceiling',
    'bedroom_wall_prep',
    'bedroom_flooring',
    'bedroom_painting',
    'bedroom_builtin',
    'bedroom_finishing'
  ]
};

// 작업 마스터 데이터
export const taskMasterData: Record<string, TaskMaster> = {
  // 주방 작업
  kitchen_demolition: {
    id: 'kitchen_demolition',
    name: '주방 철거',
    category: 'demolition',
    baseDuration: 2,
    dependencies: [],
    noiseLevel: 'high',
    dustLevel: 'high',
    requiredSpecialists: ['철거전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['기존 싱크대 하부 누수 확인', '가스/수도 차단 필수'],
    warnings: ['석면 함유 자재 주의', '이웃 소음 민원 사전 고지'],
    workingHours: {
      weekday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '17:00' },
      sunday: null
    }
  },
  kitchen_plumbing_rough: {
    id: 'kitchen_plumbing_rough',
    name: '주방 배관 공사',
    category: 'plumbing',
    baseDuration: 2,
    dependencies: ['kitchen_demolition'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['배관전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['온수/냉수 배관 구분 표시', '식기세척기 배관 사전 계획'],
    warnings: ['배관 자격증 보유자만 작업 가능', '누수 테스트 필수']
  },
  kitchen_electrical_rough: {
    id: 'kitchen_electrical_rough',
    name: '주방 전기 공사',
    category: 'electrical',
    baseDuration: 2,
    dependencies: ['kitchen_demolition'],
    noiseLevel: 'medium',
    dustLevel: 'low',
    requiredSpecialists: ['전기전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['가전제품별 전용 콘센트 설치', '조명 스위치 위치 사전 확정'],
    warnings: ['전기 자격증 보유자만 작업 가능', '과부하 방지 차단기 설치']
  },
  kitchen_ceiling: {
    id: 'kitchen_ceiling',
    name: '주방 천장 공사',
    category: 'carpentry',
    baseDuration: 1,
    dependencies: ['kitchen_plumbing_rough', 'kitchen_electrical_rough'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['목공전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['환기구 위치 확인', '조명 매입 위치 정확히 표시'],
    warnings: ['석고보드 이음새 균열 방지 처리']
  },
  kitchen_wall: {
    id: 'kitchen_wall',
    name: '주방 벽체 공사',
    category: 'carpentry',
    baseDuration: 1,
    dependencies: ['kitchen_plumbing_rough', 'kitchen_electrical_rough'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['목공전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['콘센트 박스 정확한 위치 확인', '타일 시공 구간 벽면 평탄화'],
    warnings: ['단열재 충진 확인']
  },
  kitchen_waterproofing: {
    id: 'kitchen_waterproofing',
    name: '주방 방수',
    category: 'waterproofing',
    baseDuration: 1,
    dependencies: ['kitchen_wall'],
    dependencyDelay: 24,
    noiseLevel: 'none',
    dustLevel: 'low',
    requiredSpecialists: ['방수전문가'],
    isDIYPossible: false,
    weatherSensitive: true,
    tips: ['싱크대 하부 집중 방수', '3회 도포 권장'],
    warnings: ['습도 70% 이상시 작업 금지', '건조 시간 48시간 필수']
  },
  kitchen_tiling: {
    id: 'kitchen_tiling',
    name: '주방 타일 시공',
    category: 'tiling',
    baseDuration: 2,
    dependencies: ['kitchen_waterproofing'],
    dependencyDelay: 48,
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['타일전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['타일 패턴 사전 계획', '줄눈 색상 신중히 선택'],
    warnings: ['방수층 완전 건조 후 시공', '수평/수직 확인 필수']
  },
  kitchen_cabinet: {
    id: 'kitchen_cabinet',
    name: '주방 상하부장 설치',
    category: 'installation',
    baseDuration: 2,
    dependencies: ['kitchen_tiling'],
    noiseLevel: 'medium',
    dustLevel: 'low',
    requiredSpecialists: ['가구설치전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['수평 조절 정밀 작업', '도어 간격 균일하게 조정'],
    warnings: ['벽면 하중 확인', '상부장 고정 앵커 필수']
  },
  kitchen_countertop: {
    id: 'kitchen_countertop',
    name: '주방 상판 설치',
    category: 'installation',
    baseDuration: 1,
    dependencies: ['kitchen_cabinet'],
    noiseLevel: 'low',
    dustLevel: 'low',
    requiredSpecialists: ['석재전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['싱크대 타공 위치 정확히 확인', '벽면 밀착 시공'],
    warnings: ['인조대리석 이음새 처리 주의', '무거운 자재 2인 이상 작업']
  },
  kitchen_sink: {
    id: 'kitchen_sink',
    name: '싱크대 및 수전 설치',
    category: 'plumbing',
    baseDuration: 0.5,
    dependencies: ['kitchen_countertop'],
    noiseLevel: 'low',
    dustLevel: 'none',
    requiredSpecialists: ['배관전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['실리콘 마감 깔끔하게', '수전 높이 사용성 고려'],
    warnings: ['누수 테스트 필수', '배수관 경사 확인']
  },
  kitchen_appliances: {
    id: 'kitchen_appliances',
    name: '주방 가전 설치',
    category: 'installation',
    baseDuration: 1,
    dependencies: ['kitchen_sink'],
    noiseLevel: 'low',
    dustLevel: 'none',
    requiredSpecialists: ['가전설치전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['가스레인지 가스 연결 확인', '빌트인 가전 규격 확인'],
    warnings: ['가스 연결은 자격증 보유자만', '접지 확인 필수']
  },
  kitchen_finishing: {
    id: 'kitchen_finishing',
    name: '주방 마감 청소',
    category: 'cleaning',
    baseDuration: 0.5,
    dependencies: ['kitchen_appliances'],
    noiseLevel: 'none',
    dustLevel: 'none',
    requiredSpecialists: [],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['보양재 제거', '각 기능 작동 테스트'],
    warnings: ['실리콘 경화 전 접촉 금지']
  },

  // 욕실 작업
  bathroom_demolition: {
    id: 'bathroom_demolition',
    name: '욕실 철거',
    category: 'demolition',
    baseDuration: 1,
    dependencies: [],
    noiseLevel: 'high',
    dustLevel: 'high',
    requiredSpecialists: ['철거전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['방수층 손상 주의', '하수구 막음 처리'],
    warnings: ['석면 타일 주의', '층간 누수 예방'],
    workingHours: {
      weekday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '17:00' },
      sunday: null
    }
  },
  bathroom_plumbing_rough: {
    id: 'bathroom_plumbing_rough',
    name: '욕실 배관 공사',
    category: 'plumbing',
    baseDuration: 1,
    dependencies: ['bathroom_demolition'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['배관전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['온수/냉수 구분 표시', '수압 테스트 실시'],
    warnings: ['배관 자격증 필수', '구배 확인 철저']
  },
  bathroom_electrical_rough: {
    id: 'bathroom_electrical_rough',
    name: '욕실 전기 공사',
    category: 'electrical',
    baseDuration: 0.5,
    dependencies: ['bathroom_demolition'],
    noiseLevel: 'low',
    dustLevel: 'low',
    requiredSpecialists: ['전기전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['방수 콘센트 사용', '환풍기 전용선 설치'],
    warnings: ['누전차단기 필수', '접지 시공 확인']
  },
  bathroom_waterproofing: {
    id: 'bathroom_waterproofing',
    name: '욕실 방수',
    category: 'waterproofing',
    baseDuration: 2,
    dependencies: ['bathroom_plumbing_rough', 'bathroom_electrical_rough'],
    dependencyDelay: 24,
    noiseLevel: 'none',
    dustLevel: 'low',
    requiredSpecialists: ['방수전문가'],
    isDIYPossible: false,
    weatherSensitive: true,
    tips: ['바닥에서 벽면 30cm 이상', '코너 보강 처리'],
    warnings: ['3회 이상 도포', '완전 건조 48시간 필수']
  },
  bathroom_waterproofing_inspection: {
    id: 'bathroom_waterproofing_inspection',
    name: '방수 담수 시험',
    category: 'waterproofing',
    baseDuration: 1,
    dependencies: ['bathroom_waterproofing'],
    dependencyDelay: 48,
    noiseLevel: 'none',
    dustLevel: 'none',
    requiredSpecialists: ['방수전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['24시간 담수 유지', '누수 여부 철저히 확인'],
    warnings: ['누수 발견시 재시공', '아래층 확인 필수']
  },
  bathroom_tiling: {
    id: 'bathroom_tiling',
    name: '욕실 타일 시공',
    category: 'tiling',
    baseDuration: 2,
    dependencies: ['bathroom_waterproofing_inspection'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['타일전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['바닥 구배 확인', '줄눈 방수 처리'],
    warnings: ['미끄럼 방지 타일 사용', '타일 들뜸 확인']
  },
  bathroom_ceiling: {
    id: 'bathroom_ceiling',
    name: '욕실 천장 공사',
    category: 'carpentry',
    baseDuration: 0.5,
    dependencies: ['bathroom_tiling'],
    noiseLevel: 'low',
    dustLevel: 'low',
    requiredSpecialists: ['목공전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['환기구 위치 확인', '방습 자재 사용'],
    warnings: ['점검구 설치', '결로 방지 처리']
  },
  bathroom_fixtures: {
    id: 'bathroom_fixtures',
    name: '위생도기 설치',
    category: 'plumbing',
    baseDuration: 1,
    dependencies: ['bathroom_tiling'],
    noiseLevel: 'low',
    dustLevel: 'none',
    requiredSpecialists: ['배관전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['실리콘 마감 깔끔하게', '수평 확인'],
    warnings: ['누수 테스트 필수', '고정 볼트 확인']
  },
  bathroom_vanity: {
    id: 'bathroom_vanity',
    name: '세면대 및 수납장 설치',
    category: 'installation',
    baseDuration: 0.5,
    dependencies: ['bathroom_fixtures'],
    noiseLevel: 'low',
    dustLevel: 'none',
    requiredSpecialists: ['가구설치전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['벽면 고정 확실히', '도어 조절'],
    warnings: ['하중 확인', '배수관 연결 확인']
  },
  bathroom_finishing: {
    id: 'bathroom_finishing',
    name: '욕실 마감 청소',
    category: 'cleaning',
    baseDuration: 0.5,
    dependencies: ['bathroom_vanity'],
    noiseLevel: 'none',
    dustLevel: 'none',
    requiredSpecialists: [],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['실리콘 잔여물 제거', '배수 테스트'],
    warnings: ['타일 줄눈 보호']
  },

  // 거실 작업
  living_demolition: {
    id: 'living_demolition',
    name: '거실 철거',
    category: 'demolition',
    baseDuration: 1,
    dependencies: [],
    noiseLevel: 'high',
    dustLevel: 'high',
    requiredSpecialists: ['철거전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['기존 몰딩 보관 여부 확인', '벽지 제거 깔끔하게'],
    warnings: ['소음 민원 주의', '분진 차단막 설치']
  },
  living_electrical: {
    id: 'living_electrical',
    name: '거실 전기 공사',
    category: 'electrical',
    baseDuration: 1,
    dependencies: ['living_demolition'],
    noiseLevel: 'medium',
    dustLevel: 'low',
    requiredSpecialists: ['전기전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['TV 벽걸이 배선 숨김 처리', '조명 디밍 스위치 고려'],
    warnings: ['전기 자격증 필수', '용량 계산 확인']
  },
  living_ceiling: {
    id: 'living_ceiling',
    name: '거실 천장 공사',
    category: 'carpentry',
    baseDuration: 1,
    dependencies: ['living_electrical'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['목공전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['우물천장 디자인 고려', '간접조명 라인 계획'],
    warnings: ['수평 확인 철저', '균열 방지 처리']
  },
  living_wall_prep: {
    id: 'living_wall_prep',
    name: '거실 벽면 정리',
    category: 'carpentry',
    baseDuration: 1,
    dependencies: ['living_electrical'],
    noiseLevel: 'low',
    dustLevel: 'medium',
    requiredSpecialists: ['도배전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['퍼티 작업 꼼꼼히', '프라이머 도포'],
    warnings: ['평활도 확인', '크랙 보수']
  },
  living_flooring: {
    id: 'living_flooring',
    name: '거실 바닥재 시공',
    category: 'carpentry',
    baseDuration: 2,
    dependencies: ['living_ceiling', 'living_wall_prep'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['마루전문가'],
    isDIYPossible: false,
    weatherSensitive: true,
    tips: ['방향성 일정하게', '벽면 10mm 간격'],
    warnings: ['평탄도 확인', '습도 관리']
  },
  living_painting: {
    id: 'living_painting',
    name: '거실 도장/도배',
    category: 'painting',
    baseDuration: 2,
    dependencies: ['living_flooring'],
    noiseLevel: 'none',
    dustLevel: 'low',
    requiredSpecialists: ['도장전문가'],
    isDIYPossible: true,
    weatherSensitive: true,
    tips: ['마스킹 테이프 활용', '2회 도포'],
    warnings: ['환기 필수', '건조 시간 확보']
  },
  living_molding: {
    id: 'living_molding',
    name: '거실 몰딩 설치',
    category: 'carpentry',
    baseDuration: 1,
    dependencies: ['living_painting'],
    noiseLevel: 'low',
    dustLevel: 'low',
    requiredSpecialists: ['목공전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['코너 45도 커팅', '이음새 퍼티 처리'],
    warnings: ['수평 확인', '고정 간격 유지']
  },
  living_finishing: {
    id: 'living_finishing',
    name: '거실 마감 청소',
    category: 'cleaning',
    baseDuration: 0.5,
    dependencies: ['living_molding'],
    noiseLevel: 'none',
    dustLevel: 'none',
    requiredSpecialists: [],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['바닥 왁스 코팅', '스위치/콘센트 커버 설치'],
    warnings: ['도장면 손상 주의']
  },

  // 침실 작업
  bedroom_demolition: {
    id: 'bedroom_demolition',
    name: '침실 철거',
    category: 'demolition',
    baseDuration: 0.5,
    dependencies: [],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['철거전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['벽지 제거시 벽면 손상 주의', '기존 가구 보호'],
    warnings: ['분진 차단', '소음 시간 준수']
  },
  bedroom_electrical: {
    id: 'bedroom_electrical',
    name: '침실 전기 공사',
    category: 'electrical',
    baseDuration: 0.5,
    dependencies: ['bedroom_demolition'],
    noiseLevel: 'low',
    dustLevel: 'low',
    requiredSpecialists: ['전기전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['침대 양쪽 콘센트', 'USB 콘센트 고려'],
    warnings: ['전기 자격증 필수']
  },
  bedroom_ceiling: {
    id: 'bedroom_ceiling',
    name: '침실 천장 공사',
    category: 'carpentry',
    baseDuration: 0.5,
    dependencies: ['bedroom_electrical'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['목공전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['조명 위치 중앙 확인', '단열재 보강'],
    warnings: ['석고보드 이음새 처리']
  },
  bedroom_wall_prep: {
    id: 'bedroom_wall_prep',
    name: '침실 벽면 정리',
    category: 'carpentry',
    baseDuration: 0.5,
    dependencies: ['bedroom_electrical'],
    noiseLevel: 'low',
    dustLevel: 'medium',
    requiredSpecialists: ['도배전문가'],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['곰팡이 제거', '프라이머 도포'],
    warnings: ['평탄 작업 확인']
  },
  bedroom_flooring: {
    id: 'bedroom_flooring',
    name: '침실 바닥재 시공',
    category: 'carpentry',
    baseDuration: 1,
    dependencies: ['bedroom_ceiling', 'bedroom_wall_prep'],
    noiseLevel: 'medium',
    dustLevel: 'medium',
    requiredSpecialists: ['마루전문가'],
    isDIYPossible: false,
    weatherSensitive: true,
    tips: ['문턱 높이 조절', '바닥 난방 확인'],
    warnings: ['평탄도 확인', '소음 방지 패드']
  },
  bedroom_painting: {
    id: 'bedroom_painting',
    name: '침실 도장/도배',
    category: 'painting',
    baseDuration: 1,
    dependencies: ['bedroom_flooring'],
    noiseLevel: 'none',
    dustLevel: 'low',
    requiredSpecialists: ['도장전문가'],
    isDIYPossible: true,
    weatherSensitive: true,
    tips: ['친환경 페인트 사용', '포인트 벽 고려'],
    warnings: ['환기 필수', 'VOC 확인']
  },
  bedroom_builtin: {
    id: 'bedroom_builtin',
    name: '붙박이장 설치',
    category: 'installation',
    baseDuration: 1,
    dependencies: ['bedroom_painting'],
    noiseLevel: 'medium',
    dustLevel: 'low',
    requiredSpecialists: ['가구설치전문가'],
    isDIYPossible: false,
    weatherSensitive: false,
    tips: ['벽면 직각 확인', '도어 소음 방지'],
    warnings: ['벽면 고정 확실히', '수평 조절']
  },
  bedroom_finishing: {
    id: 'bedroom_finishing',
    name: '침실 마감 청소',
    category: 'cleaning',
    baseDuration: 0.5,
    dependencies: ['bedroom_builtin'],
    noiseLevel: 'none',
    dustLevel: 'none',
    requiredSpecialists: [],
    isDIYPossible: true,
    weatherSensitive: false,
    tips: ['커튼 레일 설치', '조명 커버 설치'],
    warnings: ['바닥 스크래치 주의']
  }
};

// 면적에 따른 작업 기간 조정 함수
export function adjustDurationByArea(baseDuration: number, area: number): number {
  const baseArea = 10; // 10평 기준
  const additionalDays = Math.ceil((area - baseArea) / 5) * 0.5;
  return baseDuration + Math.max(0, additionalDays);
}

// 작업 카테고리별 동시 작업 가능 여부
export const concurrentWorkRules: Record<string, string[]> = {
  demolition: [], // 철거는 다른 작업과 동시 불가
  plumbing: ['electrical'], // 배관과 전기는 동시 가능
  electrical: ['plumbing'], // 전기와 배관은 동시 가능
  waterproofing: [], // 방수는 단독 작업
  tiling: [], // 타일은 단독 작업
  carpentry: ['painting'], // 목공과 도장은 조건부 동시 가능
  painting: ['carpentry'], // 도장과 목공은 조건부 동시 가능
  installation: ['cleaning'], // 설치와 청소는 동시 가능
  cleaning: ['installation'] // 청소와 설치는 동시 가능
};

// 날씨 민감도에 따른 작업 제약
export const weatherConstraints = {
  highHumidity: ['waterproofing', 'painting', 'flooring'], // 습도 70% 이상시 제한
  rain: ['waterproofing', 'painting'], // 비오는 날 제한
  extremeCold: ['tiling', 'waterproofing'], // 5도 이하 제한
  extremeHeat: ['flooring'] // 35도 이상 제한
};

// 소음 작업 가능 시간
export const noiseWorkHours = {
  weekday: { start: '09:00', end: '18:00' },
  saturday: { start: '09:00', end: '17:00' },
  sunday: null // 일요일 작업 불가
};

// 작업별 예상 비용 (평당, 원 단위)
export const taskCostEstimates: Record<string, number> = {
  demolition: 150000,
  plumbing: 200000,
  electrical: 180000,
  waterproofing: 120000,
  tiling: 250000,
  carpentry: 300000,
  painting: 100000,
  installation: 150000,
  cleaning: 50000
};