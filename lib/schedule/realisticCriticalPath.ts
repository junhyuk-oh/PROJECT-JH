import { GeneratedTask } from '../types'
import { CriticalPathNode, TaskDependency } from './types'
import { WORK_CONSTRAINTS } from '../types/construction'

interface RealisticScheduleConfig {
  projectDurationWeeks: number;
  startDate: Date;
  workDays: string[];
  dailyWorkHours: { start: number; end: number };
  livingDuringWork: boolean;
  noiseRestrictions: boolean;
}

interface ResourceConstraint {
  resourceType: string;
  maxConcurrent: number;
  requiredSkills: string[];
}

// 실제 건설업계 제약조건을 고려한 CPM 알고리즘
export function calculateRealisticSchedule(
  tasks: GeneratedTask[],
  config: RealisticScheduleConfig
): { tasks: any[], criticalPath: string[], totalDays: number, warnings: string[] } {
  
  const warnings: string[] = []
  
  // 1. 작업 의존성 및 제약 조건 분석
  const dependencies = analyzeDependencies(tasks)
  const resourceConstraints = analyzeResourceConstraints(tasks)
  
  // 2. Forward Pass - 제약 조건 고려
  const nodes = performConstrainedForwardPass(tasks, dependencies, resourceConstraints, config, warnings)
  
  // 3. Backward Pass
  const finalNodes = performBackwardPass(nodes, tasks, config)
  
  // 4. Critical Path 식별
  const criticalPath = identifyEnhancedCriticalPath(finalNodes, tasks)
  
  // 5. 작업일 기준 일정 조정
  const scheduledTasks = createRealisticScheduledTasks(tasks, finalNodes, config)
  
  // 6. 총 프로젝트 기간 계산 (작업일 기준)
  const totalWorkingDays = Math.max(...finalNodes.map(node => node.earlyFinish))
  const totalCalendarDays = convertWorkingDaysToCalendarDays(totalWorkingDays, config)
  
  // 7. 일정 검증 및 경고 생성
  validateSchedule(scheduledTasks, config, warnings)
  
  return {
    tasks: scheduledTasks,
    criticalPath,
    totalDays: totalCalendarDays,
    warnings
  }
}

function analyzeDependencies(tasks: GeneratedTask[]): TaskDependency[] {
  return tasks.map(task => ({
    taskId: task.id,
    dependsOn: task.dependencies
  }))
}

function analyzeResourceConstraints(tasks: GeneratedTask[]): ResourceConstraint[] {
  const constraints: ResourceConstraint[] = []
  
  // 전문 기술자 제약 (동시 작업 불가)
  constraints.push({
    resourceType: 'electrical_specialist',
    maxConcurrent: 1, // 전기 기술자는 1명만
    requiredSkills: ['전기 기술자', '전기 검사관']
  })
  
  constraints.push({
    resourceType: 'plumbing_specialist', 
    maxConcurrent: 1, // 배관공은 1명만
    requiredSkills: ['배관공', '위생 설비 기사']
  })
  
  constraints.push({
    resourceType: 'structural_specialist',
    maxConcurrent: 1, // 구조 전문가는 1명만
    requiredSkills: ['구조 전문가', '철거 전문가']
  })
  
  // 소음 작업 제약 (동시에 여러 공간에서 불가)
  constraints.push({
    resourceType: 'noisy_work',
    maxConcurrent: 1, // 소음 작업은 한 번에 하나씩
    requiredSkills: ['철거 전문가', '구조 전문가']
  })
  
  return constraints
}

