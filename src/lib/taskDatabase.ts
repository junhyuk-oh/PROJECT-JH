import { Task } from './types';

// 업체 데이터베이스
export const contractors: Record<string, any> = {
  // 철거 업체
  'demolition-1': {
    id: 'demolition-1',
    name: '한국철거',
    specialty: ['demolition', 'protection'],
    phone: '010-1234-5678',
    email: 'demolition@example.com',
    rating: 4.5,
    priceRange: 'medium',
    workingHours: '09:00-18:00',
    holidays: [0], // 일요일 휴무
    minimumBookingDays: 3
  },
  
  // 전기 업체
  'electrical-1': {
    id: 'electrical-1',
    name: '파워전기',
    specialty: ['electrical'],
    phone: '010-2345-6789',
    email: 'power@example.com',
    rating: 4.8,
    priceRange: 'high',
    workingHours: '08:00-18:00',
    holidays: [0, 6], // 주말 휴무
    minimumBookingDays: 2
  },
  
  // 수도/배관 업체
  'plumbing-1': {
    id: 'plumbing-1',
    name: '청수설비',
    specialty: ['plumbing', 'waterproofing'],
    phone: '010-3456-7890',
    email: 'plumbing@example.com',
    rating: 4.6,
    priceRange: 'medium',
    workingHours: '08:00-17:00',
    holidays: [0], // 일요일 휴무
    minimumBookingDays: 2
  },
  
  // 타일 업체
  'tile-1': {
    id: 'tile-1',
    name: '명품타일',
    specialty: ['tile', 'flooring'],
    phone: '010-4567-8901',
    email: 'tile@example.com',
    rating: 4.9,
    priceRange: 'high',
    workingHours: '08:00-18:00',
    holidays: [0], // 일요일 휴무
    minimumBookingDays: 3
  },
  
  // 도배/도장 업체
  'painting-1': {
    id: 'painting-1',
    name: '컬러인테리어',
    specialty: ['painting', 'wallpaper'],
    phone: '010-5678-9012',
    email: 'color@example.com',
    rating: 4.7,
    priceRange: 'medium',
    workingHours: '08:00-18:00',
    holidays: [0], // 일요일 휴무
    minimumBookingDays: 2
  },
  
  // 목공 업체
  'carpentry-1': {
    id: 'carpentry-1',
    name: '우드마스터',
    specialty: ['carpentry', 'furniture', 'wall', 'ceiling'],
    phone: '010-6789-0123',
    email: 'wood@example.com',
    rating: 4.8,
    priceRange: 'high',
    workingHours: '08:00-18:00',
    holidays: [0], // 일요일 휴무
    minimumBookingDays: 5
  },
  
  // 방수 전문업체 (신규)
  'waterproof-1': {
    id: 'waterproof-1',
    name: '방수마스터',
    specialty: ['waterproofing', 'plumbing'],
    phone: '010-7890-1234',
    email: 'waterproof@example.com',
    rating: 4.7,
    priceRange: 'medium',
    workingHours: '08:00-18:00',
    holidays: [0, 6], // 주말 휴무
    minimumBookingDays: 2,
    certifications: ['방수기능사', '건축물보수보강']
  }
};

// 작업 템플릿 생성 함수 (확장)
function createTask(
  id: string,
  name: string,
  category: string,
  description: string,
  duration: number,
  dependencies: string[] = [],
  contractorId?: string,
  estimatedCost?: number,
  additionalInfo?: Partial<Task>
): Task {
  return {
    id,
    name,
    type: category as any,
    duration,
    dependencies,
    ...additionalInfo
  } as Task;
}

