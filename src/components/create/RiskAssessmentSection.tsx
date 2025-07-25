import React from 'react'
import { ProjectFormData } from '@/types'
import { cn } from '@/lib/utils'

interface RiskAssessmentSectionProps {
  formData: ProjectFormData
  showRiskAssessment: boolean
  updateFormData: (updates: Partial<ProjectFormData>) => void
  toggleRiskAssessment: () => void
}

const complexityOptions = [
  { value: 'simple', label: '단순', icon: '🟢' },
  { value: 'normal', label: '보통', icon: '🟡' },
  { value: 'complex', label: '복잡', icon: '🔴' }
]

const flexibilityOptions = [
  { value: 'flexible', label: '유연', desc: '일정 조정 가능' },
  { value: 'normal', label: '보통', desc: '일부 조정 가능' },
  { value: 'strict', label: '엄격', desc: '반드시 준수' }
]

export const RiskAssessmentSection = React.memo(function RiskAssessmentSection({
  formData,
  showRiskAssessment,
  updateFormData,
  toggleRiskAssessment
}: RiskAssessmentSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        type="button"
        onClick={toggleRiskAssessment}
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
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform",
            showRiskAssessment && "rotate-180"
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showRiskAssessment && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
          <WeatherSensitivity 
            value={formData.weatherSensitivity || 50}
            onChange={(value) => updateFormData({ weatherSensitivity: value })}
          />
          
          <ComplexitySelection
            value={formData.complexity || 'normal'}
            onChange={(value) => updateFormData({ complexity: value as 'simple' | 'normal' | 'complex' })}
          />
          
          <FlexibilitySelection
            value={formData.scheduleFlexibility || 'normal'}
            onChange={(value) => updateFormData({ scheduleFlexibility: value as 'flexible' | 'normal' | 'strict' })}
          />
        </div>
      )}
    </div>
  )
})

// Sub-components
const WeatherSensitivity = React.memo(function WeatherSensitivity({
  value,
  onChange
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="pt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        날씨 민감도
      </label>
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>낮음</span>
          <span className="font-medium text-blue-600">{value}%</span>
          <span>높음</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        외부 작업이 많을수록 날씨 영향을 많이 받습니다
      </p>
    </div>
  )
})

const ComplexitySelection = React.memo(function ComplexitySelection({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        공사 복잡도
      </label>
      <div className="grid grid-cols-3 gap-2">
        {complexityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              value === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <span className="text-2xl">{option.icon}</span>
            <p className="mt-1 text-sm font-medium">{option.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
})

const FlexibilitySelection = React.memo(function FlexibilitySelection({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        일정 유연성
      </label>
      <div className="grid grid-cols-3 gap-2">
        {flexibilityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              value === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <p className="text-sm font-medium">{option.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{option.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
})