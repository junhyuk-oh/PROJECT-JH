'use client'

import { useRouter } from 'next/navigation'

interface CurrentProjectCardProps {
  project: {
    id: string
    name: string
    type: string
    progress: number
    daysRemaining: number
    targetDate: string
    currentPhase: string
  }
}

export default function CurrentProjectCard({ project }: CurrentProjectCardProps) {
  const router = useRouter()

  const getProjectTypeLabel = (type: string) => {
    const labels = {
      residential: '주거공간',
      bathroom: '욕실',
      kitchen: '주방',
      commercial: '상업공간',
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div 
      onClick={() => router.push(`/schedule-results?projectId=${project.id}`)}
      className="bg-white rounded-2xl p-6 shadow-notion-sm hover:shadow-notion-md transition-all cursor-pointer relative overflow-hidden"
    >
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-notion-blue-bg rounded-full -translate-y-16 translate-x-16 opacity-50" />
      
      <div className="relative">
        {/* 프로젝트 정보 */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-notion-text mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-notion-sm text-notion-text-secondary">
                {getProjectTypeLabel(project.type)}
              </span>
              <span className="text-notion-sm text-notion-text-tertiary">•</span>
              <span className="text-notion-sm text-notion-text-secondary">
                {project.currentPhase}
              </span>
            </div>
          </div>

          {/* 진행률 원형 차트 */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#F7F6F3"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#0b6e99"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - project.progress / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-notion-sm font-bold text-notion-text">
                {project.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="h-1 bg-notion-bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-notion-blue rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* 목표 날짜 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-notion-sm text-notion-text-secondary">
              목표 완료일: {project.targetDate}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-notion-sm font-medium text-notion-blue">
              {project.daysRemaining}일 남음
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}