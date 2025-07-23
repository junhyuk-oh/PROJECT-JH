import { Task, ScheduleOptions } from './types'

export interface SimulationResult {
  p10: number      // 10% 확률로 완료되는 기간
  p50: number      // 50% 확률로 완료되는 기간 (중앙값)
  p90: number      // 90% 확률로 완료되는 기간
  mean: number     // 평균 완료 기간
  stdDev: number   // 표준편차
  histogram: number[] // 히스토그램 데이터
  confidence: number  // 신뢰도 (0-100)
  minDuration: number // 최소 기간
  maxDuration: number // 최대 기간
}

export interface TaskVariation {
  taskId: string
  optimistic: number    // 낙관적 추정 (최소 시간)
  mostLikely: number    // 가장 가능성 높은 시간
  pessimistic: number   // 비관적 추정 (최대 시간)
}

export class MonteCarloSimulator {
  private readonly SIMULATION_COUNT = 1000
  private tasks: Task[]
  private options: ScheduleOptions
  private taskVariations: Map<string, TaskVariation>

  constructor(tasks: Task[], options: ScheduleOptions) {
    this.tasks = tasks
    this.options = options
    this.taskVariations = new Map()
    this.initializeTaskVariations()
  }

  // 각 작업의 변동성 초기화
  private initializeTaskVariations(): void {
    this.tasks.forEach(task => {
      const baseVariation = this.calculateBaseVariation(task)
      
      this.taskVariations.set(task.id, {
        taskId: task.id,
        optimistic: task.duration * (1 - baseVariation),
        mostLikely: task.duration,
        pessimistic: task.duration * (1 + baseVariation * 2)
      })
    })
  }

  // 작업별 기본 변동성 계산
  private calculateBaseVariation(task: Task): number {
    let variation = 0.15 // 기본 15% 변동성

    // 날씨 민감도 반영
    if (task.weatherDependent && this.options.weatherSensitivity) {
      variation += (this.options.weatherSensitivity / 100) * 0.2
    }

    // 복잡도 반영
    if (this.options.complexity === 'complex') {
      variation += 0.1
    } else if (this.options.complexity === 'simple') {
      variation -= 0.05
    }

    // 일정 유연성 반영
    if (this.options.scheduleFlexibility === 'strict') {
      variation += 0.1
    } else if (this.options.scheduleFlexibility === 'flexible') {
      variation -= 0.05
    }

    // 작업 타입별 추가 변동성
    const highVariationTypes = ['plumbing', 'electrical', 'waterproofing']
    if (highVariationTypes.includes(task.type)) {
      variation += 0.1
    }

    return Math.min(0.5, Math.max(0.05, variation)) // 5% ~ 50% 범위로 제한
  }

  // PERT 베타 분포를 사용한 랜덤 기간 생성
  private generateRandomDuration(variation: TaskVariation): number {
    const { optimistic, mostLikely, pessimistic } = variation
    
    // PERT 베타 분포 파라미터
    const alpha = 1 + 4 * ((mostLikely - optimistic) / (pessimistic - optimistic))
    const beta = 1 + 4 * ((pessimistic - mostLikely) / (pessimistic - optimistic))
    
    // 베타 분포 샘플링 (간단한 근사)
    const u = Math.random()
    const betaSample = Math.pow(u, alpha / (alpha + beta))
    
    return optimistic + betaSample * (pessimistic - optimistic)
  }

  // Critical Path 계산 (간단한 버전)
  private calculateProjectDuration(taskDurations: Map<string, number>): number {
    const taskEndTimes = new Map<string, number>()
    const sortedTasks = this.topologicalSort()

    sortedTasks.forEach(task => {
      const duration = taskDurations.get(task.id) || task.duration
      const dependencyEndTimes = task.dependencies.map(depId => 
        taskEndTimes.get(depId) || 0
      )
      const startTime = Math.max(0, ...dependencyEndTimes)
      taskEndTimes.set(task.id, startTime + duration)
    })

    return Math.max(...Array.from(taskEndTimes.values()))
  }

