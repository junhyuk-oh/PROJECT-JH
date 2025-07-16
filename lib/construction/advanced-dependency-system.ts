import { GeneratedTask } from '../types'

// 복합 의존성 타입 정의
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

// 의존성 관계 인터페이스
export interface AdvancedDependency {
  id: string
  sourceTaskId: string
  targetTaskId: string
  type: DependencyType
  lag: number  // 일 단위
  lagType: 'mandatory' | 'flexible' | 'weather-dependent'
  conditions?: DependencyCondition[]
  description?: string
}

// 의존성 조건
export interface DependencyCondition {
  type: 'weather' | 'resource' | 'regulatory' | 'custom'
  parameter: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: number | string
  adjustmentFactor?: number  // lag 조정 배수
}

// 작업 공간 정보
export interface TaskSpace {
  taskId: string
  spaceId: string
  startTime: number
  endTime: number
  exclusiveAccess: boolean  // 독점적 공간 사용 여부
  noiseLevel: 'high' | 'medium' | 'low'
  dustLevel: 'high' | 'medium' | 'low'
}

// 자원 요구사항
export interface ResourceRequirement {
  taskId: string
  resourceType: 'worker' | 'equipment' | 'material'
  resourceId: string
  quantity: number
  startTime: number
  duration: number
  canShare: boolean
  priority: number  // 1-10
}

// 법규 제약사항
export interface RegulatoryConstraint {
  id: string
  type: 'noise' | 'workHours' | 'safety' | 'environmental'
  description: string
  affectedTaskCategories: string[]
  restrictions: {
    timeRestrictions?: {
      allowedDays: number[]  // 0=일요일, 6=토요일
      allowedHours: { start: number; end: number }
    }
    weatherRestrictions?: {
      maxTemperature?: number
      minTemperature?: number
      maxHumidity?: number
      noRain?: boolean
    }
    sequenceRestrictions?: {
      mustFollowTasks?: string[]
      mustPrecedeTasks?: string[]
      minGapDays?: number
    }
  }
}

// 충돌 타입
export interface Conflict {
  id: string
  type: 'space' | 'resource' | 'regulatory' | 'dependency'
  severity: 'critical' | 'high' | 'medium' | 'low'
  affectedTasks: string[]
  description: string
  suggestedResolutions: Resolution[]
}

// 해결 방안
export interface Resolution {
  id: string
  type: 'delay' | 'parallel' | 'resource-add' | 'sequence-change' | 'method-change'
  description: string
  impact: {
    durationChange: number
    costChange: number
    qualityImpact: number  // -1 to 1
  }
  implementation: ScheduleAdjustment[]
}

// 일정 조정 사항
export interface ScheduleAdjustment {
  taskId: string
  adjustmentType: 'move' | 'extend' | 'split' | 'merge'
  newStart?: number
  newDuration?: number
  splitInto?: string[]  // 작업 분할 시 새 작업 ID들
}

// 고급 의존성 관리 시스템
export class AdvancedDependencySystem {
  private dependencies: Map<string, AdvancedDependency[]> = new Map()
  private taskSpaces: Map<string, TaskSpace> = new Map()
  private resources: Map<string, ResourceRequirement[]> = new Map()
  private regulations: RegulatoryConstraint[] = []
  
  constructor() {}

  // 1. 의존성 추가 및 검증
  addDependency(dependency: AdvancedDependency): boolean {
    // 순환 의존성 검증
    if (this.wouldCreateCycle(dependency)) {
      throw new Error(`순환 의존성 발생: ${dependency.sourceTaskId} -> ${dependency.targetTaskId}`)
    }

    // 타입별 유효성 검증
    if (!this.validateDependencyType(dependency)) {
      throw new Error(`잘못된 의존성 타입: ${dependency.type}`)
    }

    const key = dependency.sourceTaskId
    if (!this.dependencies.has(key)) {
      this.dependencies.set(key, [])
    }
    this.dependencies.get(key)!.push(dependency)
    
    return true
  }

