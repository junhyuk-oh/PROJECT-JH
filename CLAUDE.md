# SELFFIN 프로젝트 개발 가이드라인 (윈도우 네이티브)

> 이 문서는 Claude Code가 프로젝트 작업 시 자동으로 참조하는 가이드라인입니다.
> 프로젝트 설정, 코딩 표준, 체계적 작업 프로세스를 포함합니다.

## 🚨 필수 작업 환경 설정

### 테스트 환경 설정 (필수)
```bash
# Jest 및 Testing Library 설치
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest-environment-jsdom @types/jest

# Jest 설정 파일 생성 (jest.config.js)
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### 윈도우 네이티브 프로젝트 경로 규칙
- **유일한 작업 경로**: `C:\Users\오준혁\selffin\`
- **절대 사용 금지**: WSL 경로 (`/mnt/c/` 등)
- **프로젝트 단일화**: SELFFIN 프로젝트는 오직 하나만 존재

### 윈도우 환경 설정
1. 모든 파일 수정은 `C:\Users\오준혁\selffin\`에서 수행
2. 윈도우 네이티브 Claude Code 사용
3. PowerShell 또는 Command Prompt에서 명령어 실행

---

## 🛠 개발 환경

### 기술 스택
- **Framework**: Next.js 15.4.1 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.17
- **Package Manager**: npm
- **Runtime**: Node.js (권장: 18.x 이상)

### 개발 서버 관리
```cmd
# 서버 시작 (PowerShell/CMD)
cd C:\Users\오준혁\ai-safety-saas
npm run dev

# 백그라운드 실행 (PowerShell)
Start-Process npm -ArgumentList "run", "dev" -WindowStyle Hidden

# 서버 상태 확인
curl http://localhost:3000
```

---

## 📁 프로젝트 구조
```
C:\Users\오준혁\selffin\
├── src\
│   ├── app\              # Next.js App Router
│   ├── components\       # React 컴포넌트
│   ├── lib\             # 유틸리티 함수
│   └── styles\          # 글로벌 스타일
├── public\              # 정적 파일
├── logs\                # 작업 로그
├── package.json         # 프로젝트 설정
└── tailwind.config.ts   # Tailwind 설정
```

---

## 💻 코딩 표준

### 1. TypeScript 엄격 모드
```typescript
// ✅ Good
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

// ❌ Bad
interface ButtonProps {
  onClick: any;
  children: any;
  variant?: string;
}
```

### 2. 컴포넌트 구조 표준
```typescript
// ✅ 표준 구조
"use client" // 필요한 경우만

import { useState, useEffect } from 'react'
import { ExternalComponent } from '@/components/ui'
import type { ComponentProps } from './types'

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()
  
  // 2. Derived state
  const derivedValue = useMemo(() => {}, [])
  
  // 3. Effects
  useEffect(() => {}, [])
  
  // 4. Handlers
  const handleClick = useCallback(() => {}, [])
  
  // 5. Render
  return <div>...</div>
}
```

### 3. 파일 네이밍 규칙
```
components/
├── ComponentName.tsx       // PascalCase
├── use-custom-hook.ts     // kebab-case for hooks
├── utils.ts               // lowercase for utilities
└── types.ts               // lowercase for type files
```

### 4. Import 순서
```typescript
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. 외부 라이브러리
import { format } from 'date-fns'

// 3. 내부 컴포넌트
import { Button } from '@/components/ui'

// 4. 유틸리티/상수
import { formatDate } from '@/lib/utils'

// 5. 타입
import type { User } from '@/lib/types'
```

### 5. 상태 관리 패턴
```typescript
// ✅ 의미있는 상태 그룹핑
const [formData, setFormData] = useState({
  title: '',
  description: '',
  status: 'draft'
})

// ❌ 개별 상태 남발
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [status, setStatus] = useState('draft')
```

### 6. Props 패턴
```typescript
// ✅ 구조 분해 사용
export function Card({ title, description, onClick }: CardProps) {}

// ✅ 많은 props는 객체로 그룹핑
interface FormProps {
  initialValues: FormData
  validation: ValidationRules
  onSubmit: (data: FormData) => void
}
```

### 7. 조건부 렌더링
```typescript
// ✅ 명확한 조건부 렌더링
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ 중첩된 삼항 연산자
{isLoading ? <Loading /> : error ? <Error /> : <Data />}
```

### 8. 이벤트 핸들러
```typescript
// ✅ 명확한 네이밍
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // ...
}

