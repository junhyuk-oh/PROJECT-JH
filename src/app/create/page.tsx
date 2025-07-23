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
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    type: 'residential',
    startDate: new Date(),
    budget: 0,
    area: 0,
    currentState: 'partial',
    specificRequirements: '',
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