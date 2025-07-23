import { Task } from '../types'
import { WEEKDAYS, NOISE_LEVELS, WEATHER_DEPENDENT_TASKS } from '../constants'

/**
 * 작업 시간 제약 검증
 */
export function validateWorkingHours(task: Task, date: Date): boolean {
  if (!task.timeConstraints) return true
  
  const dayOfWeek = date.getDay()
  if (task.timeConstraints.restrictedDays?.includes(dayOfWeek)) {
    return false
  }
  
  if (task.timeConstraints.workingHours) {
    const hours = date.getHours()
    const [startHour] = task.timeConstraints.workingHours.split('-')[0].split(':').map(Number)
    const [endHour] = task.timeConstraints.workingHours.split('-')[1].split(':').map(Number)
    
    return hours >= startHour && hours < endHour
  }
  
  return true
}

/**
 * DIY 가능 작업 필터링
 */
export function filterDIYTasks(
  tasks: Task[], 
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert'
): Task[] {
  return tasks.filter(task => {
    if (!task.diyPossible) return false
    if (difficulty && task.diyDifficulty !== difficulty) return false
    return true
  })
}

/**
 * 날씨 영향을 받는 작업 확인
 */
export function getWeatherDependentTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => 
    task.weatherDependent === true || 
    WEATHER_DEPENDENT_TASKS.includes(task.type as any)
  )
}

/**
 * 소음 레벨별 작업 그룹화
 */
export function groupTasksByNoiseLevel(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {
    [NOISE_LEVELS.HIGH]: [],
    [NOISE_LEVELS.MEDIUM]: [],
    [NOISE_LEVELS.LOW]: [],
    [NOISE_LEVELS.NONE]: []
  }
  
  tasks.forEach(task => {
    const level = task.noiseLevel || NOISE_LEVELS.NONE
    grouped[level].push(task)
  })
  
  return grouped
}

/**
 * 건조/양생 시간 계산
 */
export function calculateDryingTime(task: Task): number {
  return task.dryingTime || 0
}

/**
 * 예산 범위 계산
 */
export interface BudgetBreakdown {
  taskId: string
  taskName: string
  min: number
  max: number
  unit?: string
}

export interface BudgetSummary {
  min: number
  max: number
  breakdown: BudgetBreakdown[]
}

export function calculateBudgetRange(tasks: Task[]): BudgetSummary {
  let min = 0
  let max = 0
  const breakdown: BudgetBreakdown[] = []
  
  tasks.forEach(task => {
    if (task.costRange) {
      min += task.costRange.min
      max += task.costRange.max
      breakdown.push({
        taskId: task.id,
        taskName: task.name,
        min: task.costRange.min,
        max: task.costRange.max,
        unit: task.costRange.unit
      })
    }
  })
  
  return { min, max, breakdown }
}

/**
 * 작업별 필요 업체 타입 추출
 */
export function getRequiredContractorTypes(tasks: Task[]): string[] {
  const contractorTypes = new Set<string>()
  
  tasks.forEach(task => {
    if (!task.diyPossible || task.diyDifficulty === 'expert') {
      contractorTypes.add(task.type)
    }
  })
  
  return Array.from(contractorTypes)
}

/**
 * 임계 경로 상의 작업 찾기
 */
export function findCriticalTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.isCritical === true)
}

/**
 * 특정 업체가 담당하는 작업 찾기
 */
export function findTasksByContractor(tasks: Task[], contractorId: string): Task[] {
  return tasks.filter(task => 
    task.vendor && 
    (task.vendor.name === contractorId || task.vendor.contact === contractorId)
  )
}

/**
 * 의존성이 있는 작업 찾기
 */
export function findDependentTasks(tasks: Task[], taskId: string): Task[] {
  return tasks.filter(task => task.dependencies.includes(taskId))
}

/**
 * 작업 카테고리별 그룹화
 */
export function groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}
  
  tasks.forEach(task => {
    if (!grouped[task.type]) {
      grouped[task.type] = []
    }
    grouped[task.type].push(task)
  })
  
  return grouped
}

/**
 * 작업 검색
 */
export function searchTasks(
  tasks: Task[], 
  query: string, 
  searchFields: ('name' | 'id' | 'type')[] = ['name']
): Task[] {
  const lowerQuery = query.toLowerCase()
  
  return tasks.filter(task => 
    searchFields.some(field => 
      task[field].toLowerCase().includes(lowerQuery)
    )
  )
}

/**
 * 작업 진행률 계산
 */
export function calculateTaskProgress(task: Task): number {
  if (!task.startDate || !task.endDate) return 0
  
  const now = new Date()
  const start = new Date(task.startDate)
  const end = new Date(task.endDate)
  
  if (now < start) return 0
  if (now > end) return 100
  
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  
  return Math.round((elapsed / total) * 100)
}