function performConstrainedForwardPass(
  tasks: GeneratedTask[], 
  dependencies: TaskDependency[], 
  resourceConstraints: ResourceConstraint[],
  config: RealisticScheduleConfig,
  warnings: string[]
): CriticalPathNode[] {
  
  const nodes: CriticalPathNode[] = tasks.map(task => ({
    taskId: task.id,
    earlyStart: 0,
    earlyFinish: 0,
    lateStart: 0,
    lateFinish: 0,
    slack: 0,
    isCritical: false
  }))

  // 자원 사용 추적
  const resourceUsage = new Map<string, Array<{taskId: string, start: number, end: number}>>()
  resourceConstraints.forEach(constraint => {
    resourceUsage.set(constraint.resourceType, [])
  })

  // 토폴로지 정렬로 작업 순서 결정
  const processed = new Set<string>()
  const queue = [...tasks]
  let iterations = 0
  const maxIterations = tasks.length * 3 // 무한루프 방지

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++
    const task = queue.shift()!
    const deps = dependencies.find(d => d.taskId === task.id)
    
    // 의존성 확인
    if (deps && deps.dependsOn.some(depId => !processed.has(depId))) {
      queue.push(task) // 나중에 다시 처리
      continue
    }

    const node = nodes.find(n => n.taskId === task.id)!
    
    // 의존성 기반 최조 시작 시간 계산
    let dependencyBasedStart = 0
    if (deps && deps.dependsOn.length > 0) {
      dependencyBasedStart = Math.max(
        ...deps.dependsOn.map(depId => {
          const depNode = nodes.find(n => n.taskId === depId)!
          return depNode.earlyFinish
        })
      )
    }

    // 자원 제약 조건 확인
    const resourceBasedStart = calculateResourceConstrainedStart(
      task, 
      dependencyBasedStart, 
      resourceConstraints, 
      resourceUsage
    )

    // 작업 시간 제약 (소음 제한 등) 확인
    const timeConstrainedStart = adjustForTimeConstraints(
      task,
      Math.max(dependencyBasedStart, resourceBasedStart),
      config
    )

    node.earlyStart = Math.max(dependencyBasedStart, resourceBasedStart, timeConstrainedStart)
    node.earlyFinish = node.earlyStart + task.duration

    // 자원 사용 등록
    updateResourceUsage(task, node, resourceConstraints, resourceUsage)
    
    processed.add(task.id)
  }

  if (iterations >= maxIterations) {
    warnings.push('일정 계산 중 순환 의존성이 감지되었습니다. 일부 작업 순서를 조정했습니다.')
  }

  return nodes
}

function calculateResourceConstrainedStart(
  task: GeneratedTask,
  dependencyStart: number,
  constraints: ResourceConstraint[],
  resourceUsage: Map<string, Array<{taskId: string, start: number, end: number}>>
): number {
  
  let constrainedStart = dependencyStart
  
  for (const constraint of constraints) {
    // 이 작업이 해당 자원을 사용하는지 확인
    const needsResource = task.skills.some(skill => 
      constraint.requiredSkills.includes(skill)
    )
    
    if (needsResource) {
      const usage = resourceUsage.get(constraint.resourceType) || []
      
      // 자원 가용성 확인
      let availableStart = findNextAvailableSlot(
        usage,
        constrainedStart,
        task.duration,
        constraint.maxConcurrent
      )
      
      constrainedStart = Math.max(constrainedStart, availableStart)
    }
  }
  
  return constrainedStart
}

function findNextAvailableSlot(
  usage: Array<{taskId: string, start: number, end: number}>,
  earliestStart: number,
  duration: number,
  maxConcurrent: number
): number {
  
  // 시간순으로 정렬
  usage.sort((a, b) => a.start - b.start)
  
  let currentTime = earliestStart
  
  while (true) {
    // 현재 시간에서 진행 중인 작업 수 확인
    const concurrentTasks = usage.filter(u => 
      u.start <= currentTime && u.end > currentTime
    ).length
    
    if (concurrentTasks < maxConcurrent) {
      // 충분한 시간 슬롯이 있는지 확인
      const endTime = currentTime + duration
      const conflictingTasks = usage.filter(u => 
        (u.start < endTime && u.end > currentTime)
      )
      
      if (conflictingTasks.length < maxConcurrent) {
        return currentTime
      }
    }
    
    // 다음 작업 완료 시점으로 이동
    const nextEndTime = usage
      .filter(u => u.end > currentTime)
      .map(u => u.end)
      .sort((a, b) => a - b)[0]
    
    if (nextEndTime) {
      currentTime = nextEndTime
    } else {
      return currentTime
    }
  }
}