const handleDeleteClick = (id: string) => {
  // ...
}
```

### 9. 에러 처리
```typescript
// ✅ 구체적인 에러 처리
try {
  const data = await api.fetchData()
} catch (error) {
  if (error instanceof ApiError) {
    showNotification(error.message)
  } else {
    console.error('Unexpected error:', error)
    showNotification('예상치 못한 오류가 발생했습니다')
  }
}
```

### 10. 스타일링 규칙
```typescript
// ✅ Tailwind 클래스 순서
className="
  // 레이아웃
  flex items-center justify-between
  // 스페이싱
  p-4 mt-2
  // 크기
  w-full h-12
  // 색상
  bg-white text-gray-900
  // 테두리
  border border-gray-200 rounded-lg
  // 효과
  shadow-sm hover:shadow-md
  // 애니메이션
  transition-all duration-200
"
```

### 11. 커스텀 훅 패턴
```typescript
// ✅ 명확한 반환값
export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // 로직...
  
  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments
  }
}
```

### 12. 상수 정의
```typescript
// ✅ as const 사용
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  COMPLETED: 'completed'
} as const

export type DocumentStatus = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS]
```

### 13. 주석 사용 지침
```typescript
// ✅ 왜(Why)를 설명하는 주석
// 사용자가 실수로 두 번 클릭하는 것을 방지하기 위해 디바운스 적용
const debouncedSubmit = useMemo(
  () => debounce(handleSubmit, 1000),
  [handleSubmit]
)

// ❌ 무엇(What)을 설명하는 주석
// 버튼을 클릭하면 폼을 제출합니다
const handleClick = () => {
  submitForm()
}
```

### 14. 성능 최적화 체크리스트
- [ ] 큰 리스트는 가상화 적용
- [ ] 무거운 계산은 useMemo 사용
- [ ] 콜백 함수는 useCallback 사용
- [ ] 정적 컴포넌트는 React.memo 적용
- [ ] 이미지는 next/image 사용

### 15. 접근성 체크리스트
- [ ] 모든 인터랙티브 요소에 적절한 ARIA 라벨
- [ ] 키보드 네비게이션 지원
- [ ] 색상만으로 정보 전달 금지
- [ ] 폼 요소에 label 연결

### 16. 테스트 코드 작성 가이드 (강화)

#### 필수 테스트 패턴
```typescript
// 1. 컴포넌트 렌더링 테스트
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  // 기본 렌더링 테스트
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  // Props 테스트
  it('should display correct props', () => {
    const props = { title: 'Test Title', disabled: true }
    render(<ComponentName {...props} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  // 이벤트 핸들링 테스트
  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<ComponentName onClick={handleClick} />)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // 에러 상태 테스트
  it('should handle error states', () => {
    const props = { error: new Error('Test error') }
    render(<ComponentName {...props} />)
    
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  // 로딩 상태 테스트
  it('should show loading state', () => {
    render(<ComponentName loading={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})

// 2. 커스텀 훅 테스트
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomHook } from '@/hooks/useCustomHook'

describe('useCustomHook', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should handle data fetching', async () => {
    const { result } = renderHook(() => useCustomHook('test-id'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toBeDefined()
  })

  it('should handle errors gracefully', async () => {
    // Mock API error
    const { result } = renderHook(() => useCustomHook('error-id'))
    
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })
})

// 3. 유틸리티 함수 테스트
import { formatDate, calculateDuration } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-24')
      expect(formatDate(date)).toBe('2025년 1월 24일')
    })

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
    })
  })

  describe('calculateDuration', () => {
    it('should calculate correct duration', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-10')
      expect(calculateDuration(start, end)).toBe(9)
    })

    it('should handle edge cases', () => {
      const sameDate = new Date('2025-01-01')
      expect(calculateDuration(sameDate, sameDate)).toBe(0)
    })
  })
})
```

#### 테스트 작성 필수 규칙
1. **모든 새 함수/컴포넌트는 테스트와 함께 작성**
2. **테스트 파일명**: `ComponentName.test.tsx` 또는 `functionName.test.ts`
3. **테스트 위치**: `__tests__/` 폴더 또는 파일과 동일한 위치
4. **커버리지 목표**: 최소 80% 이상
5. **테스트 케이스**: 성공/실패/엣지케이스 모두 포함

---

## 🚀 체계적 작업 프로세스

### 📋 새 기능 개발 체크리스트

```markdown
### 1. 계획 단계 (10분)
- [ ] 작업 로그에 목표 기록
- [ ] 필요한 파일 구조 스케치
- [ ] 예상 소요 시간 기록

