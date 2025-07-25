'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

// Hooks
import { useProjectForm } from '@/hooks'

// Components
import { LoadingSpinner } from '@/components/common'
import { 
  ProjectInfoSection, 
  SpaceInfoSection, 
  RiskAssessmentSection 
} from '@/components/create'

// Main component
export default function CreateProject() {
  const router = useRouter()
  const {
    formData,
    isLoading,
    showRiskAssessment,
    updateFormData,
    toggleRiskAssessment,
    handleSubmit,
  } = useProjectForm()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Header />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로젝트 정보 섹션 */}
          <ProjectInfoSection 
            formData={formData}
            updateFormData={updateFormData}
          />

          {/* 공간 정보 섹션 */}
          <SpaceInfoSection
            formData={formData}
            updateFormData={updateFormData}
          />

          {/* 리스크 평가 섹션 */}
          <RiskAssessmentSection
            formData={formData}
            showRiskAssessment={showRiskAssessment}
            updateFormData={updateFormData}
            toggleRiskAssessment={toggleRiskAssessment}
          />

          {/* 제출 버튼 */}
          <ActionButtons
            isLoading={isLoading}
            onCancel={() => router.back()}
          />
        </form>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <LoadingSpinner message="프로젝트를 생성하는 중..." />
        </div>
      )}
    </div>
  )
}

// Sub-components
const Header = React.memo(function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">새 프로젝트 만들기</h1>
      <p className="mt-2 text-gray-600">
        인테리어 프로젝트의 정보를 입력하면 AI가 최적의 일정을 생성해드립니다.
      </p>
    </div>
  )
})

const ActionButtons = React.memo(function ActionButtons({
  isLoading,
  onCancel
}: {
  isLoading: boolean
  onCancel: () => void
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onCancel}
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
  )
})