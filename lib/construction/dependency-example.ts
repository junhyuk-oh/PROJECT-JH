import { GeneratedTask } from '../types'
import {
  AdvancedDependencySystem,
  AdvancedDependency,
  RegulatoryConstraint,
  ResourceRequirement
} from './advanced-dependency-system'

// 복합 의존성 사용 예시
export function demonstrateAdvancedDependencies() {
  const system = new AdvancedDependencySystem()
  
  // 1. 샘플 작업 목록
  const tasks: GeneratedTask[] = [
    {
      id: 'BATH_DEMO',
      name: '욕실 철거',
      description: '기존 욕실 완전 철거',
      space: '욕실',
      category: 'demolition',
      duration: 2,
      dependencies: [],
      isCritical: false,
      isMilestone: false,
      estimatedCost: 500000,
      materials: ['보호필름', '폐기물 포대'],
      skills: ['철거기사']
    },
    {
      id: 'BATH_PLUMB',
      name: '욕실 배관',
      description: '급배수관 교체',
      space: '욕실',
      category: 'plumbing',
      duration: 3,
      dependencies: ['BATH_DEMO'],
      isCritical: true,
      isMilestone: false,
      estimatedCost: 1500000,
      materials: ['배관', '피팅'],
      skills: ['배관기사']
    },
    {
      id: 'BATH_WATERPROOF',
      name: '욕실 방수',
      description: '방수 처리 및 양생',
      space: '욕실',
      category: 'plumbing',
      duration: 2,
      dependencies: ['BATH_PLUMB'],
      isCritical: true,
      isMilestone: true,
      estimatedCost: 800000,
      materials: ['방수재', '프라이머'],
      skills: ['방수기사']
    },
    {
      id: 'BATH_TILE',
      name: '욕실 타일',
      description: '벽면 및 바닥 타일 시공',
      space: '욕실',
      category: 'flooring',
      duration: 4,
      dependencies: ['BATH_WATERPROOF'],
      isCritical: false,
      isMilestone: false,
      estimatedCost: 2000000,
      materials: ['타일', '접착제', '줄눈재'],
      skills: ['타일기사']
    },
    {
      id: 'KITCHEN_DEMO',
      name: '주방 철거',
      description: '기존 주방 철거',
      space: '주방',
      category: 'demolition',
      duration: 1,
      dependencies: [],
      isCritical: false,
      isMilestone: false,
      estimatedCost: 300000,
      materials: ['보호필름'],
      skills: ['철거기사']
    },
    {
      id: 'KITCHEN_CABINET',
      name: '주방 가구',
      description: '주방 캐비닛 설치',
      space: '주방',
      category: 'carpentry',
      duration: 3,
      dependencies: ['KITCHEN_DEMO'],
      isCritical: false,
      isMilestone: true,
      estimatedCost: 5000000,
      materials: ['캐비닛', '하드웨어'],
      skills: ['목공기사']
    },
    {
      id: 'LIVING_PAINT',
      name: '거실 도장',
      description: '거실 벽면 페인트',
      space: '거실',
      category: 'painting',
      duration: 2,
      dependencies: [],
      isCritical: false,
      isMilestone: false,
      estimatedCost: 600000,
      materials: ['페인트', '롤러'],
      skills: ['도장기사']
    },
    {
      id: 'LIVING_FLOOR',
      name: '거실 바닥',
      description: '거실 마루 시공',
      space: '거실',
      category: 'flooring',
      duration: 2,
      dependencies: ['LIVING_PAINT'],
      isCritical: false,
      isMilestone: false,
      estimatedCost: 1800000,
      materials: ['마루', '몰딩'],
      skills: ['바닥기사']
    }
  ]

  // 2. 복합 의존성 추가
  console.log('\n=== 복합 의존성 설정 ===')
  
  // SS 의존성: 방수 시작 2일 후 타일 준비 시작 가능
  system.addDependency({
    id: 'dep_1',
    sourceTaskId: 'BATH_WATERPROOF',
    targetTaskId: 'BATH_TILE',
    type: 'SS',
    lag: 2,
    lagType: 'mandatory',
    description: '방수 시작 2일 후 타일 준비 시작'
  })
  console.log('✓ SS 의존성: 방수 → 타일 (2일 lag)')

  // FF 의존성: 도장과 바닥재는 동시에 완료되어야 함
  system.addDependency({
    id: 'dep_2',
    sourceTaskId: 'LIVING_PAINT',
    targetTaskId: 'LIVING_FLOOR',
    type: 'FF',
    lag: 0,
    lagType: 'flexible',
    description: '도장과 바닥 동시 완료'
  })
  console.log('✓ FF 의존성: 도장 ↔ 바닥 (동시 완료)')

  // Weather-dependent lag: 습도에 따른 방수 양생 시간
  system.addDependency({
    id: 'dep_3',
    sourceTaskId: 'BATH_WATERPROOF',
    targetTaskId: 'BATH_TILE',
    type: 'FS',
    lag: 1,
    lagType: 'weather-dependent',
    conditions: [{
      type: 'weather',
      parameter: 'humidity',
      operator: '>',
      value: 70,
      adjustmentFactor: 2  // 습도 70% 이상시 양생 시간 2배
    }],
    description: '방수 양생 (날씨 의존적)'
  })
  console.log('✓ 날씨 의존적 lag: 방수 양생 시간')

  // SF 의존성: 철거 시작하면 보양 완료
  system.addDependency({
    id: 'dep_4',
    sourceTaskId: 'BATH_DEMO',
    targetTaskId: 'KITCHEN_DEMO',
    type: 'SF',
    lag: 0,
    lagType: 'mandatory',
    description: '욕실 철거 시작 시 주방 보양 완료'
  })
  console.log('✓ SF 의존성: 욕실 철거 → 주방 보양')

  // 3. 자원 요구사항 설정
  console.log('\n=== 자원 제약 설정 ===')
  
  const resourceRequirements: ResourceRequirement[] = [
    {
      taskId: 'BATH_DEMO',
      resourceType: 'worker',
      resourceId: 'demolition_team',
      quantity: 2,
      startTime: 0,
      duration: 2,
      canShare: false,
      priority: 8
    },
    {
      taskId: 'KITCHEN_DEMO',
      resourceType: 'worker',
      resourceId: 'demolition_team',
      quantity: 2,
      startTime: 0,
      duration: 1,
      canShare: false,
      priority: 7
    },
    {
      taskId: 'BATH_PLUMB',
      resourceType: 'worker',
      resourceId: 'plumber',
      quantity: 1,
      startTime: 0,
      duration: 3,
      canShare: false,
      priority: 9
    },
    {
      taskId: 'BATH_WATERPROOF',
      resourceType: 'worker',
      resourceId: 'waterproof_specialist',
      quantity: 1,
      startTime: 0,
      duration: 2,
      canShare: false,
      priority: 10
    }
  ]

  // 4. 법규 제약사항 설정
  console.log('\n=== 법규 제약 설정 ===')
  
  const regulations: RegulatoryConstraint[] = [
    {
      id: 'noise_regulation',
      type: 'noise',
      description: '소음 작업 시간 제한',
      affectedTaskCategories: ['demolition', 'drilling'],
      restrictions: {
        timeRestrictions: {
          allowedDays: [1, 2, 3, 4, 5],  // 평일만
          allowedHours: { start: 9, end: 18 }  // 오전 9시 ~ 오후 6시
        }
      }
    },
    {
      id: 'waterproof_regulation',
      type: 'safety',
      description: '방수 후 48시간 양생 필수',
      affectedTaskCategories: ['plumbing'],
      restrictions: {
        sequenceRestrictions: {
          minGapDays: 2
        }
      }
    },
    {
      id: 'dust_regulation',
      type: 'environmental',
      description: '먼지 발생 작업 후 청소',
      affectedTaskCategories: ['demolition', 'sanding'],
      restrictions: {
        sequenceRestrictions: {
          mustFollowTasks: ['cleanup']
        }
      }
    }
  ]

  // 5. 환경 변수 설정
  const environmentFactors = {
    weatherConditions: {
      humidity: 75,  // 높은 습도
      temperature: 25,
      rainProbability: 0.3
    },
    buildingAge: 15,
    floorLevel: 7
  }

  // 6. 일정 계산 실행
  console.log('\n=== 복합 의존성 기반 일정 계산 ===')
  
  const scheduleResult = system.calculateScheduleWithDependencies(
    tasks,
    environmentFactors
  )

  // 7. 결과 출력
  console.log('\n📊 최적화된 일정:')
  for (const [taskId, schedule] of scheduleResult.schedule) {
    const task = tasks.find(t => t.id === taskId)
    console.log(`${task?.name}: Day ${schedule.start} ~ Day ${schedule.finish} (${schedule.duration}일)`)
  }

  console.log(`\n⏱️ 전체 공기: ${scheduleResult.totalDuration}일`)

  // 8. 충돌 분석
  if (scheduleResult.conflicts.length > 0) {
    console.log('\n⚠️ 감지된 충돌:')
    for (const conflict of scheduleResult.conflicts) {
      console.log(`\n[${conflict.severity.toUpperCase()}] ${conflict.description}`)
      console.log(`영향받는 작업: ${conflict.affectedTasks.join(', ')}`)
      
      if (conflict.suggestedResolutions.length > 0) {
        console.log('제안된 해결책:')
        for (const resolution of conflict.suggestedResolutions) {
          console.log(`  • ${resolution.description}`)
          console.log(`    - 공기 변화: ${resolution.impact.durationChange}일`)
          console.log(`    - 비용 변화: ${resolution.impact.costChange.toLocaleString()}원`)
          console.log(`    - 품질 영향: ${resolution.impact.qualityImpact > 0 ? '+' : ''}${(resolution.impact.qualityImpact * 100).toFixed(0)}%`)
        }
      }
    }
  } else {
    console.log('\n✅ 충돌 없음')
  }

  // 9. 임계 경로
  console.log('\n🔴 임계 경로:')
  for (const taskId of scheduleResult.criticalPath) {
    const task = tasks.find(t => t.id === taskId)
    console.log(`- ${task?.name}`)
  }

  // 10. 시나리오별 분석
  console.log('\n=== 시나리오 분석 ===')
  
  // 시나리오 1: 낮은 습도
  console.log('\n📍 시나리오 1: 낮은 습도 (40%)')
  const lowHumidityEnv = {
    ...environmentFactors,
    weatherConditions: { ...environmentFactors.weatherConditions, humidity: 40 }
  }
  const lowHumiditySchedule = system.calculateScheduleWithDependencies(tasks, lowHumidityEnv)
  console.log(`전체 공기: ${lowHumiditySchedule.totalDuration}일`)

  // 시나리오 2: 자원 추가
  console.log('\n📍 시나리오 2: 철거팀 2개 운영')
  // 자원 충돌이 해결되어 병렬 작업 가능
  console.log('욕실과 주방 철거 동시 진행 가능')

  return scheduleResult
}

