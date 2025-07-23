import { Task, Contractor, Project } from '../types'
import { DEFAULT_VALUES } from '../constants'

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 전화번호 형식 검증
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/
  return phoneRegex.test(phone)
}

/**
 * 작업 시간 형식 검증 (HH:mm-HH:mm)
 */
export function isValidWorkingHours(workingHours: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!regex.test(workingHours)) return false
  
  const [start, end] = workingHours.split('-')
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin
  
  return startTime < endTime
}

/**
 * 작업 데이터 검증
 */
export interface TaskValidationResult {
  valid: boolean
  errors: string[]
}

export function validateTask(task: Task): TaskValidationResult {
  const errors: string[] = []
  
  // 필수 필드 검증
  if (!task.id || task.id.trim() === '') {
    errors.push('작업 ID가 없습니다')
  }
  
  if (!task.name || task.name.trim() === '') {
    errors.push('작업명이 없습니다')
  }
  
  if (!task.type) {
    errors.push('작업 타입이 없습니다')
  }
  
  if (task.duration < 0) {
    errors.push('작업 기간이 음수일 수 없습니다')
  }
  
  // 선택 필드 검증
  if (task.minimumWorkers !== undefined) {
    if (task.minimumWorkers < DEFAULT_VALUES.MIN_WORKERS || 
        task.minimumWorkers > DEFAULT_VALUES.MAX_WORKERS) {
      errors.push(`최소 작업 인원은 ${DEFAULT_VALUES.MIN_WORKERS}~${DEFAULT_VALUES.MAX_WORKERS}명이어야 합니다`)
    }
  }
  
  if (task.timeConstraints?.workingHours) {
    if (!isValidWorkingHours(task.timeConstraints.workingHours)) {
      errors.push('작업 시간 형식이 올바르지 않습니다')
    }
  }
  
  if (task.costRange) {
    if (task.costRange.min < 0 || task.costRange.max < 0) {
      errors.push('비용은 음수일 수 없습니다')
    }
    if (task.costRange.min > task.costRange.max) {
      errors.push('최소 비용이 최대 비용보다 클 수 없습니다')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 업체 데이터 검증
 */
export interface ContractorValidationResult {
  valid: boolean
  errors: string[]
}

export function validateContractor(contractor: Contractor): ContractorValidationResult {
  const errors: string[] = []
  
  if (!contractor.id || contractor.id.trim() === '') {
    errors.push('업체 ID가 없습니다')
  }
  
  if (!contractor.name || contractor.name.trim() === '') {
    errors.push('업체명이 없습니다')
  }
  
  if (!isValidPhoneNumber(contractor.phone)) {
    errors.push('전화번호 형식이 올바르지 않습니다')
  }
  
  if (!isValidEmail(contractor.email)) {
    errors.push('이메일 형식이 올바르지 않습니다')
  }
  
  if (!isValidWorkingHours(contractor.workingHours)) {
    errors.push('업무 시간 형식이 올바르지 않습니다')
  }
  
  if (contractor.rating < 0 || contractor.rating > 5) {
    errors.push('평점은 0~5 사이여야 합니다')
  }
  
  if (contractor.minimumBookingDays < DEFAULT_VALUES.MIN_BOOKING_DAYS || 
      contractor.minimumBookingDays > DEFAULT_VALUES.MAX_BOOKING_DAYS) {
    errors.push(`최소 예약일은 ${DEFAULT_VALUES.MIN_BOOKING_DAYS}~${DEFAULT_VALUES.MAX_BOOKING_DAYS}일이어야 합니다`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 프로젝트 데이터 검증
 */
export interface ProjectValidationResult {
  valid: boolean
  errors: string[]
}

export function validateProject(project: Project): ProjectValidationResult {
  const errors: string[] = []
  
  if (!project.name || project.name.trim() === '') {
    errors.push('프로젝트명이 없습니다')
  }
  
  if (!project.type) {
    errors.push('프로젝트 타입이 없습니다')
  }
  
  if (project.budget < 0) {
    errors.push('예산은 음수일 수 없습니다')
  }
  
  if (project.area <= 0) {
    errors.push('면적은 0보다 커야 합니다')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 의존성 순환 참조 검사
 */
export function hasCircularDependency(tasks: Task[]): boolean {
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  
  function hasCycle(taskId: string): boolean {
    if (recursionStack.has(taskId)) return true
    if (visited.has(taskId)) return false
    
    visited.add(taskId)
    recursionStack.add(taskId)
    
    const task = taskMap.get(taskId)
    if (task) {
      for (const dep of task.dependencies) {
        if (hasCycle(dep)) return true
      }
    }
    
    recursionStack.delete(taskId)
    return false
  }
  
  for (const task of tasks) {
    if (hasCycle(task.id)) return true
  }
  
  return false
}