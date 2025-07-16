import { Task, ScheduleInfo, ProjectBasicInfo } from '@/lib/types'

// 확률 분포 타입
interface ProbabilityDistribution {
  optimistic: number  // 최적 시나리오 (10% 확률)
  mostLikely: number  // 가장 가능성 높은 시나리오 (80% 확률)
  pessimistic: number // 최악 시나리오 (10% 확률)
}

// 시뮬레이션 결과 타입
interface SimulationResult {
  duration: number
  startDate: Date
  endDate: Date
  criticalPath: string[]
  confidence: number
}

// 확률적 예측 결과
export interface ProbabilisticPrediction {
  expectedDuration: number
  confidence90: {
    min: number
    max: number
  }
  riskAnalysis: {
    highRiskTasks: Array<{
      taskId: string
      taskName: string
      riskLevel: 'high' | 'medium' | 'low'
      variability: number
    }>
    bufferTime: number
    completionProbability: Array<{
      days: number
      probability: number
    }>
  }
  recommendations: string[]
}

export class ProbabilisticScheduler {
  private simulationRuns: number = 10000 // Monte Carlo 시뮬레이션 횟수
  
  constructor(private basicInfo: ProjectBasicInfo, private scheduleInfo: ScheduleInfo) {}

  // PERT (Program Evaluation and Review Technique) 기반 예상 시간 계산
  private calculatePERTEstimate(distribution: ProbabilityDistribution): number {
    return (distribution.optimistic + 4 * distribution.mostLikely + distribution.pessimistic) / 6
  }

  // 표준 편차 계산
  private calculateStandardDeviation(distribution: ProbabilityDistribution): number {
    return (distribution.pessimistic - distribution.optimistic) / 6
  }

  // Beta 분포를 사용한 랜덤 작업 시간 생성
  private generateRandomDuration(distribution: ProbabilityDistribution): number {
    // 간단한 Beta 분포 근사를 위해 정규 분포 사용
    const mean = this.calculatePERTEstimate(distribution)
    const stdDev = this.calculateStandardDeviation(distribution)
    
    // Box-Muller 변환을 사용한 정규 분포 생성
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    
    let duration = mean + stdDev * z0
    
    // 범위 제한
    duration = Math.max(distribution.optimistic, Math.min(distribution.pessimistic, duration))
    
    return Math.round(duration)
  }

  // 작업별 확률 분포 생성
  private getTaskDistribution(task: Task): ProbabilityDistribution {
    const baseDuration = task.duration || 3
    
    // 작업 복잡도와 불확실성 요인 고려
    let uncertaintyFactor = 1.0
    
    // 철거 작업은 불확실성이 높음
    if (task.category === 'demolition') {
      uncertaintyFactor = 1.5
    }
    // 마감 작업은 상대적으로 예측 가능
    else if (task.category === 'finishing') {
      uncertaintyFactor = 0.8
    }
    // 전기/배관 작업은 중간 정도의 불확실성
    else if (task.category === 'electrical' || task.category === 'plumbing') {
      uncertaintyFactor = 1.2
    }
    
    // 거주 중 공사는 추가 불확실성
    if (this.scheduleInfo.residenceStatus === 'live_in') {
      uncertaintyFactor *= 1.3
    }
    
    // 계절적 요인 (겨울/여름은 작업 효율 저하)
    const month = new Date().getMonth()
    if (month === 11 || month === 0 || month === 1 || month === 6 || month === 7) {
      uncertaintyFactor *= 1.1
    }
    
    return {
      optimistic: Math.round(baseDuration * 0.8),
      mostLikely: baseDuration,
      pessimistic: Math.round(baseDuration * (1 + 0.5 * uncertaintyFactor))
    }
  }

  // Monte Carlo 시뮬레이션 실행
  public runMonteCarloSimulation(tasks: Task[]): ProbabilisticPrediction {
    const simResults: SimulationResult[] = []
    const taskVariability: Map<string, number[]> = new Map()
    
    // 시뮬레이션 실행
    for (let i = 0; i < this.simulationRuns; i++) {
      const simulatedTasks = tasks.map(task => {
        const distribution = this.getTaskDistribution(task)
        const randomDuration = this.generateRandomDuration(distribution)
        
        // 작업별 변동성 추적
        if (!taskVariability.has(task.id)) {
          taskVariability.set(task.id, [])
        }
        taskVariability.get(task.id)!.push(randomDuration)
        
        return {
          ...task,
          duration: randomDuration
        }
      })
      
      // Critical Path 계산 (간단한 버전)
      const totalDuration = this.calculateProjectDuration(simulatedTasks)
      
      simResults.push({
        duration: totalDuration,
        startDate: this.scheduleInfo.startDate,
        endDate: this.addBusinessDays(this.scheduleInfo.startDate, totalDuration),
        criticalPath: [], // 실제 구현시 critical path 알고리즘 필요
        confidence: 0
      })
    }
    
    // 결과 분석
    const durations = simResults.map(r => r.duration).sort((a, b) => a - b)
    
    // 통계 계산
    const expectedDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const percentile10 = durations[Math.floor(this.simulationRuns * 0.1)]
    const percentile90 = durations[Math.floor(this.simulationRuns * 0.9)]
    
    // 고위험 작업 식별
    const highRiskTasks = this.identifyHighRiskTasks(tasks, taskVariability)
    
    // 완료 확률 분포 계산
    const completionProbability = this.calculateCompletionProbability(durations)
    
    // 권장 버퍼 시간 (P90 - 평균)
    const bufferTime = percentile90 - expectedDuration
    
    return {
      expectedDuration,
      confidence90: {
        min: percentile10,
        max: percentile90
      },
      riskAnalysis: {
        highRiskTasks,
        bufferTime,
        completionProbability
      },
      recommendations: this.generateRecommendations(highRiskTasks, bufferTime, expectedDuration)
    }
  }