  // 위상 정렬
  private topologicalSort(): Task[] {
    const sorted: Task[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return
      if (visiting.has(taskId)) {
        throw new Error('순환 의존성 감지')
      }

      visiting.add(taskId)
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      // 이 작업에 의존하는 다른 작업들 방문
      this.tasks.forEach(t => {
        if (t.dependencies.includes(taskId)) {
          visit(t.id)
        }
      })

      visiting.delete(taskId)
      visited.add(taskId)
      sorted.unshift(task)
    }

    this.tasks.forEach(task => visit(task.id))
    return sorted
  }

  // Monte Carlo 시뮬레이션 실행
  public runSimulation(onProgress?: (progress: number) => void): SimulationResult {
    const durations: number[] = []
    
    for (let i = 0; i < this.SIMULATION_COUNT; i++) {
      // 각 작업의 랜덤 기간 생성
      const taskDurations = new Map<string, number>()
      
      this.tasks.forEach(task => {
        const variation = this.taskVariations.get(task.id)!
        const randomDuration = this.generateRandomDuration(variation)
        taskDurations.set(task.id, Math.ceil(randomDuration))
      })

      // 프로젝트 전체 기간 계산
      const projectDuration = this.calculateProjectDuration(taskDurations)
      durations.push(projectDuration)

      // 진행률 콜백
      if (onProgress && i % 100 === 0) {
        onProgress((i / this.SIMULATION_COUNT) * 100)
      }
    }

    // 결과 분석
    durations.sort((a, b) => a - b)
    
    const p10 = durations[Math.floor(this.SIMULATION_COUNT * 0.1)]
    const p50 = durations[Math.floor(this.SIMULATION_COUNT * 0.5)]
    const p90 = durations[Math.floor(this.SIMULATION_COUNT * 0.9)]
    
    const mean = durations.reduce((sum, d) => sum + d, 0) / this.SIMULATION_COUNT
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / this.SIMULATION_COUNT
    const stdDev = Math.sqrt(variance)

    // 히스토그램 생성
    const histogram = this.createHistogram(durations)

    // 신뢰도 계산 (표준편차가 작을수록 높음)
    const confidence = Math.max(0, Math.min(100, 100 - (stdDev / mean) * 100))

    return {
      p10,
      p50,
      p90,
      mean: Math.round(mean),
      stdDev: Math.round(stdDev * 10) / 10,
      histogram,
      confidence: Math.round(confidence),
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1]
    }
  }

  // 히스토그램 데이터 생성
  private createHistogram(durations: number[], binCount: number = 20): number[] {
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const binSize = (max - min) / binCount
    const bins = new Array(binCount).fill(0)

    durations.forEach(duration => {
      const binIndex = Math.min(
        Math.floor((duration - min) / binSize),
        binCount - 1
      )
      bins[binIndex]++
    })

    return bins
  }

  // 리스크 요인 분석
  public analyzeRiskFactors(): Array<{
    factor: string
    impact: 'high' | 'medium' | 'low'
    description: string
    mitigation: string
  }> {
    const risks = []

    // 날씨 리스크
    if (this.options.weatherSensitivity && this.options.weatherSensitivity > 70) {
      risks.push({
        factor: '날씨 영향',
        impact: 'high' as const,
        description: '외부 작업이 많아 날씨에 민감합니다',
        mitigation: '우천 시 대체 작업 준비, 실내 작업 우선 진행'
      })
    }

    // 복잡도 리스크
    if (this.options.complexity === 'complex') {
      risks.push({
        factor: '프로젝트 복잡도',
        impact: 'high' as const,
        description: '복잡한 프로젝트로 예상치 못한 지연 가능성 있음',
        mitigation: '충분한 버퍼 시간 확보, 전문가 사전 검토'
      })
    }

    // 일정 리스크
    if (this.options.scheduleFlexibility === 'strict') {
      risks.push({
        factor: '엄격한 일정',
        impact: 'medium' as const,
        description: '일정 조정이 어려워 리스크 대응이 제한적',
        mitigation: '핵심 작업 우선 완료, 병렬 작업 최대화'
      })
    }

    // Critical Path 리스크
    const criticalTaskCount = this.tasks.filter(t => t.isCritical).length
    if (criticalTaskCount > this.tasks.length * 0.5) {
      risks.push({
        factor: '높은 임계 작업 비율',
        impact: 'medium' as const,
        description: '많은 작업이 전체 일정에 직접 영향',
        mitigation: '임계 작업 집중 관리, 자원 우선 배치'
      })
    }

    return risks
  }
}