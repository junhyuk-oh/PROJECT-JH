import React from 'react'
import Select from '@/components/ui/Select'
import { ProjectFormData } from '@/types'

interface SpaceInfoSectionProps {
  formData: ProjectFormData
  updateFormData: (updates: Partial<ProjectFormData>) => void
}

const currentStates = [
  { value: 'empty', label: '빈 공간' },
  { value: 'partial', label: '부분 리모델링' },
  { value: 'full', label: '전체 리모델링' },
]

export const SpaceInfoSection = React.memo(function SpaceInfoSection({
  formData,
  updateFormData
}: SpaceInfoSectionProps) {
  return (
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
              onChange={(e) => updateFormData({ area: parseInt(e.target.value) || 0 })}
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
            onChange={(value) => updateFormData({ currentState: value })}
            options={currentStates}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            특별 요구사항 (선택)
          </label>
          <textarea
            value={formData.specificRequirements}
            onChange={(e) => updateFormData({ specificRequirements: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="예: 아이방 우선 완성, 주방 확장 필요 등"
          />
        </div>
      </div>
    </div>
  )
})