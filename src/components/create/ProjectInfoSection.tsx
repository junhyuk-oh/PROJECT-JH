import React from 'react'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import { ProjectFormData, ProjectType } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ProjectInfoSectionProps {
  formData: ProjectFormData
  updateFormData: (updates: Partial<ProjectFormData>) => void
}

const projectTypes = [
  { value: 'residential', label: '주거공간' },
  { value: 'bathroom', label: '욕실' },
  { value: 'kitchen', label: '주방' },
  { value: 'commercial', label: '상업공간' },
]

export const ProjectInfoSection = React.memo(function ProjectInfoSection({
  formData,
  updateFormData
}: ProjectInfoSectionProps) {
  return (
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
            onChange={(e) => updateFormData({ name: e.target.value })}
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
            onChange={(value) => updateFormData({ type: value as ProjectType })}
            options={projectTypes}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시작 예정일
          </label>
          <DatePicker
            value={formData.startDate}
            onChange={(date) => updateFormData({ startDate: date })}
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
              onChange={(e) => updateFormData({ budget: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5000000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
          {formData.budget > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              {formatCurrency(formData.budget)}원
            </p>
          )}
        </div>
      </div>
    </div>
  )
})