// 주거공간(아파트) 전체 리모델링 작업 템플릿
export const residentialFullRemodelTasks: Task[] = [
  // 준비 단계
  createTask(
    'planning',
    '설계 및 계획 수립',
    'inspection',
    '현장 실측, 설계 도면 작성, 자재 선정',
    3,
    [],
    undefined,
    500000
  ),
  
  createTask(
    'permit',
    '허가 및 신고',
    'inspection',
    '관리사무소 신고, 층간소음 안내문 부착',
    1,
    ['planning'],
    undefined,
    100000
  ),
  
  // 철거 단계
  createTask(
    'protection',
    '양생 작업',
    'demolition',
    '공용부 보양, 엘리베이터 보양, 현관문 보호',
    1,
    ['permit'],
    'demolition-1',
    300000
  ),
  
  createTask(
    'demolition-interior',
    '내부 철거',
    'demolition',
    '기존 인테리어 철거, 벽체 철거, 천장 철거',
    3,
    ['protection'],
    'demolition-1',
    2000000
  ),
  
  createTask(
    'demolition-bathroom',
    '욕실 철거',
    'demolition',
    '욕실 타일 철거, 욕조 철거, 양변기 철거',
    2,
    ['protection'],
    'demolition-1',
    1500000
  ),
  
  createTask(
    'demolition-kitchen',
    '주방 철거',
    'demolition',
    '주방 가구 철거, 싱크대 철거, 타일 철거',
    2,
    ['protection'],
    'demolition-1',
    1000000
  ),
  
  createTask(
    'waste-disposal',
    '폐기물 처리',
    'demolition',
    '철거 폐기물 반출 및 처리',
    1,
    ['demolition-interior', 'demolition-bathroom', 'demolition-kitchen'],
    'demolition-1',
    800000
  ),
  
  // 기초 공사
  createTask(
    'electrical-rough',
    '전기 배선',
    'electrical',
    '전기 배선, 콘센트 위치 변경, 조명 배선',
    3,
    ['waste-disposal'],
    'electrical-1',
    3500000
  ),
  
  createTask(
    'plumbing-rough',
    '수도 배관',
    'plumbing',
    '급수/배수 배관, 온수 배관, 보일러 배관',
    3,
    ['waste-disposal'],
    'plumbing-1',
    2500000
  ),
  
  createTask(
    'wall-framing',
    '벽체 공사',
    'wall',
    '경량 벽체 설치, 단열재 시공',
    3,
    ['electrical-rough', 'plumbing-rough'],
    'carpentry-1',
    2000000
  ),
  
  createTask(
    'ceiling-framing',
    '천장 틀 공사',
    'ceiling',
    '천장 틀 설치, 우물천장 시공',
    2,
    ['wall-framing'],
    'carpentry-1',
    1500000
  ),
  
  // 마감 공사 - 바닥
  createTask(
    'floor-leveling',
    '바닥 미장',
    'flooring',
    '바닥 평탄화 작업, 방수 처리',
    2,
    ['wall-framing'],
    'tile-1',
    1200000
  ),
  
  createTask(
    'floor-heating',
    '바닥 난방',
    'flooring',
    '전기 온돌 또는 수온돌 시공',
    2,
    ['floor-leveling'],
    'plumbing-1',
    2000000
  ),
  
  createTask(
    'flooring-living',
    '거실/방 바닥재',
    'flooring',
    '강화마루 또는 원목마루 시공',
    3,
    ['floor-heating'],
    'carpentry-1',
    3500000
  ),
  
  // 마감 공사 - 욕실
  createTask(
    'bathroom-waterproof',
    '욕실 방수',
    'plumbing',
    '욕실 방수 처리 (3회 도포)',
    2,
    ['plumbing-rough'],
    'plumbing-1',
    800000
  ),
  
  createTask(
    'bathroom-tile',
    '욕실 타일',
    'tile',
    '욕실 벽/바닥 타일 시공',
    3,
    ['bathroom-waterproof'],
    'tile-1',
    2500000
  ),
  
  createTask(
    'bathroom-fixtures',
    '욕실 설비',
    'plumbing',
    '양변기, 세면대, 욕조/샤워부스 설치',
    2,
    ['bathroom-tile'],
    'plumbing-1',
    3000000
  ),
  
  // 마감 공사 - 주방
  createTask(
    'kitchen-tile',
    '주방 타일',
    'tile',
    '주방 벽 타일 시공',
    2,
    ['wall-framing'],
    'tile-1',
    1000000
  ),
  
  createTask(
    'kitchen-cabinet',
    '주방 가구',
    'furniture',
    '주방 상부장, 하부장 설치',
    3,
    ['kitchen-tile', 'flooring-living'],
    'carpentry-1',
    5000000
  ),
  
  createTask(
    'kitchen-countertop',
    '주방 상판',
    'furniture',
    '인조대리석 또는 석영 상판 설치',
    1,
    ['kitchen-cabinet'],
    'carpentry-1',
    2000000
  ),
  
  createTask(
    'kitchen-appliances',
    '주방 가전',
    'appliance',
    '가스레인지, 후드, 식기세척기 설치',
    1,
    ['kitchen-countertop', 'electrical-finish'],
    undefined,
    3000000
  ),
  
  // 마감 공사 - 벽/천장
  createTask(
    'ceiling-finish',
    '천장 마감',
    'ceiling',
    '천장 석고보드 마감, 몰딩 설치',
    3,
    ['ceiling-framing'],
    'carpentry-1',
    1800000
  ),
  
  createTask(
    'wall-finish',
    '벽체 마감',
    'wall',
    '석고보드 마감, 퍼티 작업',
    3,
    ['wall-framing', 'electrical-rough'],
    'carpentry-1',
    2000000
  ),
  
  createTask(
    'painting',
    '도장 공사',
    'painting',
    '천장, 벽면 도장 (친환경 페인트)',
    4,
    ['ceiling-finish', 'wall-finish'],
    'painting-1',
    2500000
  ),
  
  createTask(
    'wallpaper',
    '도배 공사',
    'wallpaper',
    '실크 벽지 또는 합지 벽지 시공',
    3,
    ['painting'],
    'painting-1',
    2000000
  ),
  
  // 목공 마감
  createTask(
    'doors',
    '문/문틀 설치',
    'carpentry',
    'ABS 도어 및 문틀 설치',
    2,
    ['wall-finish', 'flooring-living'],
    'carpentry-1',
    3000000
  ),
  
  createTask(
    'built-in-furniture',
    '붙박이장',
    'furniture',
    '침실 붙박이장, 현관 신발장 제작/설치',
    4,
    ['wallpaper'],
    'carpentry-1',
    4000000
  ),
  
  createTask(
    'window-frames',
    '창호 공사',
    'carpentry',
    '샷시 교체 또는 보수, 방충망 설치',
    2,
    ['wall-finish'],
    'carpentry-1',
    3500000
  ),
  
  // 전기 마감
  createTask(
    'electrical-finish',
    '전기 마감',
    'electrical',
    '스위치, 콘센트, 조명 설치',
    2,
    ['painting'],
    'electrical-1',
    2000000
  ),
  
  createTask(
    'lighting',
    '조명 설치',
    'electrical',
    '거실등, 방등, 간접조명 설치',
    1,
    ['electrical-finish', 'ceiling-finish'],
    'electrical-1',
    1500000
  ),
  
  // 최종 마감
  createTask(
    'final-inspection',
    '최종 검수',
    'inspection',
    '시공 품질 검수, 하자 체크',
    1,
    ['doors', 'built-in-furniture', 'kitchen-appliances', 'bathroom-fixtures', 'lighting'],
    undefined,
    0
  ),
  
  createTask(
    'touch-up',
    '하자 보수',
    'inspection',
    '검수 후 발견된 하자 보수',
    2,
    ['final-inspection'],
    undefined,
    500000
  ),
  
  createTask(
    'cleaning',
    '청소 및 정리',
    'cleaning',
    '시공 현장 청소, 보양재 제거',
    1,
    ['touch-up'],
    undefined,
    300000
  )
];

