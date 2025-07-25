/**
 * 통합 유틸리티 함수 모음
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ============================================
// 스타일 관련 유틸리티
// ============================================

/**
 * 클래스명 조합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// 포맷팅 유틸리티
// ============================================

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * 짧은 날짜 포맷
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(d)
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value)
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// ============================================
// 날짜 계산 유틸리티
// ============================================

/**
 * 두 날짜 사이의 일수 계산
 */
export function getDaysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
 * 오늘 날짜인지 확인
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * 이번 주인지 확인
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
  return date >= weekStart && date <= weekEnd
}

/**
 * 이번 달인지 확인
 */
export function isThisMonth(date: Date): boolean {
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

// ============================================
// 문자열 유틸리티
// ============================================

/**
 * 문자열 자르기 (말줄임표 추가)
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * 첫 글자 대문자 변환
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 슬러그 생성
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '')
    .replace(/\s+/g, '-')
}

// ============================================
// 배열 유틸리티
// ============================================

/**
 * 배열을 청크로 분할
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 중복 제거
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 배열 그룹화
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) groups[group] = []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// ============================================
// 함수형 유틸리티
// ============================================

/**
 * 디바운스
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 쓰로틀
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 지연 실행
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================
// 검증 유틸리티
// ============================================

/**
 * 이메일 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 전화번호 검증
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
  return phoneRegex.test(phone)
}

/**
 * URL 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================
// 기타 유틸리티
// ============================================

/**
 * 랜덤 ID 생성
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * 색상 생성 (해시 기반)
 */
export function generateColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * 로컬스토리지 안전하게 사용
 */
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('Failed to save to localStorage')
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
    } catch {
      console.error('Failed to remove from localStorage')
    }
  }
}