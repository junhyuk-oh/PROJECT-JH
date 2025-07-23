import { Task } from '../../types'
import { WEEKDAYS, NOISE_LEVELS, DIY_DIFFICULTY } from '../index'

/**
 * 기본 인테리어 작업 템플릿 (옵시디언 가이드 기반)
 */
export const basicInteriorTasks: Task[] = [
  // 1. 준비 단계
  {
    id: 'prep-planning',
    name: '설계 및 계획 수립',
    type: 'preparation',
    duration: 3,
    dependencies: [],
    criticalNotes: [
      '레이저 줄자로 정확한 실측 필수',
      '컨셉 설정 및 시각화 자료 준비',
      '예산 계획 수립 (여유자금 200-300만원 확보)'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.MEDIUM,
    costRange: { min: 0, max: 500000 }
  },
  
  {
    id: 'prep-permit',
    name: '관리사무소 신고 및 주민동의',
    type: 'preparation',
    duration: 1,
    dependencies: ['prep-planning'],
    criticalNotes: [
      '행위허가 필요 여부 확인 (구조 변경 시)',
      '엘리베이터 사용료 및 보양 방법 확인',
      '공사 가능 시간 확인 (평일 9-18시)',
      '이웃 주민 사전 양해 (작은 선물과 함께)'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.EASY,
    costRange: { min: 100000, max: 200000 }
  },
  
  // 2. 철거 단계
  {
    id: 'demo-protection',
    name: '양생 작업',
    type: 'protection',
    duration: 1,
    dependencies: ['prep-permit'],
    criticalNotes: [
      '공용부 보양 철저히',
      '엘리베이터 보양 (난간 또는 전체)',
      '현관문 보호 필수'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.EASY,
    noiseLevel: NOISE_LEVELS.LOW,
    costRange: { min: 200000, max: 300000 }
  },
  
  {
    id: 'demo-main',
    name: '철거 공사',
    type: 'demolition',
    duration: 2,
    dependencies: ['demo-protection'],
    timeConstraints: {
      workingHours: '09:00-18:00',
      restrictedDays: [WEEKDAYS.SUNDAY, WEEKDAYS.SATURDAY]
    },
    noiseLevel: NOISE_LEVELS.HIGH,
    criticalNotes: [
      '소음 발생 최대 공정 - 민원 주의',
      '폐기물 처리 계획 수립',
      '숨겨진 누수, 곰팡이, 노후 배관 확인',
      '임시 작업등용 전구 남겨두기'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.HARD,
    minimumWorkers: 2,
    costRange: { min: 1700000, max: 2000000 }
  },
  
  // 3. 기초 공사
  {
    id: 'electrical-basic',
    name: '전기 배선 공사',
    type: 'electrical',
    duration: 1,
    dependencies: ['demo-main'],
    criticalNotes: [
      '안전과 직결 - 반드시 전문가 필수',
      '콘센트/스위치 위치 사전 결정',
      '고전력 가전제품 별도 회선 고려',
      '철거 시 타공 작업 미리 진행'
    ],
    diyPossible: false,
    costRange: { min: 1000000, max: 1500000 }
  },
  
  {
    id: 'plumbing-basic',
    name: '설비 공사',
    type: 'plumbing',
    duration: 1,
    dependencies: ['demo-main'],
    criticalNotes: [
      '급배수 배관 전체 점검',
      '누수 테스트 필수 (휴지로 확인)',
      '보일러 분배기/연통 체크',
      '전기와 병렬 진행 가능'
    ],
    diyPossible: false,
    costRange: { min: 1000000, max: 2000000 }
  },
  
  // 4. 방수 작업
  {
    id: 'waterproof-bathroom',
    name: '욕실 방수',
    type: 'waterproofing',
    duration: 1,
    dependencies: ['plumbing-basic'],
    dryingTime: 24, // 24시간 건조
    weatherDependent: true,
    criticalNotes: [
      '방수 3회 도포 필수',
      '도포 후 24시간 건조',
      '물 채워 24시간 누수 테스트',
      '습도 70% 이하에서 작업'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.HARD,
    costRange: { min: 500000, max: 800000 }
  },
  
  // 5. 타일 공사
  {
    id: 'tile-bathroom',
    name: '욕실 타일',
    type: 'tile',
    duration: 2,
    dependencies: ['waterproof-bathroom'],
    dryingTime: 72, // 3일 양생
    criticalNotes: [
      '방수 완전 건조 후 시공',
      '평탄도 확인 필수',
      '타일 시공 후 1-3일 양생',
      '변기, 세면대 설치 연계 가능한 업체 선택'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.EXPERT,
    minimumWorkers: 2,
    costRange: { min: 2000000, max: 3000000 }
  },
  
  // 6. 목공 작업
  {
    id: 'carpentry-main',
    name: '목공 작업',
    type: 'carpentry',
    duration: 3,
    dependencies: ['electrical-basic', 'plumbing-basic'],
    noiseLevel: NOISE_LEVELS.MEDIUM,
    criticalNotes: [
      '인테리어의 뼈대를 세우는 중요한 작업',
      '다음 공정에 큰 영향',
      '먼지 발생 많음',
      '무거운 조명 설치 시 천장 보강'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.MEDIUM,
    costRange: { min: 1500000, max: 2000000 }
  },
  
  // 7. 페인트 작업
  {
    id: 'painting-wall',
    name: '페인트 공사',
    type: 'painting',
    duration: 2,
    dependencies: ['carpentry-main'],
    dryingTime: 8, // 회당 2-3시간, 3회
    weatherDependent: true,
    criticalNotes: [
      '먼지 없는 환경에서 작업',
      '3회 도포 (회당 2-3시간 건조)',
      '친환경 페인트 사용',
      '도배 전 또는 대신 시공'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.EASY,
    costRange: { min: 20000, max: 30000, unit: '평당' }
  },
  
  // 8. 바닥재 시공
  {
    id: 'flooring-main',
    name: '바닥재 시공',
    type: 'flooring',
    duration: 2,
    dependencies: ['carpentry-main'],
    criticalNotes: [
      '바닥 습도/미장 상태 확인',
      '평탄도 확인 필수',
      '벽체/문틀과 1cm 간격 유지',
      '도배와 병렬 진행 가능'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.MEDIUM,
    costRange: { min: 1500000, max: 3000000 }
  },
  
  // 9. 도배 작업
  {
    id: 'wallpaper-main',
    name: '도배 공사',
    type: 'wallpaper',
    duration: 2,
    dependencies: ['carpentry-main', 'painting-wall'],
    weatherDependent: true,
    criticalNotes: [
      '다른 공정(먼지 발생)과 분리하여 진행',
      '습도 관리 중요',
      '실내 온도 22도 유지',
      '충분한 건조 시간 확보'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.MEDIUM,
    costRange: { min: 1500000, max: 3000000 }
  },
  
  // 10. 가구 설치
  {
    id: 'furniture-install',
    name: '가구 설치',
    type: 'furniture',
    duration: 1,
    dependencies: ['wallpaper-main', 'flooring-main'],
    criticalNotes: [
      '싱크대 상판/싱크볼 교체 시 전문가 필수',
      '붙박이장, 신발장 설치',
      '중문은 가장 마지막에 설치',
      '가전제품 연결 확인'
    ],
    diyPossible: false,
    costRange: { min: 3000000, max: 4000000 }
  },
  
  // 11. 조명 설치
  {
    id: 'lighting-install',
    name: '조명 설치',
    type: 'lighting',
    duration: 1,
    dependencies: ['painting-wall', 'electrical-basic', 'furniture-install'],
    criticalNotes: [
      '조명 위치/종류 사전 결정',
      '무거운 조명은 천장 보강 확인',
      '전기 안전 확인',
      '스위치 2-3개로 분리 (밝기 조절)'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.MEDIUM,
    costRange: { min: 1000000, max: 1500000 }
  },
  
  // 12. 최종 단계
  {
    id: 'final-cleaning',
    name: '입주 청소',
    type: 'cleaning',
    duration: 1,
    dependencies: ['furniture-install', 'lighting-install'],
    criticalNotes: [
      '천장→벽→바닥 순서로 청소',
      '수납장/서랍장 내부 청소',
      '실리콘 마감은 물기 완전 제거 후',
      '셀프 시 비용 절감 가능'
    ],
    diyPossible: true,
    diyDifficulty: DIY_DIFFICULTY.EASY,
    costRange: { min: 0, max: 350000 }
  }
]