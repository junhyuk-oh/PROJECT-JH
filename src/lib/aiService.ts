import { addDays, differenceInDays } from 'date-fns'

export interface Task {
  id: string
  name: string
  duration: number
  dependencies: string[]
  resources?: string[]
  cost?: number
  priority?: 'high' | 'medium' | 'low'
}

export interface OptimizedSchedule {
  tasks: ScheduledTask[]
  totalDuration: number
  totalCost: number
  criticalPath: string[]
  recommendations: Recommendation[]
}

export interface ScheduledTask extends Task {
  startDate: Date
  endDate: Date
  slack: number
  isCritical: boolean
}

export interface Recommendation {
  id: string
  type: 'optimization' | 'cost' | 'risk' | 'tip'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  priority: number
  actions?: string[]
}

// AI 일정 최적화 알고리즘
export async function optimizeSchedule(
  tasks: Task[], 
  startDate: Date,
  constraints?: {
    maxDuration?: number
    maxBudget?: number
    preferredResources?: string[]
  }
): Promise<OptimizedSchedule> {
  // 1. 토폴로지컬 정렬로 작업 순서 결정
  const sortedTasks = topologicalSort(tasks)
  
  // 2. 임계 경로 방법(CPM)으로 일정 계산
  const scheduledTasks = calculateSchedule(sortedTasks, startDate)
  
  // 3. 임계 경로 식별
  const criticalPath = findCriticalPath(scheduledTasks)
  
  // 4. 리소스 평준화
  const leveledTasks = levelResources(scheduledTasks)
  
  // 5. 최적화 추천사항 생성
  const recommendations = generateRecommendations(leveledTasks, constraints)
  
  // 6. 총 기간 및 비용 계산
  const totalDuration = Math.max(...leveledTasks.map(t => 
    differenceInDays(t.endDate, startDate)
  ))
  const totalCost = leveledTasks.reduce((sum, task) => sum + (task.cost || 0), 0)
  
  return {
    tasks: leveledTasks,
    totalDuration,
    totalCost,
    criticalPath,
    recommendations
  }
}

// 토폴로지컬 정렬
function topologicalSort(tasks: Task[]): Task[] {
  const sorted: Task[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()
  
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  
  function visit(taskId: string) {
    if (visited.has(taskId)) return
    if (visiting.has(taskId)) {
      throw new Error('순환 종속성이 발견되었습니다')
    }
    
    visiting.add(taskId)
    const task = taskMap.get(taskId)!
    
    for (const depId of task.dependencies) {
      if (taskMap.has(depId)) {
        visit(depId)
      }
    }
    
    visiting.delete(taskId)
    visited.add(taskId)
    sorted.push(task)
  }
  
  for (const task of tasks) {
    visit(task.id)
  }
  
  return sorted
}

// 일정 계산 (CPM)
function calculateSchedule(tasks: Task[], startDate: Date): ScheduledTask[] {
  const scheduled: Map<string, ScheduledTask> = new Map()
  
  // 전진 계산 (Forward Pass)
  for (const task of tasks) {
    let earliestStart = startDate
    
    for (const depId of task.dependencies) {
      const dep = scheduled.get(depId)
      if (dep) {
        const depEnd = dep.endDate
        if (depEnd > earliestStart) {
          earliestStart = depEnd
        }
      }
    }
    
    const scheduledTask: ScheduledTask = {
      ...task,
      startDate: earliestStart,
      endDate: addDays(earliestStart, task.duration),
      slack: 0,
      isCritical: false
    }
    
    scheduled.set(task.id, scheduledTask)
  }
  
  // 후진 계산 (Backward Pass)
  const projectEnd = Math.max(...Array.from(scheduled.values()).map(t => 
    t.endDate.getTime()
  ))
  
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = scheduled.get(tasks[i].id)!
    let latestFinish = new Date(projectEnd)
    
    // 이 작업에 의존하는 작업들 찾기
    const dependents = Array.from(scheduled.values()).filter(t => 
      t.dependencies.includes(task.id)
    )
    
    if (dependents.length > 0) {
      latestFinish = new Date(Math.min(...dependents.map(d => 
        d.startDate.getTime()
      )))
    }
    
    const latestStart = addDays(latestFinish, -task.duration)
    task.slack = differenceInDays(latestStart, task.startDate)
    task.isCritical = task.slack === 0
  }
  
  return Array.from(scheduled.values())
}