// 부분 리모델링 작업 템플릿 (욕실)
export const bathroomRemodelTasks: Task[] = [
  createTask('bath-planning', '욕실 설계', 'inspection', '욕실 실측 및 디자인 계획', 1),
  createTask('bath-protection', '양생 작업', 'demolition', '욕실 주변 보양', 1, ['bath-planning'], 'demolition-1', 100000),
  createTask('bath-demolition', '욕실 철거', 'demolition', '기존 욕실 완전 철거', 2, ['bath-protection'], 'demolition-1', 800000),
  createTask('bath-plumbing', '배관 공사', 'plumbing', '급수/배수 배관 교체', 2, ['bath-demolition'], 'plumbing-1', 1000000),
  createTask('bath-electrical', '전기 공사', 'electrical', '욕실 전기 배선', 1, ['bath-demolition'], 'electrical-1', 500000),
  createTask('bath-waterproof', '방수 공사', 'plumbing', '욕실 방수 3회 도포', 2, ['bath-plumbing'], 'plumbing-1', 500000),
  createTask('bath-tile', '타일 공사', 'tile', '벽/바닥 타일 시공', 3, ['bath-waterproof', 'bath-electrical'], 'tile-1', 1500000),
  createTask('bath-fixtures', '위생기구 설치', 'plumbing', '양변기, 세면대, 샤워부스 설치', 1, ['bath-tile'], 'plumbing-1', 2000000),
  createTask('bath-accessories', '액세서리 설치', 'plumbing', '수전, 거울, 수납장 설치', 1, ['bath-fixtures'], 'plumbing-1', 800000),
  createTask('bath-cleaning', '청소', 'cleaning', '욕실 청소 및 마무리', 1, ['bath-accessories'], undefined, 100000)
];

