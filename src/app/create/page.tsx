'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import { generateSchedule } from '@/lib/scheduleGenerator'
import { saveProject } from '@/lib/taskDatabase'

interface ProjectFormData {
  name: string
  type: string
  startDate: Date
  budget: number
  area: number
  currentState: string
  specificRequirements: string
  // 리스크 평가 필드 추가
  weatherSensitivity?: number  // 0-100 (날씨 민감도)
  complexity?: string          // simple/normal/complex (공사 복잡도)
  scheduleFlexibility?: string // flexible/normal/strict (일정 유연성)
}

const projectTypes = [
  { value: 'residential', label: '주거공간' },
  { value: 'bathroom', label: '욕실' },
  { value: 'kitchen', label: '주방' },
  { value: 'commercial', label: '상업공간' },
]

const currentStates = [
  { value: 'empty', label: '빈 공간' },
  { value: 'partial', label: '부분 리모델링' },
  { value: 'full', label: '전체 리모델링' },
]

export default function CreateProject() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showRiskAssessment, setShowRiskAssessment] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    type: 'residential',
    startDate: new Date(),
    budget: 0,
    area: 0,
    currentState: 'partial',
    specificRequirements: '',
    weatherSensitivity: 50,
    complexity: 'normal',
    scheduleFlexibility: 'normal',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 프로젝트 데이터를 기반으로 일정 생성
      const schedule = generateSchedule({
        projectType: formData.type,
        area: formData.area,
        budget: formData.budget,
        startDate: formData.startDate,
        currentState: formData.currentState,
        // 리스크 평가 정보 추가
        weatherSensitivity: formData.weatherSensitivity,
        complexity: formData.complexity,
        scheduleFlexibility: formData.scheduleFlexibility,
      })

      // 프로젝트 저장
      const projectId = await saveProject({
        ...formData,
        schedule,
        createdAt: new Date(),
      })

      // 일정 결과 페이지로 이동
      router.push(`/schedule-results?projectId=${projectId}`)
    } catch (error) {
      console.error('프로젝트 생성 실패:', error)
      alert('프로젝트 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">새 프로젝트 만들기</h1>
          <p className="mt-2 text-gray-600">
            인테리어 프로젝트의 정보를 입력하면 AI가 최적의 일정을 생성해드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로젝트 정보 섹션 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 이름
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="우리집 리모델링"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 타입
                </label>
                <Select
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: value })}
                  options={projectTypes}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작 예정일
                </label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  minDate={new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예산
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    원
                  </span>
                </div>
                {formData.budget > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatBudget(formData.budget)}원
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 공간 정보 섹션 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">공간 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공간 크기
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    평
                  </span>
                </div>
                {formData.area > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    약 {Math.round(formData.area * 3.3)}㎡
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  현재 상태
                </label>
                <Select
                  value={formData.currentState}
                  onChange={(value) => setFormData({ ...formData, currentState: value })}
                  options={currentStates}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  특별 요구사항 (선택)
                </label>
                <textarea
                  value={formData.specificRequirements}
                  onChange={(e) => setFormData({ ...formData, specificRequirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="예: 아이방 우선 완성, 주방 확장 필요 등"
                />
              </div>
            </div>
          </div>

          {/* 리스크 평가 섹션 (선택사항) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setShowRiskAssessment(!showRiskAssessment)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">리스크 평가</h3>
                  <p className="text-sm text-gray-600">더 정확한 일정 예측을 위한 선택사항</p>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${showRiskAssessment ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showRiskAssessment && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    날씨 민감도
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.weatherSensitivity || 50}
                      onChange={(e) => setFormData({ ...formData, weatherSensitivity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>낮음</span>
                      <span className="font-medium text-blue-600">{formData.weatherSensitivity}%</span>
                      <span>높음</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    외부 작업이 많을수록 날씨 영향을 많이 받습니다
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공사 복잡도
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'simple', label: '단순', icon: '🟢' },
                      { value: 'normal', label: '보통', icon: '🟡' },
                      { value: 'complex', label: '복잡', icon: '🔴' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, complexity: option.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.complexity === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <p className="mt-1 text-sm font-medium">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    일정 유연성
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'flexible', label: '유연', desc: '일정 조정 가능' },
                      { value: 'normal', label: '보통', desc: '일부 조정 가능' },
                      { value: 'strict', label: '엄격', desc: '반드시 준수' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, scheduleFlexibility: option.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.scheduleFlexibility === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '생성 중...' : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}