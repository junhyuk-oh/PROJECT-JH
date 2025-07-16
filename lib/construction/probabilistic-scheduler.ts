import { GeneratedTask } from '../types'

// PERT 분포를 위한 타입 정의
export interface ProbabilisticDuration {
  optimistic: number      // 최적 시나리오 (P10)
  mostLikely: number     // 가장 가능성 높은 (P50)
  pessimistic: number    // 최악 시나리오 (P90)
  variance: number       // 분산
  standardDeviation: number // 표준편차
}

// 사용자 숙련도 타입
export interface UserExpertise {
  level: 'beginner' | 'intermediate' | 'expert'
  yearsOfExperience: number
  projectsCompleted: number
  averageDelayRate: number  // 평균 지연율 (과거 데이터 기반)
  specialties: string[]     // 특화 분야
}

// 환경 변수 타입
export interface EnvironmentFactors {
  season: 'spring' | 'summer' | 'fall' | 'winter'
  weatherConditions: {
    rainProbability: number    // 0-1
    temperature: number        // 섭씨
    humidity: number          // 0-100%
  }
  buildingAge: number         // 건물 연식
  floorLevel: number         // 층수 (고층일수록 자재 운반 시간 증가)
  accessRestrictions: boolean // 접근 제한 여부
}

// 리스크 요인
export interface RiskFactor {
  type: 'weather' | 'material' | 'labor' | 'complexity' | 'regulation'
  impact: number        // 0-1 (영향도)
  probability: number   // 0-1 (발생 확률)
  mitigation: string   // 대응 방안
}

// 시뮬레이션 결과
export interface SimulationResult {
  projectDuration: number
  criticalPath: string[]
  delayProbability: number
  riskFactors: RiskFactor[]
}

// 확률적 예측 결과
export interface ProbabilisticForecast {
  p10Duration: number      // 10% 확률로 완료
  p50Duration: number      // 50% 확률로 완료
  p90Duration: number      // 90% 확률로 완료
  expectedDuration: number // PERT 기댓값
  confidence90Range: {     // 90% 신뢰구간
    min: number
    max: number
  }
  completionProbabilities: Array<{
    days: number
    probability: number
  }>
  riskAnalysis: {
    highRiskTasks: string[]
    totalRiskScore: number
    recommendations: string[]
  }
}

export class ProbabilisticScheduler {
  private historicalData: Map<string, number[]> = new Map()
  
  constructor() {
    // 과거 프로젝트 데이터 로드 (실제로는 DB에서)
    this.loadHistoricalData()
  }

  // 1. PERT 분포 기반 공기 예측 함수
  calculatePERTDuration(
    baseMinDuration: number,
    baseMaxDuration: number,
    taskComplexity: number, // 0-1
    taskCategory: string
  ): ProbabilisticDuration {
    // 과거 데이터 기반 보정
    const historicalFactor = this.getHistoricalFactor(taskCategory)
    
    // 복잡도 기반 조정
    const complexityMultiplier = 1 + (taskComplexity * 0.5)
    
    // PERT 3점 추정
    const optimistic = baseMinDuration * 0.8 * historicalFactor
    const mostLikely = (baseMinDuration + baseMaxDuration) / 2 * complexityMultiplier * historicalFactor
    const pessimistic = baseMaxDuration * 1.5 * complexityMultiplier * historicalFactor
    
    // PERT 기댓값 = (O + 4M + P) / 6
    // const expected = (optimistic + 4 * mostLikely + pessimistic) / 6
    
    // 분산 = ((P - O) / 6)²
    const variance = Math.pow((pessimistic - optimistic) / 6, 2)
    const standardDeviation = Math.sqrt(variance)
    
    return {
      optimistic,
      mostLikely,
      pessimistic,
      variance,
      standardDeviation
    }
  }

