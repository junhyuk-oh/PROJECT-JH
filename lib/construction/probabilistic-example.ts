import { generateProbabilisticSchedule } from '../scheduleGenerator'
import { SpaceSelection } from '../types'
import { UserExpertise, EnvironmentFactors } from './probabilistic-scheduler'

// 사용 예시
export function runProbabilisticExample() {
  // 1. 프로젝트 공간 정보
  const spaces: SpaceSelection[] = [
    {
      id: 'living_room',
      name: '거실',
      estimatedArea: 10,
      actualArea: 10,
      scope: 'full',
      tasks: {
        flooring: ['hardwood'],
        walls: ['paint'],
        electrical: true,
        ceiling: ['paint']
      },
      priority: 1
    },
    {
      id: 'kitchen',
      name: '주방',
      estimatedArea: 5,
      actualArea: 5,
      scope: 'full',
      tasks: {
        flooring: ['tile'],
        walls: ['tile'],
        electrical: true,
        sink: 'full_replace'
      },
      priority: 2
    },
    {
      id: 'bathroom',
      name: '욕실',
      estimatedArea: 3,
      actualArea: 3,
      scope: 'full',
      tasks: {
        flooring: ['tile'],
        walls: ['tile'],
        renovation: 'full'
      },
      priority: 3
    }
  ]

  // 2. 사용자 숙련도 정보
  const userExpertise: UserExpertise = {
    level: 'intermediate',
    yearsOfExperience: 5,
    projectsCompleted: 12,
    averageDelayRate: 0.15,  // 평균 15% 지연
    specialties: ['painting', 'flooring']
  }

  // 3. 환경 변수
  const environmentFactors: EnvironmentFactors = {
    season: 'summer',
    weatherConditions: {
      rainProbability: 0.3,
      temperature: 28,
      humidity: 65
    },
    buildingAge: 15,
    floorLevel: 7,
    accessRestrictions: false
  }

  // 4. 확률적 스케줄 생성
  const result = generateProbabilisticSchedule(
    spaces,
    userExpertise,
    environmentFactors,
    5000  // 5000번 시뮬레이션
  )

  console.log('=== 확률적 공기 예측 결과 ===')
  console.log(result.formattedResult)

  // 5. 시나리오별 분석
  console.log('\n=== 시나리오별 상세 분석 ===')
  console.log(`낙관적 시나리오 (P10): ${result.forecast.p10Duration}일`)
  console.log(`- 날씨가 좋고 문제없이 진행될 경우`)
  console.log(`- 10% 확률로 이 기간 내 완료 가능`)

  console.log(`\n중간 시나리오 (P50): ${result.forecast.p50Duration}일`)
  console.log(`- 일반적인 진행 상황`)
  console.log(`- 50% 확률로 이 기간 내 완료 가능`)

  console.log(`\n비관적 시나리오 (P90): ${result.forecast.p90Duration}일`)
  console.log(`- 날씨, 자재 수급 등 문제 발생 시`)
  console.log(`- 90% 확률로 이 기간 내 완료 가능`)

  // 6. 리스크별 대응 방안
  console.log('\n=== 리스크별 대응 방안 ===')
  if (result.forecast.riskAnalysis.totalRiskScore > 0.6) {
    console.log('⚠️ 고위험 프로젝트')
    console.log('- 예비 일정 20% 이상 확보 필수')
    console.log('- 주요 자재 사전 확보')
    console.log('- 대체 작업자 확보')
  }

  // 7. 계절별 특수 고려사항
  if (environmentFactors.season === 'summer') {
    console.log('\n=== 여름철 특수 고려사항 ===')
    console.log('- 도장 작업 시 에어컨/제습기 가동')
    console.log('- 오전 시간대 집중 작업')
    console.log('- 작업자 휴식 시간 증가')
  } else if (environmentFactors.season === 'winter') {
    console.log('\n=== 겨울철 특수 고려사항 ===')
    console.log('- 난방 유지로 건조 시간 단축')
    console.log('- 동파 방지 조치')
    console.log('- 타일 작업 시 온도 관리')
  }

  // 8. 완료 확률 테이블
  console.log('\n=== 일정별 완료 확률 ===')
  const keyDays = [30, 35, 40, 45, 50, 55, 60]
  keyDays.forEach(days => {
    const prob = result.forecast.completionProbabilities.find(p => p.days >= days)
    if (prob) {
      console.log(`${days}일 내 완료 확률: ${(prob.probability * 100).toFixed(1)}%`)
    }
  })

  return result
}