// 부분 리모델링 작업 템플릿 (주방)
export const kitchenRemodelTasks: Task[] = [
  createTask('kitchen-planning', '주방 설계', 'inspection', '주방 실측 및 디자인 계획', 1),
  createTask('kitchen-protection', '양생 작업', 'demolition', '주방 주변 보양', 1, ['kitchen-planning'], 'demolition-1', 100000),
  createTask('kitchen-demo', '주방 철거', 'demolition', '기존 주방 가구 및 타일 철거', 2, ['kitchen-protection'], 'demolition-1', 600000),
  createTask('kitchen-plumb', '배관 이설', 'plumbing', '싱크대 배관 이설', 1, ['kitchen-demo'], 'plumbing-1', 500000),
  createTask('kitchen-elec', '전기 공사', 'electrical', '주방 전기 배선 및 콘센트 추가', 2, ['kitchen-demo'], 'electrical-1', 800000),
  createTask('kitchen-wall-tile', '벽 타일', 'tile', '주방 벽면 타일 시공', 2, ['kitchen-plumb', 'kitchen-elec'], 'tile-1', 800000),
  createTask('kitchen-floor', '바닥 공사', 'flooring', '주방 바닥재 교체', 1, ['kitchen-demo'], 'carpentry-1', 600000),
  createTask('kitchen-upper', '상부장 설치', 'furniture', '주방 상부장 제작 및 설치', 2, ['kitchen-wall-tile'], 'carpentry-1', 2000000),
  createTask('kitchen-lower', '하부장 설치', 'furniture', '주방 하부장 제작 및 설치', 2, ['kitchen-floor'], 'carpentry-1', 2500000),
  createTask('kitchen-top', '상판 설치', 'furniture', '인조대리석 상판 설치', 1, ['kitchen-lower'], 'carpentry-1', 1500000),
  createTask('kitchen-sink', '싱크대 설치', 'plumbing', '싱크볼 및 수전 설치', 1, ['kitchen-top'], 'plumbing-1', 800000),
  createTask('kitchen-hood', '후드 설치', 'appliance', '레인지후드 설치', 1, ['kitchen-elec', 'kitchen-upper'], undefined, 1000000),
  createTask('kitchen-clean', '청소', 'cleaning', '주방 청소 및 마무리', 1, ['kitchen-sink', 'kitchen-hood'], undefined, 100000)
];