  // 2. 사용자 숙련도별 공기 보정 알고리즘
  adjustDurationByExpertise(
    baseDuration: ProbabilisticDuration,
    expertise: UserExpertise,
    taskCategory: string
  ): ProbabilisticDuration {
    // 숙련도 기본 계수
    const expertiseFactors = {
      beginner: 1.3,      // 30% 더 소요
      intermediate: 1.0,   // 기본값
      expert: 0.85        // 15% 단축
    }
    
    // 경험 연수에 따른 추가 보정 (최대 20% 단축)
    const experienceFactor = Math.max(0.8, 1 - (expertise.yearsOfExperience * 0.02))
    
    // 특화 분야 보너스
    const specialtyBonus = expertise.specialties.includes(taskCategory) ? 0.9 : 1.0
    
    // 과거 지연율 반영
    const delayFactor = 1 + expertise.averageDelayRate
    
    // 종합 조정 계수
    const totalFactor = expertiseFactors[expertise.level] * 
                       experienceFactor * 
                       specialtyBonus * 
                       delayFactor
    
    return {
      optimistic: baseDuration.optimistic * totalFactor * 0.9, // 낙관적 시나리오는 덜 보수적
      mostLikely: baseDuration.mostLikely * totalFactor,
      pessimistic: baseDuration.pessimistic * totalFactor * 1.1, // 비관적 시나리오는 더 보수적
      variance: baseDuration.variance * Math.pow(totalFactor, 2),
      standardDeviation: baseDuration.standardDeviation * totalFactor
    }
  }

  // 3. 날씨/계절 영향도 반영 로직
  adjustDurationByEnvironment(
    baseDuration: ProbabilisticDuration,
    environment: EnvironmentFactors,
    taskCategory: string
  ): ProbabilisticDuration {
    let weatherFactor = 1.0
    
    // 계절별 기본 영향도
    const seasonFactors = {
      spring: 1.0,   // 기준
      summer: 1.1,   // 더위로 인한 생산성 저하
      fall: 1.0,     // 기준
      winter: 1.2    // 추위, 일조시간 감소
    }
    
    // 작업 카테고리별 날씨 민감도
    const weatherSensitivity = {
      demolition: 0.3,      // 낮음
      electrical: 0.2,      // 낮음
      plumbing: 0.4,        // 중간 (동파 위험)
      carpentry: 0.5,       // 중간
      painting: 0.8,        // 높음 (습도 영향)
      flooring: 0.6,        // 중간 (습도 영향)
      cleanup: 0.1          // 매우 낮음
    }
    
    const sensitivity = weatherSensitivity[taskCategory as keyof typeof weatherSensitivity] || 0.5
    
    // 비 확률 영향
    if (environment.weatherConditions.rainProbability > 0.5) {
      weatherFactor *= (1 + sensitivity * 0.3)
    }
    
    // 온도 영향 (15-25도가 최적)
    const tempDeviation = Math.abs(environment.weatherConditions.temperature - 20)
    if (tempDeviation > 10) {
      weatherFactor *= (1 + sensitivity * 0.2)
    }
    
    // 습도 영향 (도장, 도배 작업)
    if ((taskCategory === 'painting' || taskCategory === 'flooring') && 
        environment.weatherConditions.humidity > 70) {
      weatherFactor *= 1.3  // 건조 시간 증가
    }
    
    // 건물 연식 영향 (오래된 건물일수록 예상치 못한 문제 발생)
    const ageFactor = 1 + (Math.min(environment.buildingAge, 30) / 100)
    
    // 층수 영향 (자재 운반)
    const floorFactor = 1 + (environment.floorLevel / 50)
    
    // 종합 환경 계수
    const totalEnvironmentFactor = seasonFactors[environment.season] * 
                                  weatherFactor * 
                                  ageFactor * 
                                  floorFactor
    
    return {
      optimistic: baseDuration.optimistic * totalEnvironmentFactor * 0.95,
      mostLikely: baseDuration.mostLikely * totalEnvironmentFactor,
      pessimistic: baseDuration.pessimistic * totalEnvironmentFactor * 1.15,
      variance: baseDuration.variance * Math.pow(totalEnvironmentFactor, 2),
      standardDeviation: baseDuration.standardDeviation * totalEnvironmentFactor
    }
  }