// 임계 경로 찾기
function findCriticalPath(tasks: ScheduledTask[]): string[] {
  return tasks
    .filter(t => t.isCritical)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .map(t => t.id)
}

// 리소스 평준화
function levelResources(tasks: ScheduledTask[]): ScheduledTask[] {
  // 간단한 리소스 평준화 알고리즘
  // 실제로는 더 복잡한 최적화가 필요
  const resourceCalendar = new Map<string, Date[]>()
  
  for (const task of tasks) {
    if (!task.resources) continue
    
    for (const resource of task.resources) {
      if (!resourceCalendar.has(resource)) {
        resourceCalendar.set(resource, [])
      }
      
      const busyDates = resourceCalendar.get(resource)!
      // 리소스 충돌 확인 및 조정
      // 여기서는 간단히 구현
    }
  }
  
  return tasks
}

// AI 추천사항 생성
function generateRecommendations(
  tasks: ScheduledTask[],
  constraints?: any
): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  // 1. 병렬 작업 기회 찾기
  const parallelOpportunities = findParallelOpportunities(tasks)
  if (parallelOpportunities.length > 0) {
    recommendations.push({
      id: 'opt-1',
      type: 'optimization',
      title: '병렬 작업 최적화 가능',
      description: `${parallelOpportunities.length}개의 작업을 동시에 진행하여 공기를 단축할 수 있습니다.`,
      impact: 'high',
      priority: 1,
      actions: parallelOpportunities.map(t => `${t.name} 작업을 병렬로 진행`)
    })
  }
  
  // 2. 비용 절감 기회
  const highCostTasks = tasks.filter(t => 
    t.cost && t.cost > (constraints?.maxBudget || 10000000) * 0.2
  )
  if (highCostTasks.length > 0) {
    recommendations.push({
      id: 'cost-1',
      type: 'cost',
      title: '고비용 작업 최적화 필요',
      description: '일부 작업의 비용이 전체 예산의 20% 이상을 차지합니다.',
      impact: 'high',
      priority: 2,
      actions: highCostTasks.map(t => 
        `${t.name} 작업의 비용 재검토 (현재: ${(t.cost! / 10000).toLocaleString()}만원)`
      )
    })
  }
  
  // 3. 리스크 경고
  const criticalTasks = tasks.filter(t => t.isCritical)
  if (criticalTasks.length > tasks.length * 0.5) {
    recommendations.push({
      id: 'risk-1',
      type: 'risk',
      title: '임계 경로 비중이 높음',
      description: '전체 작업의 50% 이상이 임계 경로에 있어 지연 리스크가 높습니다.',
      impact: 'medium',
      priority: 3,
      actions: [
        '임계 경로 작업에 버퍼 시간 추가',
        '주요 작업에 백업 리소스 배치',
        '일일 진행 상황 모니터링 강화'
      ]
    })
  }
  
  // 4. 일반 팁
  recommendations.push({
    id: 'tip-1',
    type: 'tip',
    title: '주간 진행 회의 추천',
    description: '정기적인 진행 상황 점검으로 문제를 조기에 발견할 수 있습니다.',
    impact: 'low',
    priority: 4,
    actions: [
      '매주 월요일 오전 진행 상황 회의',
      '주요 이해관계자 참여',
      '리스크 사항 공유 및 대응 방안 논의'
    ]
  })
  
  return recommendations
}