// 상업공간 인테리어 작업 템플릿 (카페)
export const cafeInteriorTasks: Task[] = [
  createTask('cafe-design', '디자인 및 설계', 'inspection', '컨셉 디자인, 도면 작성, 3D 모델링', 5, [], undefined, 3000000),
  createTask('cafe-permit', '인허가', 'inspection', '영업 신고, 건축 신고', 7, ['cafe-design'], undefined, 1000000),
  createTask('cafe-protection', '현장 보양', 'demolition', '공용부 및 주변 상가 보양', 1, ['cafe-permit'], 'demolition-1', 500000),
  createTask('cafe-demolition', '철거 공사', 'demolition', '기존 인테리어 전체 철거', 3, ['cafe-protection'], 'demolition-1', 3000000),
  createTask('cafe-hvac', '냉난방 공사', 'plumbing', '에어컨, 환기 시스템 설치', 3, ['cafe-demolition'], 'plumbing-1', 5000000),
  createTask('cafe-electrical-main', '전기 증설', 'electrical', '전기 용량 증설, 분전반 설치', 2, ['cafe-demolition'], 'electrical-1', 4000000),
  createTask('cafe-plumbing-main', '급배수 공사', 'plumbing', '주방, 화장실 급배수 배관', 3, ['cafe-demolition'], 'plumbing-1', 3000000),
  createTask('cafe-framing', '칸막이 공사', 'wall', '공간 구획, 칸막이 설치', 3, ['cafe-electrical-main', 'cafe-plumbing-main'], 'carpentry-1', 3500000),
  createTask('cafe-kitchen-floor', '주방 바닥', 'flooring', '주방 에폭시 바닥 시공', 2, ['cafe-plumbing-main'], 'tile-1', 2000000),
  createTask('cafe-hall-floor', '홀 바닥', 'flooring', '홀 바닥재 시공 (타일/마루)', 3, ['cafe-framing'], 'tile-1', 4000000),
  createTask('cafe-ceiling', '천장 공사', 'ceiling', '천장 틀, 조명박스, 마감', 4, ['cafe-hvac', 'cafe-electrical-main'], 'carpentry-1', 3500000),
  createTask('cafe-wall', '벽체 마감', 'wall', '벽체 마감 (도장/타일/패널)', 4, ['cafe-framing'], 'painting-1', 3000000),
  createTask('cafe-entrance', '파사드', 'carpentry', '입구 및 외부 사인물', 3, ['cafe-wall'], 'carpentry-1', 5000000),
  createTask('cafe-kitchen-equip', '주방 설비', 'appliance', '주방 기기 설치 (오븐, 커피머신 등)', 2, ['cafe-kitchen-floor', 'cafe-electrical-main'], undefined, 8000000),
  createTask('cafe-counter', '카운터/바', 'furniture', '주문 카운터 및 바 제작', 3, ['cafe-hall-floor'], 'carpentry-1', 4000000),
  createTask('cafe-furniture', '가구 제작', 'furniture', '테이블, 의자, 진열장', 4, ['cafe-hall-floor', 'cafe-wall'], 'carpentry-1', 5000000),
  createTask('cafe-lighting', '조명 설치', 'electrical', '매장 조명, 간접조명 설치', 2, ['cafe-ceiling'], 'electrical-1', 3000000),
  createTask('cafe-signage', '사인물', 'electrical', '간판, 메뉴판 제작/설치', 2, ['cafe-entrance', 'cafe-lighting'], undefined, 2500000),
  createTask('cafe-pos', 'POS/CCTV', 'electrical', 'POS 시스템, CCTV 설치', 1, ['cafe-counter', 'cafe-electrical-main'], undefined, 2000000),
  createTask('cafe-inspection', '준공 검사', 'inspection', '소방, 위생 검사', 2, ['cafe-kitchen-equip', 'cafe-pos'], undefined, 500000),
  createTask('cafe-cleaning', '청소', 'cleaning', '준공청소', 2, ['cafe-inspection'], undefined, 800000)
];

