import { GeneratedTask } from '../types'
import { CriticalPathNode, TaskDependency } from './types'
import { calculateRealisticSchedule } from './realisticCriticalPath'

// CPM 알고리즘을 사용한 최적 일정 계산 - 현실적 제약조건 반영
export function calculateOptimalSchedule(
  tasks: GeneratedTask[],
  basicInfo: any,
  scheduleInfo: any
): { tasks: any[], criticalPath: string[], totalDays: number, warnings?: string[] } {
  
  // 새로운 현실적 스케줄링 알고리즘 사용
  if (basicInfo && scheduleInfo) {
    const config = {
      projectDurationWeeks: parseProjectDuration(basicInfo.projectDuration || '6주'),
      startDate: scheduleInfo.startDate || new Date(),
      workDays: scheduleInfo.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'],
      dailyWorkHours: scheduleInfo.dailyWorkHours || { start: 9, end: 18 },
      livingDuringWork: basicInfo.residenceStatus === 'occupied',
      noiseRestrictions: basicInfo.residenceStatus === 'occupied'
    }
    
    return calculateRealisticSchedule(tasks, config)
  }
  
  // 레거시 호환성을 위한 기본 CPM
  return calculateLegacyCPM(tasks, scheduleInfo)
}

// 레거시 CPM 알고리즘
function calculateLegacyCPM(
  tasks: GeneratedTask[],
  scheduleInfo: any
): { tasks: any[], criticalPath: string[], totalDays: number } {
  // Task dependencies 구축
  const dependencies: TaskDependency[] = tasks.map(task => ({
    taskId: task.id,
    dependsOn: task.dependencies
  }))

  // Forward Pass (Early Start/Finish 계산)
  const nodes = calculateForwardPass(tasks, dependencies)
  
  // Backward Pass (Late Start/Finish 계산)
  const finalNodes = calculateBackwardPass(nodes, tasks)
  
  // Critical Path 식별
  const criticalPath = identifyCriticalPath(finalNodes)
  
  // 스케줄된 작업들 생성
  const scheduledTasks = createScheduledTasks(tasks, finalNodes, scheduleInfo)
  
  // 총 프로젝트 기간 계산
  const totalDays = Math.max(...finalNodes.map(node => node.earlyFinish))

  return {
    tasks: scheduledTasks,
    criticalPath,
    totalDays
  }
}

function calculateForwardPass(tasks: GeneratedTask[], dependencies: TaskDependency[]): CriticalPathNode[] {
  const nodes: CriticalPathNode[] = tasks.map(task => ({
    taskId: task.id,
    earlyStart: 0,
    earlyFinish: 0,
    lateStart: 0,
    lateFinish: 0,
    slack: 0,
    isCritical: false
  }))

  // 토폴로지 정렬을 위한 처리된 작업들 추적
  const processed = new Set<string>()
  const queue = [...tasks]

  while (queue.length > 0) {
    const task = queue.shift()!
    const deps = dependencies.find(d => d.taskId === task.id)
    
    // 모든 의존성이 처리되었는지 확인
    if (deps && deps.dependsOn.some(depId => !processed.has(depId))) {
      queue.push(task) // 나중에 다시 처리
      continue
    }

    const node = nodes.find(n => n.taskId === task.id)!
    
    if (deps && deps.dependsOn.length > 0) {
      // 의존성이 있는 경우, 가장 늦은 predecessor의 완료 시간 이후 시작
      const maxPredecessorFinish = Math.max(
        ...deps.dependsOn.map(depId => {
          const depNode = nodes.find(n => n.taskId === depId)!
          return depNode.earlyFinish
        })
      )
      node.earlyStart = maxPredecessorFinish
    } else {
      // 의존성이 없는 경우 0일에 시작
      node.earlyStart = 0
    }

    node.earlyFinish = node.earlyStart + task.duration
    processed.add(task.id)
  }

  return nodes
}

function calculateBackwardPass(nodes: CriticalPathNode[], tasks: GeneratedTask[]): CriticalPathNode[] {
  const maxFinish = Math.max(...nodes.map(node => node.earlyFinish))
  
  // 종료 노드들의 Late Finish를 설정
  nodes.forEach(node => {
    if (node.earlyFinish === maxFinish) {
      node.lateFinish = node.earlyFinish
    }
  })

  // 역순으로 처리
  const sortedNodes = [...nodes].sort((a, b) => b.earlyFinish - a.earlyFinish)
  
  for (const node of sortedNodes) {
    if (node.lateFinish === 0) {
      // 후속 작업들의 Late Start 중 최소값을 찾기
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
        node.lateFinish = maxFinish
      }
    }
    
    const task = tasks.find(t => t.id === node.taskId)!
    node.lateStart = node.lateFinish - task.duration
    node.slack = node.lateStart - node.earlyStart
    node.isCritical = node.slack === 0
  }

  return nodes
}

function identifyCriticalPath(nodes: CriticalPathNode[]): string[] {
  return nodes
    .filter(node => node.isCritical)
    .sort((a, b) => a.earlyStart - b.earlyStart)
    .map(node => node.taskId)
}

function createScheduledTasks(
  tasks: GeneratedTask[], 
  nodes: CriticalPathNode[], 
  scheduleInfo: any
): any[] {
  const startDate = scheduleInfo?.startDate || new Date()
  
  return tasks.map(task => {
    const node = nodes.find(n => n.taskId === task.id)!
    const taskStartDate = new Date(startDate)
    taskStartDate.setDate(startDate.getDate() + node.earlyStart)
    
    const taskEndDate = new Date(taskStartDate)
    taskEndDate.setDate(taskStartDate.getDate() + task.duration)

    return {
      id: task.id,
      name: task.name,
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
      estimatedCost: task.estimatedCost
    }
  })
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    demolition: '#ef4444',
    electrical: '#f59e0b',
    plumbing: '#3b82f6',
    carpentry: '#8b5cf6',
    painting: '#10b981',
    flooring: '#f97316',
    lighting: '#eab308',
    cleanup: '#6b7280'
  }
  return colors[category] || '#6b7280'
}

// 프로젝트 기간 파싱
function parseProjectDuration(duration: string): number {
  const match = duration.match(/\d+/)
  return match ? parseInt(match[0]) : 6
}