  // 4. 몬테카를로 시뮬레이션 기반 리스크 분석
  runMonteCarloSimulation(
    tasks: GeneratedTask[],
    expertise: UserExpertise,
    environment: EnvironmentFactors,
    iterations: number = 10000
  ): ProbabilisticForecast {
    const results: SimulationResult[] = []
    
    for (let i = 0; i < iterations; i++) {
      const simulationResult = this.simulateOnce(tasks, expertise, environment)
      results.push(simulationResult)
    }
    
    // 결과 분석
    const durations = results.map(r => r.projectDuration).sort((a, b) => a - b)
    
    // 백분위수 계산
    const p10 = durations[Math.floor(iterations * 0.1)]
    const p50 = durations[Math.floor(iterations * 0.5)]
    const p90 = durations[Math.floor(iterations * 0.9)]
    
    // 기댓값
    const expected = durations.reduce((sum, d) => sum + d, 0) / iterations
    
    // 완료 확률 분포 계산
    const completionProbabilities = this.calculateCompletionProbabilities(durations)
    
    // 리스크 분석
    const riskAnalysis = this.analyzeRisks(results, tasks)
    
    return {
      p10Duration: p10,
      p50Duration: p50,
      p90Duration: p90,
      expectedDuration: expected,
      confidence90Range: {
        min: durations[Math.floor(iterations * 0.05)],
        max: durations[Math.floor(iterations * 0.95)]
      },
      completionProbabilities,
      riskAnalysis
    }
  }

  // 단일 시뮬레이션 실행
  private simulateOnce(
    tasks: GeneratedTask[],
    expertise: UserExpertise,
    environment: EnvironmentFactors
  ): SimulationResult {
    const simulatedTasks = tasks.map(task => {
      // 기본 PERT 계산
      const basePERT = this.calculatePERTDuration(
        task.duration * 0.8,
        task.duration * 1.2,
        this.getTaskComplexity(task),
        task.category
      )
      
      // 숙련도 보정
      const expertiseAdjusted = this.adjustDurationByExpertise(
        basePERT,
        expertise,
        task.category
      )
      
      // 환경 보정
      const environmentAdjusted = this.adjustDurationByEnvironment(
        expertiseAdjusted,
        environment,
        task.category
      )
      
      // 베타 분포에서 랜덤 샘플링
      const sampledDuration = this.sampleFromBetaDistribution(environmentAdjusted)
      
      return {
        ...task,
        simulatedDuration: sampledDuration
      }
    })
    
    // CPM으로 전체 공기 계산
    const { totalDuration, criticalPath } = this.calculateCPM(simulatedTasks)
    
    // 리스크 요인 식별
    const riskFactors = this.identifyRiskFactors(simulatedTasks, environment, expertise)
    
    return {
      projectDuration: totalDuration,
      criticalPath,
      delayProbability: this.calculateDelayProbability(totalDuration, tasks),
      riskFactors
    }
  }

  // 베타 분포 샘플링 (PERT 분포 근사)
  private sampleFromBetaDistribution(duration: ProbabilisticDuration): number {
    // Box-Muller 변환을 사용한 정규분포 근사
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    
    // PERT 분포의 평균과 표준편차 사용
    const mean = (duration.optimistic + 4 * duration.mostLikely + duration.pessimistic) / 6
    const sampledValue = mean + z0 * duration.standardDeviation
    
    // 범위 제한
    return Math.max(
      duration.optimistic,
      Math.min(duration.pessimistic, sampledValue)
    )
  }