// 기본 인테리어 작업 템플릿 (옵시디언 가이드 기반)
export const basicInteriorTasks: Task[] = [
  // 1. 준비 단계
  createTask(
    'prep-planning',
    '설계 및 계획 수립',
    'preparation',
    '현장 실측, 컨셉 설정, 예산 계획',
    3,
    [],
    undefined,
    0,
    {
      criticalNotes: [
        '레이저 줄자로 정확한 실측 필수',
        '컨셉 설정 및 시각화 자료 준비',
        '예산 계획 수립 (여유자금 200-300만원 확보)'
      ],
      diyPossible: true,
      diyDifficulty: 'medium',
      costRange: { min: 0, max: 500000 }
    }
  ),
  
  createTask(
    'prep-permit',
    '관리사무소 신고 및 주민동의',
    'preparation',
    '공사 신고, 엘리베이터 사용료, 주민 동의서',
    1,
    ['prep-planning'],
    undefined,
    100000,
    {
      criticalNotes: [
        '행위허가 필요 여부 확인 (구조 변경 시)',
        '엘리베이터 사용료 및 보양 방법 확인',
        '공사 가능 시간 확인 (평일 9-18시)',
        '이웃 주민 사전 양해 (작은 선물과 함께)'
      ],
      diyPossible: true,
      diyDifficulty: 'easy',
      costRange: { min: 100000, max: 200000 }
    }
  ),
  
  // 2. 철거 단계
  createTask(
    'demo-protection',
    '양생 작업',
    'protection',
    '공용부 및 엘리베이터 보양, 현관문 보호',
    1,
    ['prep-permit'],
    'demolition-1',
    300000,
    {
      criticalNotes: [
        '공용부 보양 철저히',
        '엘리베이터 보양 (난간 또는 전체)',
        '현관문 보호 필수'
      ],
      diyPossible: true,
      diyDifficulty: 'easy',
      noiseLevel: 'low',
      costRange: { min: 200000, max: 300000 }
    }
  ),
  
  createTask(
    'demo-main',
    '철거 공사',
    'demolition',
    '기존 인테리어 철거, 폐기물 처리',
    2,
    ['demo-protection'],
    'demolition-1',
    1850000,
    {
      timeConstraints: {
        workingHours: '09:00-18:00',
        restrictedDays: [0, 6] // 주말 제한
      },
      noiseLevel: 'high',
      criticalNotes: [
        '소음 발생 최대 공정 - 민원 주의',
        '폐기물 처리 계획 수립',
        '숨겨진 누수, 곰팡이, 노후 배관 확인',
        '임시 작업등용 전구 남겨두기'
      ],
      diyPossible: true,
      diyDifficulty: 'hard',
      minimumWorkers: 2,
      costRange: { min: 1700000, max: 2000000 }
    }
  ),
  
  // 3. 기초 공사
  createTask(
    'electrical-basic',
    '전기 배선 공사',
    'electrical',
    '전기 배선, 콘센트/스위치 위치 변경',
    1,
    ['demo-main'],
    'electrical-1',
    1250000,
    {
      criticalNotes: [
        '안전과 직결 - 반드시 전문가 필수',
        '콘센트/스위치 위치 사전 결정',
        '고전력 가전제품 별도 회선 고려',
        '철거 시 타공 작업 미리 진행'
      ],
      diyPossible: false,
      costRange: { min: 1000000, max: 1500000 }
    }
  ),
  
  createTask(
    'plumbing-basic',
    '설비 공사',
    'plumbing',
    '급배수 배관, 온수 분배기, 보일러 점검',
    1,
    ['demo-main'],
    'plumbing-1',
    1500000,
    {
      criticalNotes: [
        '급배수 배관 전체 점검',
        '누수 테스트 필수 (휴지로 확인)',
        '보일러 분배기/연통 체크',
        '전기와 병렬 진행 가능'
      ],
      diyPossible: false,
      costRange: { min: 1000000, max: 2000000 }
    }
  ),
  
  // 4. 방수 작업
  createTask(
    'waterproof-bathroom',
    '욕실 방수',
    'waterproofing',
    '욕실 방수 3회 도포',
    1,
    ['plumbing-basic'],
    'waterproof-1',
    650000,
    {
      dryingTime: 24, // 24시간 건조
      weatherDependent: true,
      criticalNotes: [
        '방수 3회 도포 필수',
        '도포 후 24시간 건조',
        '물 채워 24시간 누수 테스트',
        '습도 70% 이하에서 작업'
      ],
      diyPossible: true,
      diyDifficulty: 'hard',
      costRange: { min: 500000, max: 800000 }
    }
  ),
  
  // 5. 타일 공사
  createTask(
    'tile-bathroom',
    '욕실 타일',
    'tile',
    '욕실 벽/바닥 타일 시공',
    2,
    ['waterproof-bathroom'],
    'tile-1',
    2500000,
    {
      dryingTime: 72, // 3일 양생
      criticalNotes: [
        '방수 완전 건조 후 시공',
        '평탄도 확인 필수',
        '타일 시공 후 1-3일 양생',
        '변기, 세면대 설치 연계 가능한 업체 선택'
      ],
      diyPossible: true,
      diyDifficulty: 'expert',
      minimumWorkers: 2,
      costRange: { min: 2000000, max: 3000000 }
    }
  ),
  
  // 6. 목공 작업
  createTask(
    'carpentry-main',
    '목공 작업',
    'carpentry',
    '문/문틀, 몰딩, 걸레받이, 아트월',
    3,
    ['electrical-basic', 'plumbing-basic'],
    'carpentry-1',
    1750000,
    {
      noiseLevel: 'medium',
      criticalNotes: [
        '인테리어의 뼈대를 세우는 중요한 작업',
        '다음 공정에 큰 영향',
        '먼지 발생 많음',
        '무거운 조명 설치 시 천장 보강'
      ],
      diyPossible: true,
      diyDifficulty: 'medium',
      costRange: { min: 1500000, max: 2000000 }
    }
  ),
  
  // 7. 페인트 작업
  createTask(
    'painting-wall',
    '페인트 공사',
    'painting',
    '벽면, 천장 페인트 (3회 도포)',
    2,
    ['carpentry-main'],
    'painting-1',
    750000,
    {
      dryingTime: 8, // 회당 2-3시간, 3회
      weatherDependent: true,
      criticalNotes: [
        '먼지 없는 환경에서 작업',
        '3회 도포 (회당 2-3시간 건조)',
        '친환경 페인트 사용',
        '도배 전 또는 대신 시공'
      ],
      diyPossible: true,
      diyDifficulty: 'easy',
      costRange: { min: 20000, max: 30000, unit: '평당' }
    }
  ),
  
  // 8. 바닥재 시공
  createTask(
    'flooring-main',
    '바닥재 시공',
    'flooring',
    '강화마루/장판 시공',
    2,
    ['carpentry-main'],
    'carpentry-1',
    2250000,
    {
      criticalNotes: [
        '바닥 습도/미장 상태 확인',
        '평탄도 확인 필수',
        '벽체/문틀과 1cm 간격 유지',
        '도배와 병렬 진행 가능'
      ],
      diyPossible: true,
      diyDifficulty: 'medium',
      costRange: { min: 1500000, max: 3000000 }
    }
  ),
  
  // 9. 도배 작업
  createTask(
    'wallpaper-main',
    '도배 공사',
    'wallpaper',
    '벽지 시공 (실크/합지)',
    2,
    ['carpentry-main', 'painting-wall'],
    'painting-1',
    2250000,
    {
      weatherDependent: true,
      criticalNotes: [
        '다른 공정(먼지 발생)과 분리하여 진행',
        '습도 관리 중요',
        '실내 온도 22도 유지',
        '충분한 건조 시간 확보'
      ],
      diyPossible: true,
      diyDifficulty: 'medium',
      costRange: { min: 1500000, max: 3000000 }
    }
  ),
  
  // 10. 가구 설치
  createTask(
    'furniture-install',
    '가구 설치',
    'furniture',
    '싱크대, 붙박이장, 신발장 설치',
    1,
    ['wallpaper-main', 'flooring-main'],
    'carpentry-1',
    3500000,
    {
      criticalNotes: [
        '싱크대 상판/싱크볼 교체 시 전문가 필수',
        '붙박이장, 신발장 설치',
        '중문은 가장 마지막에 설치',
        '가전제품 연결 확인'
      ],
      diyPossible: false,
      costRange: { min: 3000000, max: 4000000 }
    }
  ),
  
  // 11. 조명 설치
  createTask(
    'lighting-install',
    '조명 설치',
    'lighting',
    '조명기구 설치, 스위치/콘센트 마감',
    1,
    ['painting-wall', 'electrical-basic', 'furniture-install'],
    'electrical-1',
    1250000,
    {
      criticalNotes: [
        '조명 위치/종류 사전 결정',
        '무거운 조명은 천장 보강 확인',
        '전기 안전 확인',
        '스위치 2-3개로 분리 (밝기 조절)'
      ],
      diyPossible: true,
      diyDifficulty: 'medium',
      costRange: { min: 1000000, max: 1500000 }
    }
  ),
  
  // 12. 최종 단계
  createTask(
    'final-cleaning',
    '입주 청소',
    'cleaning',
    '전체 청소 및 실리콘 마감',
    1,
    ['furniture-install', 'lighting-install'],
    undefined,
    350000,
    {
      criticalNotes: [
        '천장→벽→바닥 순서로 청소',
        '수납장/서랍장 내부 청소',
        '실리콘 마감은 물기 완전 제거 후',
        '셀프 시 비용 절감 가능'
      ],
      diyPossible: true,
      diyDifficulty: 'easy',
      costRange: { min: 0, max: 350000 }
    }
  )
];