  // 2. 복합 의존성 기반 일정 계산
  calculateScheduleWithDependencies(
    tasks: GeneratedTask[],
    environmentFactors: any
  ): ScheduleResult {
    const schedule = new Map<string, TaskSchedule>()
    const taskMap = new Map(tasks.map(t => [t.id, t]))

    // 위상 정렬로 작업 순서 결정
    const sortedTasks = this.topologicalSort(tasks)

    // 각 작업의 시작/종료 시간 계산
    for (const task of sortedTasks) {
      const taskSchedule = this.calculateTaskSchedule(
        task,
        schedule,
        taskMap,
        environmentFactors
      )
      schedule.set(task.id, taskSchedule)
    }

    // 충돌 감지
    const conflicts = this.detectAllConflicts(schedule, tasks)

    // 충돌 해결
    const resolvedSchedule = this.resolveConflicts(schedule, conflicts, tasks)

    // 임계 경로 분석
    const criticalPath = this.findCriticalPath(resolvedSchedule, tasks)

    return {
      schedule: resolvedSchedule,
      conflicts,
      criticalPath,
      totalDuration: this.calculateTotalDuration(resolvedSchedule)
    }
  }

  // 3. 개별 작업 일정 계산
  private calculateTaskSchedule(
    task: GeneratedTask,
    currentSchedule: Map<string, TaskSchedule>,
    taskMap: Map<string, GeneratedTask>,
    environment: any
  ): TaskSchedule {
    let earliestStart = 0
    let latestFinish = Infinity

    // 모든 의존성 확인
    const dependencies = this.dependencies.get(task.id) || []
    
    for (const dep of dependencies) {
      const dependentSchedule = currentSchedule.get(dep.sourceTaskId)
      if (!dependentSchedule) continue

      switch (dep.type) {
        case 'FS': // Finish-to-Start
          earliestStart = Math.max(
            earliestStart,
            dependentSchedule.finish + this.calculateLag(dep, environment)
          )
          break
          
        case 'SS': // Start-to-Start
          earliestStart = Math.max(
            earliestStart,
            dependentSchedule.start + this.calculateLag(dep, environment)
          )
          break
          
        case 'FF': // Finish-to-Finish
          latestFinish = Math.min(
            latestFinish,
            dependentSchedule.finish + this.calculateLag(dep, environment)
          )
          break
          
        case 'SF': // Start-to-Finish
          latestFinish = Math.min(
            latestFinish,
            dependentSchedule.start + task.duration + this.calculateLag(dep, environment)
          )
          break
      }
    }

    // 법규 제약 적용
    earliestStart = this.applyRegulatoryConstraints(task, earliestStart)

    return {
      taskId: task.id,
      start: earliestStart,
      finish: earliestStart + task.duration,
      duration: task.duration,
      float: 0  // 나중에 계산
    }
  }

  // 4. Lag 계산 (조건부 포함)
  private calculateLag(dependency: AdvancedDependency, environment: any): number {
    let lag = dependency.lag

    // 조건부 lag 조정
    if (dependency.conditions) {
      for (const condition of dependency.conditions) {
        if (this.evaluateCondition(condition, environment)) {
          lag *= condition.adjustmentFactor || 1
        }
      }
    }

    // 날씨 의존적 lag
    if (dependency.lagType === 'weather-dependent') {
      const humidity = environment.weatherConditions?.humidity || 50
      if (humidity > 70) {
        lag *= 1.5  // 습도 높을 때 건조시간 50% 증가
      }
    }

    return Math.ceil(lag)
  }

  // 5. 충돌 감지 시스템
  detectAllConflicts(
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): Conflict[] {
    const conflicts: Conflict[] = []

    // 공간 충돌 감지
    conflicts.push(...this.detectSpaceConflicts(schedule, tasks))

    // 자원 충돌 감지
    conflicts.push(...this.detectResourceConflicts(schedule, tasks))

    // 법규 위반 감지
    conflicts.push(...this.detectRegulatoryViolations(schedule, tasks))

    // 의존성 충돌 감지
    conflicts.push(...this.detectDependencyConflicts(schedule))

    return conflicts
  }

