import React from 'react'
import { Project } from '@/types'
import { PROJECT_TYPE_LABELS } from '@/constants'
import { formatCurrency } from '@/lib/utils'

interface ExtendedProject extends Project {
  schedule: {
    schedule: any[]
    totalDuration: number
    criticalPath: string[]
  }
  specificRequirements?: string
}

interface ProjectSummaryProps {
  project: ExtendedProject
}

export const ProjectSummary = React.memo(function ProjectSummary({ project }: ProjectSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{project.name}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryItem 
          label="프로젝트 타입" 
          value={PROJECT_TYPE_LABELS[project.type] || project.type}
        />
        <SummaryItem 
          label="예산" 
          value={`${formatCurrency(project.budget)}원`}
        />
        <SummaryItem 
          label="공간 크기" 
          value={`${project.area}평`}
        />
        <SummaryItem 
          label="총 공사 기간" 
          value={`${project.schedule.totalDuration}일`}
        />
      </div>

      {project.specificRequirements && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">특별 요구사항</p>
          <p className="mt-1 text-gray-900">{project.specificRequirements}</p>
        </div>
      )}
    </div>
  )
})

interface SummaryItemProps {
  label: string
  value: string
}

const SummaryItem = React.memo(function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  )
})