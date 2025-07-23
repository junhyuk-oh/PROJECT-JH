import { ScheduledTask, TaskStatus } from '@/lib/types'
import { getWeekRange } from './calendarUtils'

/**
 * 작업 통계 인터페이스
 */
export interface TaskStatistics {
  total: number
  byStatus: {
    completed: number
    inProgress: number
    pending: number
    delayed: number
    cancelled: number
  }
  progress: {
    overall: number
    thisWeek: number
    today: number
  }
  timeline: {
    todayCount: number
    weekCount: number
    remainingDays: number
  }
}

/**
 * 작업 통계 계산
 */
export function calculateTaskStatistics(
  tasks: ScheduledTask[], 
  totalDuration: number,
  currentDate: Date = new Date()
): TaskStatistics {
  // 상태별 카운트
  const byStatus = {
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    delayed: tasks.filter(t => t.status === 'delayed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  }
  
  // 전체 진행률
  const overallProgress = tasks.length > 0 
    ? Math.round((byStatus.completed / tasks.length) * 100) 
    : 0
  
  // 오늘 작업
  const todayTasks = getTasksForDay(tasks, currentDate)
  
  // 이번 주 작업
  const { start: weekStart, end: weekEnd } = getWeekRange(currentDate)
  const weekTasks = getTasksInRange(tasks, weekStart, weekEnd)
  
  // 이번 주 진행률
  const weekProgress = weekTasks.length > 0
    ? Math.round((weekTasks.filter(t => t.status === 'completed').length / weekTasks.length) * 100)
    : 0
  
  // 오늘 진행률
  const todayProgress = todayTasks.length > 0
    ? Math.round((todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100)
    : 0
  
  // 남은 작업일 계산
  const projectStartDate = tasks.length > 0 && tasks[0].startDate 
    ? new Date(tasks[0].startDate) 
    : currentDate
  
  const elapsedDays = Math.floor(
    (currentDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const remainingDays = Math.max(0, totalDuration - elapsedDays)
  
  return {
    total: tasks.length,
    byStatus,
    progress: {
      overall: overallProgress,
      thisWeek: weekProgress,
      today: todayProgress
    },
    timeline: {
      todayCount: todayTasks.length,
      weekCount: weekTasks.length,
      remainingDays
    }
  }
}

/**
 * 특정 날짜의 작업 필터링
 */
export function getTasksForDay(tasks: ScheduledTask[], date: Date): ScheduledTask[] {
  return tasks.filter(task => {
    const startDate = task.startDate ? new Date(task.startDate) : null
    const endDate = task.endDate ? new Date(task.endDate) : null
    
    if (!startDate || !endDate) return false
    
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const taskStart = new Date(startDate)
    taskStart.setHours(0, 0, 0, 0)
    
    const taskEnd = new Date(endDate)
    taskEnd.setHours(23, 59, 59, 999)
    
    return targetDate >= taskStart && targetDate <= taskEnd
  })
}

/**
 * 날짜 범위 내 작업 필터링
 */
export function getTasksInRange(
  tasks: ScheduledTask[], 
  startDate: Date, 
  endDate: Date
): ScheduledTask[] {
  return tasks.filter(task => {
    const taskStart = task.startDate ? new Date(task.startDate) : null
    const taskEnd = task.endDate ? new Date(task.endDate) : null
    
    if (!taskStart || !taskEnd) return false
    
    // 작업이 범위와 겹치는 경우
    return taskStart <= endDate && taskEnd >= startDate
  })
}

/**
 * 작업 타입별 통계
 */
export function getTasksByType(tasks: ScheduledTask[]): Record<string, number> {
  return tasks.reduce((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * 임계 경로 작업 필터링
 */
export function getCriticalTasks(tasks: ScheduledTask[], criticalPath: string[]): ScheduledTask[] {
  return tasks.filter(task => criticalPath.includes(task.id))
}

/**
 * 특수 작업 필터링
 */
export function getSpecialTasks(tasks: ScheduledTask[]) {
  return {
    noisy: tasks.filter(t => t.noiseLevel === 'high'),
    weatherDependent: tasks.filter(t => t.weatherDependent),
    drying: tasks.filter(t => t.dryingTime && t.dryingTime > 0),
    diy: tasks.filter(t => t.diyPossible)
  }
}