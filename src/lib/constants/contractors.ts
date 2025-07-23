import { Contractor } from '../types'
import { WEEKDAYS } from './index'

/**
 * 업체 데이터베이스
 */
export const contractors: Record<string, Contractor> = {
  // 철거 업체
  'demolition-1': {
    id: 'demolition-1',
    name: '한국철거',
    specialty: ['demolition', 'protection'],
    phone: '010-1234-5678',
    email: 'demolition@example.com',
    rating: 4.5,
    priceRange: 'medium',
    workingHours: '09:00-18:00',
    holidays: [WEEKDAYS.SUNDAY],
    minimumBookingDays: 3
  },
  
  // 전기 업체
  'electrical-1': {
    id: 'electrical-1',
    name: '파워전기',
    specialty: ['electrical'],
    phone: '010-2345-6789',
    email: 'power@example.com',
    rating: 4.8,
    priceRange: 'high',
    workingHours: '08:00-18:00',
    holidays: [WEEKDAYS.SUNDAY, WEEKDAYS.SATURDAY],
    minimumBookingDays: 2
  },
  
  // 수도/배관 업체
  'plumbing-1': {
    id: 'plumbing-1',
    name: '청수설비',
    specialty: ['plumbing', 'waterproofing'],
    phone: '010-3456-7890',
    email: 'plumbing@example.com',
    rating: 4.6,
    priceRange: 'medium',
    workingHours: '08:00-17:00',
    holidays: [WEEKDAYS.SUNDAY],
    minimumBookingDays: 2
  },
  
  // 타일 업체
  'tile-1': {
    id: 'tile-1',
    name: '명품타일',
    specialty: ['tile', 'flooring'],
    phone: '010-4567-8901',
    email: 'tile@example.com',
    rating: 4.9,
    priceRange: 'high',
    workingHours: '08:00-18:00',
    holidays: [WEEKDAYS.SUNDAY],
    minimumBookingDays: 3
  },
  
  // 도배/도장 업체
  'painting-1': {
    id: 'painting-1',
    name: '컬러인테리어',
    specialty: ['painting', 'wallpaper'],
    phone: '010-5678-9012',
    email: 'color@example.com',
    rating: 4.7,
    priceRange: 'medium',
    workingHours: '08:00-18:00',
    holidays: [WEEKDAYS.SUNDAY],
    minimumBookingDays: 2
  },
  
  // 목공 업체
  'carpentry-1': {
    id: 'carpentry-1',
    name: '우드마스터',
    specialty: ['carpentry', 'furniture', 'wall', 'ceiling'],
    phone: '010-6789-0123',
    email: 'wood@example.com',
    rating: 4.8,
    priceRange: 'high',
    workingHours: '08:00-18:00',
    holidays: [WEEKDAYS.SUNDAY],
    minimumBookingDays: 5
  },
  
  // 방수 전문업체
  'waterproof-1': {
    id: 'waterproof-1',
    name: '방수마스터',
    specialty: ['waterproofing', 'plumbing'],
    phone: '010-7890-1234',
    email: 'waterproof@example.com',
    rating: 4.7,
    priceRange: 'medium',
    workingHours: '08:00-18:00',
    holidays: [WEEKDAYS.SUNDAY, WEEKDAYS.SATURDAY],
    minimumBookingDays: 2,
    certifications: ['방수기능사', '건축물보수보강']
  }
}

/**
 * 작업 타입별 추천 업체 매핑
 */
export const recommendedContractors: Record<string, string[]> = {
  demolition: ['demolition-1'],
  protection: ['demolition-1'],
  electrical: ['electrical-1'],
  plumbing: ['plumbing-1'],
  waterproofing: ['waterproof-1', 'plumbing-1'],
  tile: ['tile-1'],
  flooring: ['tile-1', 'carpentry-1'],
  painting: ['painting-1'],
  wallpaper: ['painting-1'],
  carpentry: ['carpentry-1'],
  furniture: ['carpentry-1'],
  wall: ['carpentry-1'],
  ceiling: ['carpentry-1']
}

/**
 * 업체 ID로 업체 정보 조회
 */
export function getContractor(contractorId: string): Contractor | undefined {
  return contractors[contractorId]
}

/**
 * 특정 작업 타입을 수행할 수 있는 업체 목록 조회
 */
export function getContractorsBySpecialty(taskType: string): Contractor[] {
  return Object.values(contractors).filter(contractor => 
    contractor.specialty.includes(taskType as any)
  )
}

/**
 * 평점 기준으로 업체 정렬
 */
export function sortContractorsByRating(contractorList: Contractor[]): Contractor[] {
  return [...contractorList].sort((a, b) => b.rating - a.rating)
}