// 프로젝트 유형별 작업 템플릿 매핑
export const taskTemplates = {
  'residential-full': residentialFullRemodelTasks,
  'bathroom': bathroomRemodelTasks,
  'kitchen': kitchenRemodelTasks,
  'cafe': cafeInteriorTasks,
  'basic': basicInteriorTasks // 신규 추가
};

// 작업 기간 조정 함수 (프로젝트 규모에 따라)
export function adjustTaskDuration(tasks: Task[], sizeMultiplier: number = 1): Task[] {
  return tasks.map(task => ({
    ...task,
    duration: Math.ceil(task.duration * sizeMultiplier),
  }));
}

// 작업 검색 함수
export function findTasksByCategory(tasks: Task[], category: string): Task[] {
  return tasks.filter(task => task.type === category);
}

// 임계 경로 상의 작업 찾기
export function findCriticalTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.isCritical === true);
}

// 특정 업체가 담당하는 작업 찾기
export function findTasksByContractor(tasks: Task[], contractorId: string): Task[] {
  return [];
}

// 의존성이 있는 작업 찾기
export function findDependentTasks(tasks: Task[], taskId: string): Task[] {
  return tasks.filter(task => task.dependencies.includes(taskId));
}

// 작업 시간 제약 검증 함수
export function validateWorkingHours(task: Task, date: Date): boolean {
  if (!task.timeConstraints) return true;
  
  const dayOfWeek = date.getDay();
  if (task.timeConstraints.restrictedDays?.includes(dayOfWeek)) {
    return false;
  }
  
  if (task.timeConstraints.workingHours) {
    const hours = date.getHours();
    const [startHour] = task.timeConstraints.workingHours.split('-')[0].split(':').map(Number);
    const [endHour] = task.timeConstraints.workingHours.split('-')[1].split(':').map(Number);
    
    return hours >= startHour && hours < endHour;
  }
  
  return true;
}

