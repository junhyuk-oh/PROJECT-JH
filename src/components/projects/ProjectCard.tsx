import React from 'react'
import Link from 'next/link'
import { Clock, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { Project } from '@/types'
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from '@/constants'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { getProjectStatus, getProjectProgress } from '@/lib/projectUtils'

interface ProjectCardProps {
  project: Project
}

export const ProjectCard = React.memo(function ProjectCard({ project }: ProjectCardProps) {
  const status = getProjectStatus(project)
  const progress = getProjectProgress(project)

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">
              {PROJECT_TYPE_ICONS[project.type]} {PROJECT_TYPE_LABELS[project.type]}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{project.area}평</span>
          </div>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          status.color
        )}>
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar progress={progress} />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatDate(project.startDate)} 시작</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>{formatCurrency(project.budget)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">{status.detail}</span>
        <QuickActions />
      </div>
    </Link>
  )
})

const ProgressBar = React.memo(function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>진행률</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
})

const QuickActions = React.memo(function QuickActions() {
  return (
    <div className="flex gap-2">
      <div className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
        <Calendar className="w-4 h-4 text-gray-600" />
      </div>
      <div className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
        <BarChart3 className="w-4 h-4 text-gray-600" />
      </div>
    </div>
  )
})