  // 완료 확률 분포 계산
  private calculateCompletionProbabilities(durations: number[]): Array<{days: number, probability: number}> {
    const result = []
    const maxDuration = Math.ceil(durations[durations.length - 1])
    
    for (let days = Math.floor(durations[0]); days <= maxDuration; days++) {
      const completedCount = durations.filter(d => d <= days).length
      const probability = completedCount / durations.length
      result.push({ days, probability })
    }
    
    return result
  }

  // 리스크 분석
  private analyzeRisks(
    results: SimulationResult[],
    tasks: GeneratedTask[]
  ): {
    highRiskTasks: string[]
    totalRiskScore: number
    recommendations: string[]
  } {
    // 중요 경로에 자주 나타나는 작업 식별
    const criticalFrequency = new Map<string, number>()
    
    results.forEach(result => {
      result.criticalPath.forEach(taskId => {
        criticalFrequency.set(taskId, (criticalFrequency.get(taskId) || 0) + 1)
      })
    })
    
    // 고위험 작업 (중요 경로에 70% 이상 나타남)
    const highRiskTasks = Array.from(criticalFrequency.entries())
      .filter(([_, freq]) => freq > results.length * 0.7)
      .map(([taskId, _]) => taskId)
    
    // 전체 리스크 점수 계산
    const totalRiskScore = results.reduce((sum, r) => 
      sum + r.riskFactors.reduce((s, rf) => s + rf.impact * rf.probability, 0), 0
    ) / results.length
    
    // 추천사항 생성
    const recommendations = this.generateRecommendations(highRiskTasks, totalRiskScore, tasks)
    
    return {
      highRiskTasks,
      totalRiskScore,
      recommendations
    }
  }

