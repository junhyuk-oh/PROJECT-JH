import { WEEKDAYS } from '../constants'

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 시간을 HH:mm 형식으로 포맷
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

/**
 * 날짜에 일수 추가
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 날짜에 시간 추가
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

/**
 * 주말인지 확인
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === WEEKDAYS.SATURDAY || day === WEEKDAYS.SUNDAY
}

/**
 * 평일인지 확인
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date)
}

/**
 * 다음 평일 날짜 계산
 */
export function getNextWeekday(date: Date): Date {
  const result = new Date(date)
  
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1)
  }
  
  return result
}

/**
 * 작업일 기준으로 날짜 계산 (주말 제외)
 */
export function addWorkingDays(date: Date, days: number): Date {
  const result = new Date(date)
  let daysAdded = 0
  
  while (daysAdded < days) {
    result.setDate(result.getDate() + 1)
    if (isWeekday(result)) {
      daysAdded++
    }
  }
  
  return result
}

/**
 * 두 날짜 사이의 일수 계산
 */
export function getDaysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 두 날짜 사이의 작업일수 계산 (주말 제외)
 */
export function getWorkingDaysBetween(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)
  
  while (current <= end) {
    if (isWeekday(current)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

/**
 * 특정 시간에 작업 가능한지 확인
 */
export function isWorkingHour(date: Date, workingHours: string): boolean {
  const [startTime, endTime] = workingHours.split('-')
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const currentHour = date.getHours()
  const currentMin = date.getMinutes()
  const currentTime = currentHour * 60 + currentMin
  
  const start = startHour * 60 + startMin
  const end = endHour * 60 + endMin
  
  return currentTime >= start && currentTime < end
}

/**
 * 휴일인지 확인
 */
export function isHoliday(date: Date, holidays: Date[]): boolean {
  const dateStr = formatDate(date)
  return holidays.some(holiday => formatDate(holiday) === dateStr)
}

/**
 * 한국 공휴일 확인 (간단한 버전)
 */
export function isKoreanHoliday(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // 주요 공휴일만 체크 (음력 제외)
  const holidays = [
    { month: 1, day: 1 },   // 신정
    { month: 3, day: 1 },   // 삼일절
    { month: 5, day: 5 },   // 어린이날
    { month: 6, day: 6 },   // 현충일
    { month: 8, day: 15 },  // 광복절
    { month: 10, day: 3 },  // 개천절
    { month: 10, day: 9 },  // 한글날
    { month: 12, day: 25 }  // 크리스마스
  ]
  
  return holidays.some(h => h.month === month && h.day === day)
}