function adjustForTimeConstraints(
  task: GeneratedTask,
  proposedStart: number,
  config: RealisticScheduleConfig
): number {
  
  // 거주 중 리모델링이고 소음 제한이 있는 경우
  if (config.livingDuringWork && config.noiseRestrictions) {
    // 소음 작업 시간 제한 확인
    const isNoisyWork = task.skills.some(skill => 
      ['철거 전문가', '구조 전문가'].includes(skill)
    ) || task.category === 'demolition'
    
    if (isNoisyWork) {
      // 평일 낮시간만 가능하도록 조정
      return adjustToWorkingHours(proposedStart, config)
    }
  }
  
  return proposedStart
}

function adjustToWorkingHours(
  startDay: number,
  config: RealisticScheduleConfig
): number {
  
  // 작업일만 고려하여 조정
  // 실제로는 더 복잡한 시간 계산이 필요하지만, 여기서는 일 단위로 단순화
  return startDay
}

function updateResourceUsage(
  task: GeneratedTask,
  node: CriticalPathNode,
  constraints: ResourceConstraint[],
  resourceUsage: Map<string, Array<{taskId: string, start: number, end: number}>>
): void {
  
  for (const constraint of constraints) {
    const needsResource = task.skills.some(skill => 
      constraint.requiredSkills.includes(skill)
    )
    
    if (needsResource) {
      const usage = resourceUsage.get(constraint.resourceType) || []
      usage.push({
        taskId: task.id,
        start: node.earlyStart,
        end: node.earlyFinish
      })
      resourceUsage.set(constraint.resourceType, usage)
    }
  }
}

function performBackwardPass(
  nodes: CriticalPathNode[], 
  tasks: GeneratedTask[],
  config: RealisticScheduleConfig
): CriticalPathNode[] {
  
  const maxFinish = Math.max(...nodes.map(node => node.earlyFinish))
  const targetFinish = config.projectDurationWeeks * 5 // 주 5일 기준
  
  // 프로젝트 목표 기간 설정 (더 짧은 쪽 선택)
  const projectFinish = Math.min(maxFinish, targetFinish)
  
  // 종료 노드들의 Late Finish 설정
  nodes.forEach(node => {
    if (node.earlyFinish === maxFinish) {
      node.lateFinish = projectFinish
    }
  })

  // 역순으로 처리
  const sortedNodes = [...nodes].sort((a, b) => b.earlyFinish - a.earlyFinish)
  
  for (const node of sortedNodes) {
    if (node.lateFinish === 0) {
      // 후속 작업들의 Late Start 중 최소값
      const successors = tasks.filter(task => 
        task.dependencies.includes(node.taskId)
      )
      
      if (successors.length > 0) {
        const minSuccessorLateStart = Math.min(
          ...successors.map(succ => {
            const succNode = nodes.find(n => n.taskId === succ.id)!
            return succNode.lateStart || succNode.lateFinish - succ.duration
          })
        )
        node.lateFinish = minSuccessorLateStart
      } else {
        node.lateFinish = projectFinish
      }
    }
    
    const task = tasks.find(t => t.id === node.taskId)!
    node.lateStart = node.lateFinish - task.duration
    node.slack = node.lateStart - node.earlyStart
    node.isCritical = node.slack <= 0 // 여유가 없거나 음수인 경우 critical
  }

  return nodes
}

function identifyEnhancedCriticalPath(nodes: CriticalPathNode[], tasks: GeneratedTask[]): string[] {
  // Critical path + 중요한 milestone 작업들
  const criticalTasks = nodes
    .filter(node => node.isCritical)
    .sort((a, b) => a.earlyStart - b.earlyStart)
    .map(node => node.taskId)
  
  // Milestone 작업들도 중요하게 표시
  const milestones = tasks
    .filter(task => task.isMilestone)
    .map(task => task.id)
  
  return Array.from(new Set([...criticalTasks, ...milestones]))
}