// 다양한 시나리오 비교 함수
export function compareScenarios() {
  const spaces: SpaceSelection[] = [
    {
      id: 'living_room',
      name: '거실',
      estimatedArea: 10,
      actualArea: 10,
      scope: 'full',
      tasks: {
        flooring: ['hardwood'],
        walls: ['paint'],
        electrical: true
      },
      priority: 1
    }
  ]

  // 시나리오 1: 초보자 + 겨울
  const beginner: UserExpertise = {
    level: 'beginner',
    yearsOfExperience: 1,
    projectsCompleted: 2,
    averageDelayRate: 0.25,
    specialties: []
  }

  const winter: EnvironmentFactors = {
    season: 'winter',
    weatherConditions: {
      rainProbability: 0.4,
      temperature: 5,
      humidity: 30
    },
    buildingAge: 20,
    floorLevel: 15,
    accessRestrictions: true
  }

  // 시나리오 2: 전문가 + 봄
  const expert: UserExpertise = {
    level: 'expert',
    yearsOfExperience: 15,
    projectsCompleted: 100,
    averageDelayRate: 0.05,
    specialties: ['flooring', 'painting', 'electrical']
  }

  const spring: EnvironmentFactors = {
    season: 'spring',
    weatherConditions: {
      rainProbability: 0.2,
      temperature: 20,
      humidity: 50
    },
    buildingAge: 5,
    floorLevel: 2,
    accessRestrictions: false
  }

  console.log('=== 시나리오 비교 분석 ===\n')

  // 시나리오 1 실행
  console.log('📊 시나리오 1: 초보자 + 겨울 + 고층')
  const result1 = generateProbabilisticSchedule(spaces, beginner, winter, 1000)
  console.log(`- 예상 공기: ${result1.forecast.expectedDuration.toFixed(1)}일`)
  console.log(`- 90% 완료: ${result1.forecast.p90Duration}일`)
  console.log(`- 리스크: ${(result1.forecast.riskAnalysis.totalRiskScore * 100).toFixed(0)}%`)

  // 시나리오 2 실행
  console.log('\n📊 시나리오 2: 전문가 + 봄 + 저층')
  const result2 = generateProbabilisticSchedule(spaces, expert, spring, 1000)
  console.log(`- 예상 공기: ${result2.forecast.expectedDuration.toFixed(1)}일`)
  console.log(`- 90% 완료: ${result2.forecast.p90Duration}일`)
  console.log(`- 리스크: ${(result2.forecast.riskAnalysis.totalRiskScore * 100).toFixed(0)}%`)

  // 차이 분석
  const timeDiff = result1.forecast.expectedDuration - result2.forecast.expectedDuration
  const timeDiffPercent = (timeDiff / result2.forecast.expectedDuration) * 100

  console.log('\n📈 차이 분석')
  console.log(`- 공기 차이: ${timeDiff.toFixed(1)}일 (${timeDiffPercent.toFixed(0)}% 증가)`)
  console.log(`- 주요 원인:`)
  console.log(`  • 숙련도 차이: ${beginner.level} vs ${expert.level}`)
  console.log(`  • 계절 영향: ${winter.season} vs ${spring.season}`)
  console.log(`  • 접근성: ${winter.floorLevel}층 vs ${spring.floorLevel}층`)

  return { scenario1: result1, scenario2: result2 }
}