  // 6. 공간 충돌 감지
  private detectSpaceConflicts(
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): Conflict[] {
    const conflicts: Conflict[] = []
    const spaceTimeline = new Map<string, TimeSlot[]>()

    // 공간별 타임라인 구성
    for (const [taskId, taskSchedule] of schedule) {
      const task = tasks.find(t => t.id === taskId)
      if (!task) continue

      const spaceId = task.space
      if (!spaceTimeline.has(spaceId)) {
        spaceTimeline.set(spaceId, [])
      }

      spaceTimeline.get(spaceId)!.push({
        taskId,
        start: taskSchedule.start,
        end: taskSchedule.finish,
        noiseLevel: this.getTaskNoiseLevel(task),
        dustLevel: this.getTaskDustLevel(task)
      })
    }

    // 충돌 검사
    for (const [spaceId, timeline] of spaceTimeline) {
      const sortedTimeline = timeline.sort((a, b) => a.start - b.start)
      
      for (let i = 0; i < sortedTimeline.length - 1; i++) {
        for (let j = i + 1; j < sortedTimeline.length; j++) {
          const slot1 = sortedTimeline[i]
          const slot2 = sortedTimeline[j]

          // 시간 중첩 확인
          if (slot1.end > slot2.start) {
            // 작업 특성 호환성 확인
            if (!this.areTasksCompatible(slot1, slot2, tasks)) {
              conflicts.push({
                id: `space_conflict_${slot1.taskId}_${slot2.taskId}`,
                type: 'space',
                severity: 'high',
                affectedTasks: [slot1.taskId, slot2.taskId],
                description: `${spaceId}에서 작업 충돌: 동시 진행 불가`,
                suggestedResolutions: this.generateSpaceConflictResolutions(
                  slot1,
                  slot2,
                  tasks
                )
              })
            }
          }
        }
      }
    }

    return conflicts
  }

  // 7. 자원 충돌 감지
  private detectResourceConflicts(
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): Conflict[] {
    const conflicts: Conflict[] = []
    const resourceTimeline = new Map<string, ResourceSlot[]>()

    // 자원별 타임라인 구성
    for (const [resourceId, requirements] of this.resources) {
      const timeline: ResourceSlot[] = []
      
      for (const req of requirements) {
        const taskSchedule = schedule.get(req.taskId)
        if (!taskSchedule) continue

        timeline.push({
          taskId: req.taskId,
          start: taskSchedule.start,
          end: taskSchedule.start + req.duration,
          quantity: req.quantity,
          canShare: req.canShare
        })
      }

      resourceTimeline.set(resourceId, timeline)
    }

    // 자원 초과 사용 검사
    for (const [resourceId, timeline] of resourceTimeline) {
      const events = this.createResourceEvents(timeline)
      let currentUsage = 0
      const maxCapacity = this.getResourceCapacity(resourceId)

      for (const event of events) {
        if (event.type === 'start') {
          currentUsage += event.quantity
          if (currentUsage > maxCapacity) {
            conflicts.push({
              id: `resource_conflict_${resourceId}_${event.time}`,
              type: 'resource',
              severity: 'critical',
              affectedTasks: this.getTasksAtTime(timeline, event.time),
              description: `${resourceId} 자원 초과: ${currentUsage}/${maxCapacity}`,
              suggestedResolutions: this.generateResourceConflictResolutions(
                resourceId,
                timeline,
                event.time
              )
            })
          }
        } else {
          currentUsage -= event.quantity
        }
      }
    }

    return conflicts
  }