### 2. 타입 정의 (5분)
- [ ] types/index.ts에 필요한 타입 추가
- [ ] JSDoc 주석으로 타입 설명

### 3. 구현 단계 (개발 시간의 60%)
- [ ] 커스텀 훅 먼저 작성 (로직 분리)
- [ ] UI 컴포넌트 작성
- [ ] 상수는 constants/에 분리
- [ ] 유틸리티는 utils/에 분리

### 4. 최적화 단계 (20%)
- [ ] React.memo 적용 검토
- [ ] useMemo/useCallback 적용
- [ ] 번들 크기 확인

### 5. 테스트 단계 (15%) - 필수!
- [ ] 단위 테스트 작성 (함수/훅)
- [ ] 컴포넌트 테스트 작성 (렌더링/인터랙션)
- [ ] 통합 테스트 작성 (여러 컴포넌트 조합)
- [ ] 엣지 케이스 테스트 (에러 상황, 빈 데이터 등)
- [ ] 테스트 커버리지 80% 이상 확보
- [ ] `npm run test:ci` 통과 확인

### 6. 문서화 단계 (10%)
- [ ] 작업 로그 업데이트
- [ ] 컴포넌트 사용법 주석
```

### 📅 일일 작업 루틴

#### 🌅 작업 시작 시 (10분)
```bash
# 1. 최신 코드 동기화
git pull origin main

# 2. 의존성 확인 및 타입 체크
npm install
npm run typecheck

# 3. 개발 서버 시작
npm run dev

# 4. 작업 로그 확인
code logs/작업로그.md
```

#### 💻 작업 중
- 기능 단위로 커밋 (최대 2시간마다)
- 복잡한 로직은 주석 추가
- **테스트 코드 동시 작성 (필수)** 🧪
  - 함수 작성 → 즉시 테스트 작성
  - 컴포넌트 작성 → 렌더링 테스트 작성
  - 테스트 실행: `npm run test` (watch 모드)

#### 🌙 작업 종료 시 (15분)
```bash
# 1. 전체 품질 체크 (테스트 포함)
npm run check:full

# 2. 테스트 커버리지 확인
npm run test:coverage

# 3. 작업 로그 업데이트
# 4. 커밋 및 푸시
git add .
git commit -m "feat: [작업 내용]"
git push origin main
```

### 🎯 리팩토링 우선순위

1. **타입 안정성** - any 타입 제거, 명시적 타입 정의
2. **코드 중복 제거** - 공통 로직 추출, 재사용 가능한 컴포넌트화
3. **성능 최적화** - 불필요한 리렌더링 방지, 메모이제이션
4. **가독성 개선** - 복잡한 조건문 간소화, 의미있는 변수명

---

## 🔧 일반적인 문제 해결

### 개발 서버 문제 해결
1. 포트 3000 사용 중일 때: `netstat -ano | findstr :3000`으로 프로세스 확인
2. Node.js 버전 확인: `node --version` (18.x 이상 권장)
3. 캐시 정리: `npm run build` 후 `.next` 폴더 삭제

### TypeScript 에러
```cmd
# 타입 체크
npm run typecheck

# ESLint 실행
npm run lint

# 빌드 테스트
npm run build
```

### 자주 발생하는 런타임 에러와 해결책

#### 1. Hook 순서 에러
```typescript
// ❌ 문제: 조건문 안에서 Hook 사용
if (condition) {
  const [state] = useState()
}

// ✅ 해결: Hook을 최상위에서 호출
const [state] = useState()
if (condition) {
  // 로직
}
```

#### 2. 무한 리렌더링
```typescript
// ❌ 문제: 의존성 배열에 매번 새로운 객체
useEffect(() => {
  setData({})
}, [data])