// DIY 가능 작업 필터링 함수
export function filterDIYTasks(tasks: Task[], difficulty?: 'easy' | 'medium' | 'hard' | 'expert'): Task[] {
  return tasks.filter(task => {
    if (!task.diyPossible) return false;
    if (difficulty && task.diyDifficulty !== difficulty) return false;
    return true;
  });
}

// 날씨 영향 작업 확인 함수
export function getWeatherDependentTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.weatherDependent === true);
}

// 소음 레벨별 작업 그룹화 함수
export function groupTasksByNoiseLevel(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {
    high: [],
    medium: [],
    low: [],
    none: []
  };
  
  tasks.forEach(task => {
    const level = task.noiseLevel || 'none';
    grouped[level].push(task);
  });
  
  return grouped;
}

// 건조/양생 시간 계산 함수
export function calculateDryingTime(task: Task): number {
  return task.dryingTime || 0;
}

// 예산 범위 계산 함수
export function calculateBudgetRange(tasks: Task[]): { min: number, max: number, breakdown: any[] } {
  let min = 0;
  let max = 0;
  const breakdown: any[] = [];
  
  tasks.forEach(task => {
    if (task.costRange) {
      min += task.costRange.min;
      max += task.costRange.max;
      breakdown.push({
        taskId: task.id,
        taskName: task.name,
        min: task.costRange.min,
        max: task.costRange.max,
        unit: task.costRange.unit
      });
    }
  });
  
  return { min, max, breakdown };
}

// 작업별 필요 업체 추출 함수
export function getRequiredContractors(tasks: Task[]): string[] {
  const contractorTypes = new Set<string>();
  
  tasks.forEach(task => {
    if (!task.diyPossible || task.diyDifficulty === 'expert') {
      contractorTypes.add(task.type);
    }
  });
  
  return Array.from(contractorTypes);
}

// 프로젝트 저장소 (임시 - 실제로는 DB 사용)
const projectStorage = new Map<string, any>();

// 프로젝트 저장 함수
export async function saveProject(projectData: any): Promise<string> {
  const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // localStorage에 저장 (브라우저 저장소)
  if (typeof window !== 'undefined') {
    const projects = JSON.parse(localStorage.getItem('selffin-projects') || '{}');
    projects[projectId] = {
      ...projectData,
      id: projectId,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('selffin-projects', JSON.stringify(projects));
  }
  
  // 메모리 저장소에도 저장
  projectStorage.set(projectId, projectData);
  
  return projectId;
}

// 프로젝트 조회 함수
export async function getProject(projectId: string): Promise<any | null> {
  // localStorage에서 조회
  if (typeof window !== 'undefined') {
    const projects = JSON.parse(localStorage.getItem('selffin-projects') || '{}');
    if (projects[projectId]) {
      return projects[projectId];
    }
  }
  
  // 메모리 저장소에서 조회
  return projectStorage.get(projectId) || null;
}

// 모든 프로젝트 조회 함수
export async function getAllProjects(): Promise<any[]> {
  if (typeof window !== 'undefined') {
    const projects = JSON.parse(localStorage.getItem('selffin-projects') || '{}');
    return Object.values(projects);
  }
  
  return Array.from(projectStorage.values());
}