  // 프로젝트 전체 기간 계산 (의존성 고려)
  private calculateProjectDuration(tasks: Task[]): number {
    // 간단한 구현: 모든 작업의 합 (실제로는 병렬 작업 고려 필요)
    const spaceTasks = new Map<string, Task[]>()
    
    tasks.forEach(task => {
      if (!spaceTasks.has(task.space)) {
        spaceTasks.set(task.space, [])
      }
      spaceTasks.get(task.space)!.push(task)
    })
    
    // 각 공간별 최대 시간 계산
    let maxDuration = 0
    spaceTasks.forEach(taskList => {
      const spaceDuration = taskList.reduce((sum, task) => sum + (task.duration || 0), 0)
      maxDuration = Math.max(maxDuration, spaceDuration)
    })
    
    return maxDuration
  }

  // 영업일 추가 함수
  private addBusinessDays(startDate: Date, days: number): Date {
    const result = new Date(startDate)
    let addedDays = 0
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      const dayOfWeek = result.getDay()
      
      // 주말이 아니고 작업 가능일인지 확인
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        if (this.scheduleInfo.workDays.includes(this.getDayString(dayOfWeek))) {
          addedDays++
        }
      }
    }
    
    return result
  }

  // 요일 문자열 변환
  private getDayString(dayNumber: number): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    return days[dayNumber]
  }

  // 고위험 작업 식별
  private identifyHighRiskTasks(
    tasks: Task[], 
    taskVariability: Map<string, number[]>
  ): Array<{taskId: string; taskName: string; riskLevel: 'high' | 'medium' | 'low'; variability: number}> {
    const riskTasks = []
    
    for (const task of tasks) {
      const durations = taskVariability.get(task.id) || []
      if (durations.length === 0) continue
      
      const mean = durations.reduce((a, b) => a + b, 0) / durations.length
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length
      const stdDev = Math.sqrt(variance)
      const cv = stdDev / mean // 변동 계수
      
      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      if (cv > 0.3) riskLevel = 'high'
      else if (cv > 0.15) riskLevel = 'medium'
      
      if (riskLevel !== 'low') {
        riskTasks.push({
          taskId: task.id,
          taskName: task.title,
          riskLevel,
          variability: Math.round(cv * 100)
        })
      }
    }
    
    return riskTasks.sort((a, b) => b.variability - a.variability)
  }

  // 완료 확률 분포 계산
  private calculateCompletionProbability(durations: number[]): Array<{days: number; probability: number}> {
    const distribution = []
    const step = 5 // 5일 단위로 그룹화
    
    for (let days = Math.min(...durations); days <= Math.max(...durations); days += step) {
      const count = durations.filter(d => d <= days).length
      const probability = (count / this.simulationRuns) * 100
      
      distribution.push({
        days,
        probability: Math.round(probability)
      })
    }
    
    return distribution
  }

  // AI 기반 권장사항 생성
  private generateRecommendations(
    highRiskTasks: Array<{taskId: string; taskName: string; riskLevel: string; variability: number}>,
    bufferTime: number,
    expectedDuration: number
  ): string[] {
    const recommendations = []
    
    // 버퍼 시간 권장
    if (bufferTime > expectedDuration * 0.2) {
      recommendations.push(`⏰ 예상치 못한 지연에 대비해 ${bufferTime}일의 여유 기간을 확보하는 것을 권장합니다.`)
    }
    
    // 고위험 작업 관리
    if (highRiskTasks.length > 0) {
      const topRisk = highRiskTasks[0]
      recommendations.push(
        `⚠️ "${topRisk.taskName}" 작업은 ${topRisk.variability}%의 높은 변동성을 보입니다. 숙련된 시공팀 배치를 권장합니다.`
      )
    }
    
    // 계절적 요인
    const month = new Date().getMonth()
    if (month === 11 || month === 0 || month === 1) {
      recommendations.push('❄️ 겨울철 공사로 인한 작업 효율 저하를 고려하여 난방 및 작업 환경 개선이 필요합니다.')
    } else if (month === 6 || month === 7) {
      recommendations.push('☀️ 여름철 고온다습한 환경을 고려하여 작업 시간 조정 및 충분한 휴식이 필요합니다.')
    }
    
    // 거주 중 공사
    if (this.scheduleInfo.residenceStatus === 'live_in') {
      recommendations.push('🏠 거주 중 공사의 특성상 예상보다 20-30% 더 많은 시간이 소요될 수 있습니다.')
    }
    
    // 병렬 작업 최적화
    recommendations.push('🔄 독립적인 공간의 작업은 동시 진행하여 전체 공기를 단축할 수 있습니다.')
    
    return recommendations
  }
}