  // 8. 충돌 해결 엔진
  private resolveConflicts(
    schedule: Map<string, TaskSchedule>,
    conflicts: Conflict[],
    tasks: GeneratedTask[]
  ): Map<string, TaskSchedule> {
    const resolvedSchedule = new Map(schedule)
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical')

    // 우선순위에 따라 충돌 해결
    for (const conflict of criticalConflicts) {
      const bestResolution = this.selectBestResolution(
        conflict,
        resolvedSchedule,
        tasks
      )

      if (bestResolution) {
        this.applyResolution(bestResolution, resolvedSchedule, tasks)
      }
    }

    // 재귀적으로 새로운 충돌 확인
    const newConflicts = this.detectAllConflicts(resolvedSchedule, tasks)
    if (newConflicts.filter(c => c.severity === 'critical').length > 0) {
      // 더 이상 해결할 수 없는 경우 대안 일정 생성
      return this.generateAlternativeSchedule(resolvedSchedule, tasks, newConflicts)
    }

    return resolvedSchedule
  }

  // 9. 대안 일정 생성
  private generateAlternativeSchedule(
    currentSchedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[],
    remainingConflicts: Conflict[]
  ): Map<string, TaskSchedule> {
    // 휴리스틱 기반 대안 생성
    const alternatives: AlternativeSchedule[] = []

    // 대안 1: 병렬 작업 최대화
    alternatives.push(this.generateParallelMaximizedSchedule(tasks))

    // 대안 2: 자원 추가 가정
    alternatives.push(this.generateResourceAugmentedSchedule(tasks))

    // 대안 3: 작업 분할
    alternatives.push(this.generateSplitTaskSchedule(tasks))

    // 최적 대안 선택
    return this.selectOptimalAlternative(alternatives, tasks).schedule
  }