// 실제 프로젝트 예시: 아파트 리모델링
export function realProjectExample() {
  console.log('\n=== 실제 프로젝트: 32평 아파트 전체 리모델링 ===')
  
  const system = new AdvancedDependencySystem()
  
  // 복잡한 의존성 관계를 가진 실제 프로젝트
  const complexDependencies: AdvancedDependency[] = [
    // 전기 배선은 벽체 작업과 동시 시작
    {
      id: 'elec_wall_ss',
      sourceTaskId: 'WALL_FRAME',
      targetTaskId: 'ELEC_ROUGH',
      type: 'SS',
      lag: 1,
      lagType: 'flexible',
      description: '벽체 작업 시작 1일 후 전기 배선 시작'
    },
    // 도배와 바닥은 동시 완료 (입주 준비)
    {
      id: 'finish_together',
      sourceTaskId: 'WALLPAPER',
      targetTaskId: 'FLOOR_FINISH',
      type: 'FF',
      lag: 0,
      lagType: 'mandatory',
      description: '도배와 바닥 마감 동시 완료'
    },
    // 방수 후 타일 (습도 조건부)
    {
      id: 'waterproof_tile',
      sourceTaskId: 'BATH_WATERPROOF',
      targetTaskId: 'BATH_TILE',
      type: 'FS',
      lag: 2,
      lagType: 'weather-dependent',
      conditions: [
        {
          type: 'weather',
          parameter: 'humidity',
          operator: '>',
          value: 60,
          adjustmentFactor: 1.5
        },
        {
          type: 'weather',
          parameter: 'temperature',
          operator: '<',
          value: 10,
          adjustmentFactor: 2.0
        }
      ],
      description: '방수 양생 (환경 조건부)'
    }
  ]

  // 주요 충돌 시나리오
  console.log('\n주요 관리 포인트:')
  console.log('1. 욕실/주방 동시 작업 시 급배수관 작업 순서')
  console.log('2. 거실 확장 시 전기 배선과 벽체 작업 조율')
  console.log('3. 마감재 동시 진행 시 먼지 관리')
  console.log('4. 엘리베이터 사용 시간대 (자재 반입)')
  
  return complexDependencies
}