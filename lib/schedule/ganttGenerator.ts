import { GanttChartData } from '../types'

export function generateGanttChartData(
  scheduledTasks: any[],
  scheduleInfo: any,
  totalDays: number
): GanttChartData {
  const startDate = scheduleInfo?.startDate || new Date()
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + totalDays)

  // 작업일 계산 (주말 제외)
  const workingDays = calculateWorkingDays(startDate, endDate, scheduleInfo?.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'])
  
  // 휴일 설정 (기본적으로 없음)
  const holidays: Date[] = []

  // 인사이트 생성
  const insights = generateInsights(scheduledTasks, totalDays)

  return {
    tasks: scheduledTasks,
    timeline: {
      startDate,
      endDate,
      totalDays,
      workingDays,
      holidays
    },
    insights
  }
}

function calculateWorkingDays(startDate: Date, endDate: Date, workDays: string[]): Date[] {
  const days = []
  const current = new Date(startDate)
  
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  
  while (current <= endDate) {
    const dayName = dayNames[current.getDay()]
    if (workDays.includes(dayName)) {
      days.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function generateInsights(tasks: any[], totalDays: number) {
  const criticalTasks = tasks.filter(task => task.isCritical)
  const complexity = calculateComplexity(tasks)
  
  const warnings = []
  const suggestions = []
  const optimizations = []
  
  // 복잡도 기반 경고
  if (complexity > 80) {
    warnings.push('프로젝트 복잡도가 높습니다. 단계적 진행을 권장합니다.')
  }
  
  // 중요 경로 기반 경고
  if (criticalTasks.length > tasks.length * 0.7) {
    warnings.push('중요 경로 작업이 많아 일정 지연 위험이 있습니다.')
  }
  
  // 일정 기반 제안
  if (totalDays > 60) {
    suggestions.push('장기 프로젝트입니다. 중간 검토 지점을 설정하세요.')
  }
  
  // 비용 효율성 제안
  const totalCost = tasks.reduce((sum, task) => sum + task.estimatedCost, 0)
  if (totalCost > 10000000) {
    suggestions.push('고비용 프로젝트입니다. 단계별 예산 관리를 권장합니다.')
  }
  
  // 최적화 결과
  optimizations.push('작업 순서가 CPM 알고리즘으로 최적화되었습니다.')
  optimizations.push('병렬 처리 가능한 작업들이 식별되었습니다.')
  
  if (criticalTasks.length < tasks.length * 0.3) {
    optimizations.push('유연한 일정 조정이 가능한 구조입니다.')
  }

  return {
    complexity,
    warnings,
    suggestions,
    optimizations,
    budgetImpact: Math.min(95, 60 + (complexity * 0.4)), // 60-95% 범위
    criticalPath: criticalTasks.map(task => task.id)
  }
}

function calculateComplexity(tasks: any[]): number {
  const factors = {
    taskCount: Math.min(tasks.length * 2, 30), // 작업 수 (최대 30점)
    dependencies: Math.min(
      tasks.reduce((sum, task) => sum + task.dependencies.length, 0) * 3, 
      25
    ), // 의존성 (최대 25점)
    criticalPath: Math.min(
      tasks.filter(task => task.isCritical).length * 4, 
      25
    ), // 중요 경로 (최대 25점)
    spaces: Math.min(
      new Set(tasks.map(task => task.space)).size * 5, 
      20
    ) // 공간 수 (최대 20점)
  }
  
  return Math.min(
    factors.taskCount + factors.dependencies + factors.criticalPath + factors.spaces,
    100
  )
}