// ✅ 해결: 필요한 의존성만 포함
useEffect(() => {
  setData(prev => ({ ...prev }))
}, [])
```

#### 3. 메모리 누수
```typescript
// ✅ cleanup 함수 사용
useEffect(() => {
  const timer = setTimeout(() => {}, 1000)
  return () => clearTimeout(timer)  // cleanup
}, [])
```

---

## 🗂️ Git 버전 관리 (중요!)

### Git 커밋 메시지 규칙
```bash
# 형식: <type>: <subject>

# Type 종류
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무, 패키지 매니저 설정

# 예시
feat: 프로젝트 필터링 기능 추가
fix: 간트차트 그리드 정렬 문제 수정
refactor: 캘린더 컴포넌트 분리 및 최적화
```

### 수정 작업 전 반드시 실행
```cmd
# 현재 상태 저장 (백업 생성)
git add .
git commit -m "✅ 작업 시작 전 백업: [작업내용 설명]"
```

### 수정 작업 후
```cmd
# 변경사항 확인
git status
git diff

# 성공적인 수정인 경우
git add .
git commit -m "✨ [수정내용]: [변경사항 설명]"

# 잘못된 수정인 경우 (이전 상태로 복원)
git reset --hard HEAD~1
```

### 브랜치로 안전하게 작업
```cmd
# 새 기능 개발 시 브랜치 생성
git checkout -b feature/새기능명

# 작업 완료 후 메인으로 병합
git checkout master
git merge feature/새기능명
```

### 응급 복구 명령어
```cmd
# 최근 커밋으로 되돌리기
git reset --hard HEAD~1

# 특정 파일만 복원
git checkout HEAD -- 파일경로

# 모든 변경사항 취소
git reset --hard HEAD
```

**💡 팁**: 매번 큰 수정 전에 커밋하면 언제든 되돌릴 수 있습니다!

---

## 📋 작업 로그 관리

### 작업 로그 시스템
모든 개발 작업은 `C:\Users\오준혁\selffin\logs\작업로그.md`에 기록됩니다.

### 로그 작성 시점
- **필수 기록 작업**:
  - 새로운 기능 추가
  - 버그 수정
  - 파일 구조 변경
  - 중요한 설정 변경
  - 데이터베이스 스키마 변경

### 로그 작성 방법
1. 작업 시작 시 로그에 계획 기록
2. 작업 중 중요한 변경사항 실시간 기록
3. 작업 완료 후 최종 결과 기록

### 로그 업데이트 명령어
```cmd
# PowerShell에서 로그 업데이트 확인
cd C:\Users\오준혁\ai-safety-saas
echo "로그가 업데이트되었습니다: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
```

### 작업 로그 템플릿
작업 로그 작성 시 `C:\Users\오준혁\selffin\logs\작업로그-템플릿.md` 참조

**💡 중요**: 클로드 코드가 재시작되어도 작업 내용을 추적할 수 있도록 항상 로그를 최신 상태로 유지하세요!

---

## 🔧 윈도우 특화 설정

### Node.js 설치 확인
```cmd
# Node.js 버전 확인 (18.x 이상 권장)
node --version
npm --version

# 필요시 Node.js 재설치
# https://nodejs.org에서 LTS 버전 다운로드
```

### PowerShell 실행 정책 (필요시)
```powershell
# PowerShell 스크립트 실행 허용
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 윈도우 Defender 예외 설정 (권장)
- `C:\Users\오준혁\selffin\node_modules` 폴더를 스캔 제외 목록에 추가
- 빌드 속도 향상을 위해 권장

### Git 설정 확인
```cmd
# Git 사용자 정보 확인
git config --global user.name
git config --global user.email

# 필요시 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 🌍 언어 설정
**모든 응답은 한국어로 작성합니다.**

---

## 🛠 작업 효율화 Scripts

package.json에 추가 권장:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "check": "npm run typecheck && npm run lint && npm run test:ci",
    "check:full": "npm run typecheck && npm run lint && npm run test:ci && npm run build",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:coverage": "jest --coverage --watchAll=false",
    "test:debug": "jest --detectOpenHandles --forceExit",
    "build:analyze": "ANALYZE=true next build",
    "clean": "rm -rf .next node_modules coverage",
    "fresh": "npm run clean && npm install && npm run dev",
    "pre-commit": "npm run check:full"
  }
}
```