function createRealisticScheduledTasks(
  tasks: GeneratedTask[], 
  nodes: CriticalPathNode[], 
  config: RealisticScheduleConfig
): any[] {
  
  const startDate = config.startDate
  
  return tasks.map(task => {
    const node = nodes.find(n => n.taskId === task.id)!
    
    // 작업일을 달력 날짜로 변환
    const taskStartDate = convertWorkingDayToCalendarDate(node.earlyStart, config)
    const taskEndDate = convertWorkingDayToCalendarDate(node.earlyFinish, config)

    return {
      id: task.id,
      name: task.name,
      description: task.description,
      start: taskStartDate,
      end: taskEndDate,
      duration: task.duration,
      progress: 0,
      dependencies: task.dependencies,
      category: task.category,
      space: task.space,
      isCritical: node.isCritical,
      isMilestone: task.isMilestone,
      color: getCategoryColor(task.category),
      estimatedCost: task.estimatedCost,
      materials: task.materials,
      skills: task.skills,
      slack: node.slack,
      earlyStart: node.earlyStart,
      earlyFinish: node.earlyFinish,
      lateStart: node.lateStart,
      lateFinish: node.lateFinish
    }
  })
}

function convertWorkingDayToCalendarDate(workingDay: number, config: RealisticScheduleConfig): Date {
  const startDate = new Date(config.startDate)
  const result = new Date(startDate)
  
  let daysAdded = 0
  let currentDay = 0
  
  const workDayNumbers = config.workDays.map(day => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    return days.indexOf(day)
  })
  
  while (currentDay < workingDay) {
    result.setDate(result.getDate() + 1)
    daysAdded++
    
    if (workDayNumbers.includes(result.getDay())) {
      currentDay++
    }
    
    // 무한 루프 방지
    if (daysAdded > 500) break
  }
  
  return result
}

function convertWorkingDaysToCalendarDays(workingDays: number, config: RealisticScheduleConfig): number {
  const endDate = convertWorkingDayToCalendarDate(workingDays, config)
  const startDate = config.startDate
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

function validateSchedule(tasks: any[], config: RealisticScheduleConfig, warnings: string[]): void {
  const totalWorkingDays = Math.max(...tasks.map(task => task.earlyFinish))
  const targetWorkingDays = config.projectDurationWeeks * 5
  
  // 기간 초과 경고
  if (totalWorkingDays > targetWorkingDays * 1.1) {
    warnings.push(`예상 공사 기간이 목표보다 ${Math.round((totalWorkingDays - targetWorkingDays) / 5 * 10) / 10}주 초과됩니다.`)
  }
  
  // 비용 검증
  const totalCost = tasks.reduce((sum, task) => sum + task.estimatedCost, 0)
  if (totalCost < 20000000) {
    warnings.push('예상 비용이 시장 평균보다 낮을 수 있습니다. 추가 비용이 발생할 가능성이 있습니다.')
  }
  
  // Critical path 비율 확인
  const criticalTasks = tasks.filter(task => task.isCritical)
  if (criticalTasks.length > tasks.length * 0.8) {
    warnings.push('대부분의 작업이 중요 경로에 포함되어 있어 일정 지연 위험이 높습니다.')
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    demolition: '#ef4444',     // 빨강 - 철거
    electrical: '#f59e0b',     // 주황 - 전기
    plumbing: '#3b82f6',       // 파랑 - 배관
    carpentry: '#8b5cf6',      // 보라 - 목공
    painting: '#10b981',       // 초록 - 도장
    flooring: '#f97316',       // 주황 - 바닥
    lighting: '#eab308',       // 노랑 - 조명
    cleanup: '#6b7280'         // 회색 - 정리
  }
  return colors[category] || '#6b7280'
}