  // 10. 헬퍼 함수들
  private wouldCreateCycle(dependency: AdvancedDependency): boolean {
    // DFS로 순환 검사
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const deps = this.dependencies.get(nodeId) || []
      for (const dep of deps) {
        if (!visited.has(dep.targetTaskId)) {
          if (hasCycle(dep.targetTaskId)) return true
        } else if (recursionStack.has(dep.targetTaskId)) {
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    // 임시로 의존성 추가
    const key = dependency.sourceTaskId
    if (!this.dependencies.has(key)) {
      this.dependencies.set(key, [])
    }
    this.dependencies.get(key)!.push(dependency)

    const result = hasCycle(dependency.targetTaskId)

    // 임시 의존성 제거
    const deps = this.dependencies.get(key)!
    deps.pop()

    return result
  }

  private topologicalSort(tasks: GeneratedTask[]): GeneratedTask[] {
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()
    
    // 초기화
    tasks.forEach(task => {
      inDegree.set(task.id, 0)
      adjList.set(task.id, [])
    })

    // 의존성 그래프 구성
    for (const [source, deps] of this.dependencies) {
      for (const dep of deps) {
        adjList.get(source)!.push(dep.targetTaskId)
        inDegree.set(dep.targetTaskId, (inDegree.get(dep.targetTaskId) || 0) + 1)
      }
    }

    // 위상 정렬
    const queue: string[] = []
    const result: GeneratedTask[] = []

    // 진입 차수가 0인 노드로 시작
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(taskId)
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      const task = tasks.find(t => t.id === current)
      if (task) result.push(task)

      // 인접 노드들의 진입 차수 감소
      for (const neighbor of adjList.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      }
    }

    return result
  }

  private validateDependencyType(dependency: AdvancedDependency): boolean {
    const validTypes = ['FS', 'SS', 'FF', 'SF']
    return validTypes.includes(dependency.type)
  }

  private evaluateCondition(condition: DependencyCondition, environment: any): boolean {
    let value: any
    
    switch (condition.type) {
      case 'weather':
        value = environment.weatherConditions?.[condition.parameter]
        break
      case 'resource':
        value = this.getResourceAvailability(condition.parameter)
        break
      default:
        value = condition.parameter
    }

    switch (condition.operator) {
      case '>': return value > condition.value
      case '<': return value < condition.value
      case '>=': return value >= condition.value
      case '<=': return value <= condition.value
      case '==': return value == condition.value
      case '!=': return value != condition.value
      default: return false
    }
  }

  private getResourceAvailability(resourceId: string): number {
    // 리소스 가용성 확인 로직
    return 1
  }

  private getTaskNoiseLevel(task: GeneratedTask): 'high' | 'medium' | 'low' {
    const highNoiseTasks = ['demolition', 'drilling', 'hammering']
    const mediumNoiseTasks = ['carpentry', 'electrical']
    
    if (highNoiseTasks.some(t => task.category.includes(t))) return 'high'
    if (mediumNoiseTasks.some(t => task.category.includes(t))) return 'medium'
    return 'low'
  }

  private getTaskDustLevel(task: GeneratedTask): 'high' | 'medium' | 'low' {
    const highDustTasks = ['demolition', 'sanding', 'cutting']
    const mediumDustTasks = ['drilling', 'flooring']
    
    if (highDustTasks.some(t => task.category.includes(t))) return 'high'
    if (mediumDustTasks.some(t => task.category.includes(t))) return 'medium'
    return 'low'
  }

  private areTasksCompatible(
    slot1: TimeSlot,
    slot2: TimeSlot,
    tasks: GeneratedTask[]
  ): boolean {
    // 높은 소음 + 정밀 작업 = 비호환
    if (slot1.noiseLevel === 'high' && this.isPrecisionWork(slot2.taskId, tasks)) {
      return false
    }
    
    // 높은 먼지 + 마감 작업 = 비호환
    if (slot1.dustLevel === 'high' && this.isFinishingWork(slot2.taskId, tasks)) {
      return false
    }

    return true
  }

  private isPrecisionWork(taskId: string, tasks: GeneratedTask[]): boolean {
    const task = tasks.find(t => t.id === taskId)
    const precisionCategories = ['painting', 'wallpaper', 'electrical_finish']
    return precisionCategories.includes(task?.category || '')
  }

  private isFinishingWork(taskId: string, tasks: GeneratedTask[]): boolean {
    const task = tasks.find(t => t.id === taskId)
    const finishingCategories = ['painting', 'wallpaper', 'flooring', 'cleanup']
    return finishingCategories.includes(task?.category || '')
  }

  private generateSpaceConflictResolutions(
    slot1: TimeSlot,
    slot2: TimeSlot,
    tasks: GeneratedTask[]
  ): Resolution[] {
    const resolutions: Resolution[] = []

    // 해결책 1: 순차 진행
    resolutions.push({
      id: `seq_${slot1.taskId}_${slot2.taskId}`,
      type: 'sequence-change',
      description: `${slot2.taskId}를 ${slot1.taskId} 완료 후 시작`,
      impact: {
        durationChange: slot2.end - slot2.start,
        costChange: 0,
        qualityImpact: 0
      },
      implementation: [{
        taskId: slot2.taskId,
        adjustmentType: 'move',
        newStart: slot1.end
      }]
    })

    // 해결책 2: 공간 분할 작업
    if (this.canSplitSpace(slot1, slot2, tasks)) {
      resolutions.push({
        id: `split_space_${slot1.taskId}_${slot2.taskId}`,
        type: 'parallel',
        description: '공간을 분할하여 동시 작업',
        impact: {
          durationChange: 0,
          costChange: 5000000,  // 임시 벽 설치 비용
          qualityImpact: -0.1
        },
        implementation: []
      })
    }

    return resolutions
  }

  private canSplitSpace(slot1: TimeSlot, slot2: TimeSlot, tasks: GeneratedTask[]): boolean {
    // 공간 분할 가능 여부 판단 로직
    return true
  }

  private getResourceCapacity(resourceId: string): number {
    // 리소스별 최대 용량
    const capacities: { [key: string]: number } = {
      'electrician': 1,
      'plumber': 1,
      'carpenter': 2,
      'painter': 3
    }
    return capacities[resourceId] || 1
  }

  private createResourceEvents(timeline: ResourceSlot[]): ResourceEvent[] {
    const events: ResourceEvent[] = []
    
    timeline.forEach(slot => {
      events.push({
        time: slot.start,
        type: 'start',
        quantity: slot.quantity,
        taskId: slot.taskId
      })
      events.push({
        time: slot.end,
        type: 'end',
        quantity: slot.quantity,
        taskId: slot.taskId
      })
    })

    return events.sort((a, b) => a.time - b.time)
  }

  private getTasksAtTime(timeline: ResourceSlot[], time: number): string[] {
    return timeline
      .filter(slot => slot.start <= time && slot.end > time)
      .map(slot => slot.taskId)
  }

  private generateResourceConflictResolutions(
    resourceId: string,
    timeline: ResourceSlot[],
    conflictTime: number
  ): Resolution[] {
    const resolutions: Resolution[] = []

    // 해결책 1: 자원 추가
    resolutions.push({
      id: `add_resource_${resourceId}`,
      type: 'resource-add',
      description: `${resourceId} 추가 투입`,
      impact: {
        durationChange: 0,
        costChange: this.getResourceCost(resourceId),
        qualityImpact: 0.1  // 더 많은 인력으로 품질 향상
      },
      implementation: []
    })

    // 해결책 2: 작업 지연
    const conflictingTasks = this.getTasksAtTime(timeline, conflictTime)
    if (conflictingTasks.length > 0) {
      resolutions.push({
        id: `delay_${conflictingTasks[0]}`,
        type: 'delay',
        description: `${conflictingTasks[0]} 작업 지연`,
        impact: {
          durationChange: 2,  // 2일 지연
          costChange: 0,
          qualityImpact: 0
        },
        implementation: [{
          taskId: conflictingTasks[0],
          adjustmentType: 'move',
          newStart: conflictTime + 2
        }]
      })
    }

    return resolutions
  }

  private getResourceCost(resourceId: string): number {
    const costs: { [key: string]: number } = {
      'electrician': 500000,
      'plumber': 450000,
      'carpenter': 400000,
      'painter': 350000
    }
    return costs[resourceId] || 400000
  }

  private detectRegulatoryViolations(
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): Conflict[] {
    const conflicts: Conflict[] = []

    for (const regulation of this.regulations) {
      for (const [taskId, taskSchedule] of schedule) {
        const task = tasks.find(t => t.id === taskId)
        if (!task || !regulation.affectedTaskCategories.includes(task.category)) {
          continue
        }

        // 시간 제약 검사
        if (regulation.restrictions.timeRestrictions) {
          const violations = this.checkTimeRestrictions(
            taskSchedule,
            regulation.restrictions.timeRestrictions
          )
          
          if (violations.length > 0) {
            conflicts.push({
              id: `regulatory_${regulation.id}_${taskId}`,
              type: 'regulatory',
              severity: 'critical',
              affectedTasks: [taskId],
              description: `법규 위반: ${regulation.description}`,
              suggestedResolutions: this.generateRegulatoryResolutions(
                task,
                taskSchedule,
                regulation
              )
            })
          }
        }
      }
    }

    return conflicts
  }

  private checkTimeRestrictions(
    schedule: TaskSchedule,
    restrictions: any
  ): string[] {
    const violations: string[] = []
    
    // 요일 제한 검사
    if (restrictions.allowedDays) {
      // 작업 기간 동안의 요일 확인
      const workDays = this.getWorkDaysInPeriod(schedule.start, schedule.finish)
      const disallowedDays = workDays.filter(day => !restrictions.allowedDays.includes(day))
      
      if (disallowedDays.length > 0) {
        violations.push(`허용되지 않은 요일에 작업: ${disallowedDays.join(', ')}`)
      }
    }

    // 시간 제한 검사
    if (restrictions.allowedHours) {
      // 작업 시간이 허용 시간 범위를 벗어나는지 확인
      violations.push('작업 시간 제한 위반')
    }

    return violations
  }

  private getWorkDaysInPeriod(start: number, end: number): number[] {
    const days: number[] = []
    for (let day = start; day <= end; day++) {
      days.push(day % 7)  // 요일 계산 (간단화)
    }
    return [...new Set(days)]
  }

  private generateRegulatoryResolutions(
    task: GeneratedTask,
    schedule: TaskSchedule,
    regulation: RegulatoryConstraint
  ): Resolution[] {
    const resolutions: Resolution[] = []

    // 해결책 1: 작업 시간 조정
    resolutions.push({
      id: `adjust_time_${task.id}`,
      type: 'sequence-change',
      description: '허용된 시간대로 작업 일정 조정',
      impact: {
        durationChange: 0,
        costChange: 0,
        qualityImpact: 0
      },
      implementation: [{
        taskId: task.id,
        adjustmentType: 'move',
        newStart: this.findNextAllowedTime(schedule.start, regulation)
      }]
    })

    // 해결책 2: 작업 방법 변경
    if (this.hasAlternativeMethod(task)) {
      resolutions.push({
        id: `change_method_${task.id}`,
        type: 'method-change',
        description: '저소음/무진 공법으로 변경',
        impact: {
          durationChange: 2,
          costChange: 3000000,
          qualityImpact: 0.1
        },
        implementation: []
      })
    }

    return resolutions
  }

  private findNextAllowedTime(currentStart: number, regulation: RegulatoryConstraint): number {
    // 다음 허용 시간 찾기 로직
    return currentStart + 1
  }

  private hasAlternativeMethod(task: GeneratedTask): boolean {
    const alternativeMethods = ['demolition', 'drilling', 'cutting']
    return alternativeMethods.includes(task.category)
  }

  private detectDependencyConflicts(schedule: Map<string, TaskSchedule>): Conflict[] {
    const conflicts: Conflict[] = []

    for (const [sourceId, deps] of this.dependencies) {
      const sourceSchedule = schedule.get(sourceId)
      if (!sourceSchedule) continue

      for (const dep of deps) {
        const targetSchedule = schedule.get(dep.targetTaskId)
        if (!targetSchedule) continue

        // 의존성 타입별 충돌 검사
        let isViolated = false
        
        switch (dep.type) {
          case 'FS':
            isViolated = targetSchedule.start < sourceSchedule.finish + dep.lag
            break
          case 'SS':
            isViolated = targetSchedule.start < sourceSchedule.start + dep.lag
            break
          case 'FF':
            isViolated = Math.abs(targetSchedule.finish - sourceSchedule.finish) > dep.lag
            break
          case 'SF':
            isViolated = targetSchedule.finish < sourceSchedule.start + dep.lag
            break
        }

        if (isViolated) {
          conflicts.push({
            id: `dependency_${dep.id}`,
            type: 'dependency',
            severity: 'high',
            affectedTasks: [sourceId, dep.targetTaskId],
            description: `${dep.type} 의존성 위반: ${dep.description || ''}`,
            suggestedResolutions: []
          })
        }
      }
    }

    return conflicts
  }

  private applyRegulatoryConstraints(task: GeneratedTask, earliestStart: number): number {
    for (const regulation of this.regulations) {
      if (!regulation.affectedTaskCategories.includes(task.category)) {
        continue
      }

      if (regulation.restrictions.timeRestrictions) {
        // 허용된 요일로 조정
        earliestStart = this.adjustToAllowedDays(
          earliestStart,
          regulation.restrictions.timeRestrictions.allowedDays
        )
      }
    }

    return earliestStart
  }

  private adjustToAllowedDays(start: number, allowedDays?: number[]): number {
    if (!allowedDays) return start
    
    let adjustedStart = start
    while (!allowedDays.includes(adjustedStart % 7)) {
      adjustedStart++
    }
    
    return adjustedStart
  }

  private selectBestResolution(
    conflict: Conflict,
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): Resolution | null {
    if (conflict.suggestedResolutions.length === 0) return null

    // 평가 기준: 공기 영향 최소화, 비용 대비 효과, 품질 유지
    let bestScore = -Infinity
    let bestResolution: Resolution | null = null

    for (const resolution of conflict.suggestedResolutions) {
      const score = this.evaluateResolution(resolution, schedule, tasks)
      if (score > bestScore) {
        bestScore = score
        bestResolution = resolution
      }
    }

    return bestResolution
  }

  private evaluateResolution(
    resolution: Resolution,
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): number {
    // 가중치
    const durationWeight = -0.5  // 공기 증가는 부정적
    const costWeight = -0.3     // 비용 증가는 부정적
    const qualityWeight = 0.2   // 품질 향상은 긍정적

    return (
      resolution.impact.durationChange * durationWeight +
      (resolution.impact.costChange / 10000000) * costWeight +
      resolution.impact.qualityImpact * qualityWeight
    )
  }

  private applyResolution(
    resolution: Resolution,
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): void {
    for (const adjustment of resolution.implementation) {
      const taskSchedule = schedule.get(adjustment.taskId)
      if (!taskSchedule) continue

      switch (adjustment.adjustmentType) {
        case 'move':
          if (adjustment.newStart !== undefined) {
            taskSchedule.start = adjustment.newStart
            taskSchedule.finish = taskSchedule.start + taskSchedule.duration
          }
          break
          
        case 'extend':
          if (adjustment.newDuration !== undefined) {
            taskSchedule.duration = adjustment.newDuration
            taskSchedule.finish = taskSchedule.start + adjustment.newDuration
          }
          break
          
        case 'split':
          // 작업 분할 로직
          break
          
        case 'merge':
          // 작업 병합 로직
          break
      }
    }
  }

  private generateParallelMaximizedSchedule(tasks: GeneratedTask[]): AlternativeSchedule {
    // 병렬 작업 최대화 알고리즘
    const schedule = new Map<string, TaskSchedule>()
    
    // 구현...
    
    return {
      id: 'parallel_maximized',
      schedule,
      totalDuration: 0,
      totalCost: 0,
      description: '병렬 작업 최대화'
    }
  }

  private generateResourceAugmentedSchedule(tasks: GeneratedTask[]): AlternativeSchedule {
    // 자원 추가 가정 스케줄
    const schedule = new Map<string, TaskSchedule>()
    
    // 구현...
    
    return {
      id: 'resource_augmented',
      schedule,
      totalDuration: 0,
      totalCost: 0,
      description: '자원 추가 투입'
    }
  }

  private generateSplitTaskSchedule(tasks: GeneratedTask[]): AlternativeSchedule {
    // 작업 분할 스케줄
    const schedule = new Map<string, TaskSchedule>()
    
    // 구현...
    
    return {
      id: 'split_tasks',
      schedule,
      totalDuration: 0,
      totalCost: 0,
      description: '대형 작업 분할'
    }
  }

  private selectOptimalAlternative(
    alternatives: AlternativeSchedule[],
    tasks: GeneratedTask[]
  ): AlternativeSchedule {
    // 최적 대안 선택 로직
    return alternatives[0]
  }

  private findCriticalPath(
    schedule: Map<string, TaskSchedule>,
    tasks: GeneratedTask[]
  ): string[] {
    // CPM 알고리즘으로 임계 경로 찾기
    const criticalPath: string[] = []
    
    // 구현...
    
    return criticalPath
  }

  private calculateTotalDuration(schedule: Map<string, TaskSchedule>): number {
    let maxFinish = 0
    for (const taskSchedule of schedule.values()) {
      maxFinish = Math.max(maxFinish, taskSchedule.finish)
    }
    return maxFinish
  }
}

// 타입 정의
interface TaskSchedule {
  taskId: string
  start: number
  finish: number
  duration: number
  float: number
}

interface TimeSlot {
  taskId: string
  start: number
  end: number
  noiseLevel: 'high' | 'medium' | 'low'
  dustLevel: 'high' | 'medium' | 'low'
}

interface ResourceSlot {
  taskId: string
  start: number
  end: number
  quantity: number
  canShare: boolean
}

interface ResourceEvent {
  time: number
  type: 'start' | 'end'
  quantity: number
  taskId: string
}

interface AlternativeSchedule {
  id: string
  schedule: Map<string, TaskSchedule>
  totalDuration: number
  totalCost: number
  description: string
}

interface ScheduleResult {
  schedule: Map<string, TaskSchedule>
  conflicts: Conflict[]
  criticalPath: string[]
  totalDuration: number
}

export { TaskSchedule, ScheduleResult }