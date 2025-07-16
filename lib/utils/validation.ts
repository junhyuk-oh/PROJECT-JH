// 폼 유효성 검사 유틸리티

import { VALIDATION_RULES } from '@/lib/types/constants'
import { FormValidation } from '@/lib/types/ui'

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | undefined
  message?: string
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule | ValidationRule[]
}

export class FormValidator {
  private schema: ValidationSchema
  private errors: Record<string, string[]> = {}
  private touched: Record<string, boolean> = {}

  constructor(schema: ValidationSchema) {
    this.schema = schema
  }

  // 단일 필드 유효성 검사
  validateField(fieldName: string, value: any): string[] {
    const rules = this.schema[fieldName]
    if (!rules) return []

    const ruleArray = Array.isArray(rules) ? rules : [rules]
    const fieldErrors: string[] = []

    for (const rule of ruleArray) {
      const error = this.applyRule(fieldName, value, rule)
      if (error) {
        fieldErrors.push(error)
      }
    }

    this.errors[fieldName] = fieldErrors
    return fieldErrors
  }

  // 전체 폼 유효성 검사
  validateAll(values: Record<string, any>): FormValidation {
    this.errors = {}
    
    // 스키마에 정의된 모든 필드 검사
    Object.keys(this.schema).forEach(fieldName => {
      this.validateField(fieldName, values[fieldName])
    })

    const hasErrors = Object.values(this.errors).some(fieldErrors => fieldErrors.length > 0)

    return {
      isValid: !hasErrors,
      errors: this.errors,
      touched: this.touched,
      isSubmitting: false
    }
  }

  // 필드 터치 상태 설정
  setTouched(fieldName: string, touched: boolean = true): void {
    this.touched[fieldName] = touched
  }

  // 특정 필드 에러 가져오기
  getFieldErrors(fieldName: string): string[] {
    return this.errors[fieldName] || []
  }

  // 필드에 에러가 있는지 확인
  hasFieldError(fieldName: string): boolean {
    return this.getFieldErrors(fieldName).length > 0
  }

  // 에러 초기화
  clearErrors(): void {
    this.errors = {}
    this.touched = {}
  }

  // 특정 필드 에러 초기화
  clearFieldError(fieldName: string): void {
    delete this.errors[fieldName]
    delete this.touched[fieldName]
  }

  private applyRule(fieldName: string, value: any, rule: ValidationRule): string | undefined {
    // 필수 입력 검사
    if (rule.required && this.isEmpty(value)) {
      return rule.message || `${fieldName}은(는) 필수 입력 항목입니다`
    }

    // 값이 비어있고 필수가 아닌 경우 나머지 검사 생략
    if (this.isEmpty(value) && !rule.required) {
      return undefined
    }

    // 최소값 검사
    if (rule.min !== undefined && Number(value) < rule.min) {
      return rule.message || `${fieldName}은(는) ${rule.min} 이상이어야 합니다`
    }

    // 최대값 검사
    if (rule.max !== undefined && Number(value) > rule.max) {
      return rule.message || `${fieldName}은(는) ${rule.max} 이하여야 합니다`
    }

    // 최소 길이 검사
    if (rule.minLength !== undefined && String(value).length < rule.minLength) {
      return rule.message || `${fieldName}은(는) 최소 ${rule.minLength}자 이상이어야 합니다`
    }

    // 최대 길이 검사
    if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
      return rule.message || `${fieldName}은(는) 최대 ${rule.maxLength}자까지 입력 가능합니다`
    }

    // 패턴 검사
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message || `${fieldName}의 형식이 올바르지 않습니다`
    }

    // 커스텀 검사
    if (rule.custom) {
      return rule.custom(value)
    }

    return undefined
  }

  private isEmpty(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0)
  }
}

// 미리 정의된 유효성 검사 스키마들
export const validationSchemas = {
  // 프로젝트 기본 정보
  projectBasicInfo: {
    totalArea: {
      required: true,
      min: VALIDATION_RULES.totalArea.min,
      max: VALIDATION_RULES.totalArea.max,
      message: VALIDATION_RULES.totalArea.message
    },
    housingType: {
      required: true,
      message: '주택 유형을 선택해주세요'
    },
    preferredStyle: {
      required: true,
      message: '선호하는 스타일을 입력해주세요'
    },
    projectDuration: {
      required: true,
      message: VALIDATION_RULES.projectDuration.message
    }
  } as ValidationSchema,

  // 사용자 등록
  userRegistration: {
    email: {
      required: true,
      pattern: VALIDATION_RULES.email.pattern,
      message: VALIDATION_RULES.email.message
    },
    password: {
      required: true,
      minLength: VALIDATION_RULES.password.minLength,
      pattern: VALIDATION_RULES.password.pattern,
      message: VALIDATION_RULES.password.message
    },
    confirmPassword: {
      required: true,
      custom: (value: string, formData?: Record<string, any>) => {
        if (formData && value !== formData.password) {
          return '비밀번호가 일치하지 않습니다'
        }
        return undefined
      }
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: '이름은 2자 이상 50자 이하로 입력해주세요'
    },
    phone: {
      pattern: VALIDATION_RULES.phone.pattern,
      message: VALIDATION_RULES.phone.message
    }
  } as ValidationSchema,

  // 로그인
  userLogin: {
    email: {
      required: true,
      pattern: VALIDATION_RULES.email.pattern,
      message: '올바른 이메일 주소를 입력해주세요'
    },
    password: {
      required: true,
      message: '비밀번호를 입력해주세요'
    }
  } as ValidationSchema,

  // 공간 선택
  spaceSelection: {
    actualArea: {
      required: true,
      min: 1,
      max: 100,
      message: '실제 면적은 1평 이상 100평 이하로 입력해주세요'
    },
    scope: {
      required: true,
      message: '작업 범위를 선택해주세요'
    },
    priority: {
      required: true,
      min: 1,
      max: 5,
      message: '우선순위를 선택해주세요'
    }
  } as ValidationSchema
}

// 편의 함수들
export function createValidator(schema: ValidationSchema): FormValidator {
  return new FormValidator(schema)
}

export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email)
}

export function validatePassword(password: string): boolean {
  return VALIDATION_RULES.password.pattern.test(password) && 
         password.length >= VALIDATION_RULES.password.minLength
}

export function validatePhone(phone: string): boolean {
  return VALIDATION_RULES.phone.pattern.test(phone)
}

// 비동기 유효성 검사 (예: 이메일 중복 확인)
export async function validateEmailUnique(email: string): Promise<string | undefined> {
  try {
    // 실제로는 API 호출
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    
    if (data.exists) {
      return '이미 사용 중인 이메일 주소입니다'
    }
    
    return undefined
  } catch (error) {
    return '이메일 확인 중 오류가 발생했습니다'
  }
}