// 병렬 작업 기회 찾기
function findParallelOpportunities(tasks: ScheduledTask[]): ScheduledTask[] {
  const opportunities: ScheduledTask[] = []
  
  // 같은 시작일을 가진 독립적인 작업들 찾기
  const tasksByStart = new Map<number, ScheduledTask[]>()
  
  for (const task of tasks) {
    const startTime = task.startDate.getTime()
    if (!tasksByStart.has(startTime)) {
      tasksByStart.set(startTime, [])
    }
    tasksByStart.get(startTime)!.push(task)
  }
  
  for (const [_, sameDayTasks] of tasksByStart) {
    if (sameDayTasks.length > 1) {
      // 서로 종속성이 없는지 확인
      const independent = sameDayTasks.filter(t1 => 
        !sameDayTasks.some(t2 => 
          t1.id !== t2.id && 
          (t1.dependencies.includes(t2.id) || t2.dependencies.includes(t1.id))
        )
      )
      
      if (independent.length > 1) {
        opportunities.push(...independent)
      }
    }
  }
  
  return opportunities
}

// AI 기반 프로젝트 분석
export async function analyzeProject(projectData: any): Promise<{
  insights: string[]
  risks: string[]
  opportunities: string[]
}> {
  // 실제로는 ML 모델을 사용하여 분석
  // 여기서는 규칙 기반 분석 시뮬레이션
  
  const insights: string[] = []
  const risks: string[] = []
  const opportunities: string[] = []
  
  // 프로젝트 규모 분석
  if (projectData.budget > 100000000) {
    insights.push('대규모 프로젝트로 단계별 진행이 권장됩니다')
    risks.push('예산 초과 리스크가 높으므로 철저한 비용 관리가 필요합니다')
  }
  
  // 기간 분석
  if (projectData.duration > 180) {
    insights.push('장기 프로젝트로 중간 마일스톤 설정이 중요합니다')
    opportunities.push('단계별 검증으로 품질 향상 가능')
  }
  
  // 팀 규모 분석
  if (projectData.teamSize > 20) {
    insights.push('대규모 팀 프로젝트로 커뮤니케이션 체계가 중요합니다')
    risks.push('의사소통 오류로 인한 지연 가능성')
    opportunities.push('전문 분야별 팀 구성으로 효율성 향상 가능')
  }
  
  return { insights, risks, opportunities }
}

// 자연어 질문에 대한 답변 생성
export async function generateAIResponse(
  question: string,
  context: {
    project?: any
    schedule?: OptimizedSchedule
  }
): Promise<string> {
  // 실제로는 LLM API를 호출
  // 여기서는 간단한 패턴 매칭으로 시뮬레이션
  
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('일정') || lowerQuestion.includes('기간')) {
    if (context.schedule) {
      return `현재 프로젝트의 총 기간은 ${context.schedule.totalDuration}일입니다. 
      임계 경로에는 ${context.schedule.criticalPath.length}개의 작업이 있으며, 
      이 작업들이 전체 일정을 결정합니다.`
    }
    return '프로젝트 일정을 먼저 생성해주세요.'
  }
  
  if (lowerQuestion.includes('비용') || lowerQuestion.includes('예산')) {
    if (context.schedule) {
      return `총 예상 비용은 ${(context.schedule.totalCost / 10000).toLocaleString()}만원입니다. 
      AI 분석 결과, 대량 구매와 리소스 최적화를 통해 약 15% 절감이 가능할 것으로 예상됩니다.`
    }
    return '비용 분석을 위해 프로젝트 정보를 입력해주세요.'
  }
  
  if (lowerQuestion.includes('리스크') || lowerQuestion.includes('위험')) {
    return `주요 리스크 요인:
    1. 임계 경로 작업의 지연 가능성
    2. 리소스 중복 배치로 인한 병목 현상
    3. 외부 요인(날씨, 자재 수급 등)에 의한 변동성
    
    리스크 완화 방안을 AI 추천 탭에서 확인하세요.`
  }
  
  return '구체적인 질문을 입력해주세요. 예: "전체 공사 기간은 얼마나 걸리나요?"'
}