---

## 📦 의존성 관리

### 주요 의존성
- **Next.js**: 15.4.1
- **React**: 18.x
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.4.17
- **Supabase**: 최신 버전

### 의존성 설치 및 업데이트
```cmd
# 의존성 설치
npm install

# 의존성 업데이트 확인
npm outdated

# 보안 취약점 검사
npm audit
npm audit fix
```

---

## 🚀 배포 준비

### 프로덕션 빌드
```cmd
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start
```

### 환경 변수 설정
- `.env.local` 파일에 환경별 설정 저장
- Supabase 연결 정보 등 민감한 정보 관리

**💡 중요**: 환경 변수 파일은 Git에 커밋하지 말고 `.gitignore`에 포함시키세요!

---

## 📊 프로젝트 구조 확장 가이드

### 권장 폴더 구조
```
src/
├── app/                    # Next.js 페이지
├── components/             
│   ├── common/            # 재사용 가능한 공통 컴포넌트
│   ├── [feature]/         # 기능별 컴포넌트 폴더
│   └── ui/                # 순수 UI 컴포넌트
├── hooks/                 # 커스텀 훅
├── lib/                   
│   ├── utils/            # 유틸리티 함수
│   ├── services/         # API 서비스
│   └── algorithms/       # 비즈니스 로직 (CPM 등)
├── types/                # TypeScript 타입 정의
├── constants/            # 상수 정의
├── contexts/             # React Context
├── config/              # 설정 파일
└── __tests__/           # 테스트 파일
```

### 커스텀 훅 템플릿 (확장판)
```typescript
// src/hooks/useFeatureName.ts
import { useState, useEffect, useCallback } from 'react'
import { FeatureData } from '@/types'

interface UseFeatureNameOptions {
  autoFetch?: boolean
  initialData?: FeatureData | null
}

interface UseFeatureNameReturn {
  data: FeatureData | null
  loading: boolean
  error: Error | null
  refetch: () => void
  update: (data: Partial<FeatureData>) => Promise<void>
  reset: () => void
}

export function useFeatureName(
  id?: string, 
  options: UseFeatureNameOptions = {}
): UseFeatureNameReturn {
  const { autoFetch = true, initialData = null } = options
  
  const [data, setData] = useState<FeatureData | null>(initialData)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      // API 호출 로직
      const result = await api.get(`/feature/${id}`)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [id])
  
  const update = useCallback(async (updates: Partial<FeatureData>) => {
    if (!id || !data) return
    
    try {
      setLoading(true)
      const updated = await api.patch(`/feature/${id}`, updates)
      setData(updated)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [id, data])
  
  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])
  
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [fetchData, autoFetch])
  
  return { data, loading, error, refetch: fetchData, update, reset }
}
```

---

## 📝 PR 체크리스트 (강화)

Pull Request 생성 전 **반드시** 확인:

### 🧪 테스트 관련 (필수)
- [ ] **모든 테스트 통과** (`npm run test:ci`)
- [ ] **테스트 커버리지 80% 이상** (`npm run test:coverage`)
- [ ] **새 기능에 대한 테스트 작성 완료**
- [ ] **엣지 케이스 테스트 포함**
- [ ] **에러 상황 테스트 포함**

### 🔧 코드 품질
- [ ] 타입 에러 없음 (`npm run typecheck`)
- [ ] Lint 에러 없음 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 성능 저하 없음

### 📚 문서화
- [ ] 작업 로그 업데이트
- [ ] 새 함수/컴포넌트 JSDoc 주석 추가
- [ ] PR 설명 작성 (변경사항, 테스트 방법 포함)
- [ ] 관련 이슈 링크

### ✅ 최종 체크
```bash
# 모든 검증을 한 번에 실행
npm run pre-commit

# 성공하면 PR 생성 가능! 🎉
```

### 🚫 PR 생성 금지 조건
- 테스트 실패 시
- 커버리지 80% 미만 시
- 빌드 실패 시
- 타입 에러 존재 시

---

**최종 업데이트**: 2025-01-24
**프로젝트**: SELFFIN - 반셀프 인테리어 AI 플랫폼