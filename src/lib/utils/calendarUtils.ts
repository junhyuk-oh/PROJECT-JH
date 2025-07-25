import { Task as ScheduledTask } from '@/types'
export { TASK_DISPLAY } from '@/lib/constants/calendar'

// SPECIAL_INDICATORS 임시 정의
export const SPECIAL_INDICATORS = {
  CRITICAL: 'critical',
  WEATHER: 'weather', 
  NOISE: 'noise'
}

/**
 * 날짜별 작업 그룹
 */
export interface TaskDateGroup {
  starting: ScheduledTask[]
  ongoing: ScheduledTask[]
  ending: ScheduledTask[]
  all: ScheduledTask[]
}

/**
 * 작업들을 날짜별로 그룹화
 */
export function groupTasksByDate(tasks: ScheduledTask[]): Map<string, TaskDateGroup> {
  const grouped = new Map<string, TaskDateGroup>()
  
  tasks.forEach(task => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date()
    const endDate = task.endDate ? new Date(task.endDate) : startDate
    
    // 작업 기간 동안의 모든 날짜에 작업 추가
    const current = new Date(startDate)
    while (current <= endDate) {
      const dateKey = current.toDateString()
      const existing = grouped.get(dateKey) || { 
        starting: [], 
        ongoing: [], 
        ending: [], 
        all: [] 
      }
      
      // 시작일, 종료일, 진행중 구분
      if (current.getTime() === startDate.getTime()) {
        existing.starting.push(task)
      } else if (current.getTime() === endDate.getTime()) {
        existing.ending.push(task)
      } else {
        existing.ongoing.push(task)
      }
      
      existing.all.push(task)
      grouped.set(dateKey, existing)
      
      // 다음 날로 이동
      current.setDate(current.getDate() + 1)
    }
  })
  
  return grouped
}

/**
 * 특정 날짜의 작업들 가져오기
 */
export function getTasksForDate(
  tasksByDate: Map<string, TaskDateGroup>, 
  date: Date
): TaskDateGroup {
  const dateData = tasksByDate.get(date.toDateString())
  return {
    starting: dateData?.starting || [],
    ongoing: dateData?.ongoing || [],
    ending: dateData?.ending || [],
    all: dateData?.all || []
  }
}

/**
 * 주간 범위 계산
 */
export function getWeekRange(date: Date): { start: Date, end: Date } {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay()) // 일요일로 이동
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // 토요일
  
  return { start, end }
}

/**
 * 월간 주 수 계산
 */
export function getWeeksInMonth(year: number, month: number): number {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  return Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7)
}

/**
 * 날짜가 같은지 비교
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}

/**
 * 날짜가 범위 내에 있는지 확인
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}