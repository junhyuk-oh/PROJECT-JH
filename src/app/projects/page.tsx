'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'

// Hooks
import { useProjects } from '@/hooks'
import { useProjectFilters } from '@/hooks/useProjectFilters'

// Components
import { LoadingSpinner, ErrorMessage } from '@/components/common'
import { ProjectCard, FilterButton, ProjectEmptyState } from '@/components/projects'

// Types
import { ProjectFilter } from '@/types'

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, loading, error, reload } = useProjects()
  const { filter, filteredProjects, projectCounts, updateFilter } = useProjectFilters(projects)

  if (loading) {
    return <LoadingSpinner fullScreen message="프로젝트를 불러오는 중..." />
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={reload} fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <Header router={router} />

      {/* Filter tabs */}
      <FilterTabs 
        filter={filter}
        counts={projectCounts}
        onFilterChange={updateFilter}
      />

      {/* Project list */}
      <div className="p-4">
        {filteredProjects.length === 0 ? (
          <ProjectEmptyState filter={filter} />
        ) : (
          <ProjectList projects={filteredProjects} />
        )}
      </div>
    </div>
  )
}

// Sub-components
const Header = React.memo(function Header({ router }: { router: any }) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">프로젝트</h1>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </Link>
        </div>
      </div>
    </div>
  )
})

interface FilterTabsProps {
  filter: ProjectFilter
  counts: {
    total: number
    active: number
    completed: number
  }
  onFilterChange: (filter: ProjectFilter) => void
}

const FilterTabs = React.memo(function FilterTabs({ filter, counts, onFilterChange }: FilterTabsProps) {
  return (
    <div className="px-4 pb-3 bg-white border-b border-gray-200">
      <div className="flex gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => onFilterChange('all')}
          count={counts.total}
          label="전체"
        />
        <FilterButton
          active={filter === 'in-progress'}
          onClick={() => onFilterChange('in-progress')}
          count={counts.active}
          label="진행 중"
        />
        <FilterButton
          active={filter === 'completed'}
          onClick={() => onFilterChange('completed')}
          count={counts.completed}
          label="완료"
        />
      </div>
    </div>
  )
})

const ProjectList = React.memo(function ProjectList({ projects }: { projects: any[] }) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
})