  // 추천사항 생성
  private generateRecommendations(
    highRiskTasks: string[],
    totalRiskScore: number,
    tasks: GeneratedTask[]
  ): string[] {
    const recommendations: string[] = []
    
    if (totalRiskScore > 0.7) {
      recommendations.push("전체적인 리스크가 높습니다. 예비 일정을 충분히 확보하세요.")
    }
    
    if (highRiskTasks.length > 0) {
      const taskNames = highRiskTasks
        .map(id => tasks.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(", ")
      recommendations.push(`다음 작업들을 중점 관리하세요: ${taskNames}`)
    }
    
    // 카테고리별 추천
    const paintingTasks = tasks.filter(t => t.category === 'painting')
    if (paintingTasks.length > 0) {
      recommendations.push("도장 작업은 습도에 민감합니다. 제습기 사용을 고려하세요.")
    }
    
    return recommendations
  }

  // CPM 알고리즘 (Critical Path Method)
  private calculateCPM(tasks: any[]): { totalDuration: number, criticalPath: string[] } {
    // 간단한 CPM 구현 (실제로는 더 복잡함)
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    const earlyStart = new Map<string, number>()
    const earlyFinish = new Map<string, number>()
    
    // Forward pass
    const calculateEarlyTimes = (taskId: string): number => {
      if (earlyFinish.has(taskId)) return earlyFinish.get(taskId)!
      
      const task = taskMap.get(taskId)
      if (!task) return 0
      
      let maxDependencyFinish = 0
      for (const depId of task.dependencies) {
        maxDependencyFinish = Math.max(maxDependencyFinish, calculateEarlyTimes(depId))
      }
      
      earlyStart.set(taskId, maxDependencyFinish)
      earlyFinish.set(taskId, maxDependencyFinish + task.simulatedDuration)
      
      return earlyFinish.get(taskId)!
    }
    
    tasks.forEach(task => calculateEarlyTimes(task.id))
    
    const totalDuration = Math.max(...Array.from(earlyFinish.values()))
    
    // Backward pass로 critical path 찾기 (간략화)
    const criticalPath = tasks
      .filter(t => {
        const slack = totalDuration - (earlyFinish.get(t.id) || 0)
        return slack < 0.1  // 거의 0인 경우
      })
      .map(t => t.id)
    
    return { totalDuration, criticalPath }
  }

  // 헬퍼 함수들
  private getHistoricalFactor(category: string): number {
    const historical = this.historicalData.get(category)
    if (!historical || historical.length === 0) return 1.0
    
    const avg = historical.reduce((sum, val) => sum + val, 0) / historical.length
    return avg
  }

  private getTaskComplexity(task: GeneratedTask): number {
    // 작업 복잡도 계산 로직
    let complexity = 0.5  // 기본값
    
    // 의존성이 많을수록 복잡
    complexity += task.dependencies.length * 0.1
    
    // 비용이 높을수록 복잡
    if (task.estimatedCost > 5000000) complexity += 0.2
    
    // 마일스톤은 더 복잡
    if (task.isMilestone) complexity += 0.1
    
    return Math.min(1.0, complexity)
  }

  private identifyRiskFactors(
    tasks: any[],
    environment: EnvironmentFactors,
    expertise: UserExpertise
  ): RiskFactor[] {
    const risks: RiskFactor[] = []
    
    // 날씨 리스크
    if (environment.weatherConditions.rainProbability > 0.6) {
      risks.push({
        type: 'weather',
        impact: 0.3,
        probability: environment.weatherConditions.rainProbability,
        mitigation: '실내 작업 우선 진행, 비가림막 설치'
      })
    }
    
    // 숙련도 리스크
    if (expertise.level === 'beginner') {
      risks.push({
        type: 'labor',
        impact: 0.4,
        probability: 0.7,
        mitigation: '숙련 작업자 멘토링, 충분한 여유 시간 확보'
      })
    }
    
    // 복잡도 리스크
    const complexTasks = tasks.filter(t => this.getTaskComplexity(t) > 0.7)
    if (complexTasks.length > 0) {
      risks.push({
        type: 'complexity',
        impact: 0.5,
        probability: 0.6,
        mitigation: '복잡한 작업 단계별 검증, 예비 자재 확보'
      })
    }
    
    return risks
  }

  private calculateDelayProbability(duration: number, originalTasks: GeneratedTask[]): number {
    const originalDuration = originalTasks.reduce((sum, t) => sum + t.duration, 0)
    return duration > originalDuration ? (duration - originalDuration) / originalDuration : 0
  }

  private loadHistoricalData() {
    // 실제로는 DB에서 로드
    this.historicalData.set('demolition', [0.9, 1.0, 1.1, 0.95, 1.05])
    this.historicalData.set('electrical', [1.1, 1.2, 1.0, 1.15, 1.05])
    this.historicalData.set('plumbing', [1.2, 1.3, 1.1, 1.25, 1.15])
    this.historicalData.set('painting', [0.95, 1.0, 1.1, 1.0, 1.05])
    this.historicalData.set('flooring', [1.0, 1.1, 0.9, 1.05, 0.95])
  }
}

// 5. 결과 포맷터
export class ProbabilisticResultFormatter {
  static formatResult(forecast: ProbabilisticForecast): string {
    return `
📊 확률적 공기 예측 결과

⏱️ 완료 예상 기간:
• 90% 확률로 ${forecast.p90Duration}일 내 완성
• 50% 확률로 ${forecast.p50Duration}일 내 완성  
• 10% 확률로 ${forecast.p10Duration}일 내 완성

📈 기대값: ${forecast.expectedDuration.toFixed(1)}일
📉 90% 신뢰구간: ${forecast.confidence90Range.min.toFixed(1)} ~ ${forecast.confidence90Range.max.toFixed(1)}일

⚠️ 리스크 분석:
• 전체 리스크 점수: ${(forecast.riskAnalysis.totalRiskScore * 100).toFixed(1)}%
• 고위험 작업: ${forecast.riskAnalysis.highRiskTasks.length}개

💡 추천사항:
${forecast.riskAnalysis.recommendations.map(r => `• ${r}`).join('\n')}
    `
  }
}