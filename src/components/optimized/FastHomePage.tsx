'use client'

import React, { memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Hooks - React Query 제거하고 직접 로딩
import { useWindowSize } from '@/hooks/useWindowSize'

// Components - 필수만 로드
import { LoadingSpinner } from '@/components/common'

// Types
import { Project } from '@/types'

// Constants  
import { PROJECT_TYPE_LABELS } from '@/constants'

// Utils
import { formatDate, formatCurrency, cn } from '@/lib/utils'

// Lightweight project status calculation
const getProjectStatus = (project: any) => {
  return { 
    label: '진행 중', 
    color: 'text-green-600', 
    detail: '50% 완료' 
  }
}

// 메모이제이션된 컴포넌트들
const ProjectCard = memo(function ProjectCard({ 
  project, 
  onClick 
}: { 
  project: any
  onClick: () => void 
}) {
  const status = useMemo(() => getProjectStatus(project), [project])
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
          {PROJECT_TYPE_LABELS[project.type as keyof typeof PROJECT_TYPE_LABELS] || project.type}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <ProjectInfo label="상태" value={status.label} valueClassName={status.color} />
        <ProjectInfo label="진행률" value={status.detail} />
        <ProjectInfo label="예산" value={`${formatCurrency(project.budget)}원`} />
        <ProjectInfo label="면적" value={`${project.area}평`} />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {formatDate(new Date(project.startDate))} 시작
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
})

const ProjectInfo = memo(function ProjectInfo({ 
  label, 
  value, 
  valueClassName 
}: { 
  label: string
  value: string
  valueClassName?: string 
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={cn("text-gray-900", valueClassName)}>{value}</span>
    </div>
  )
})

const Header = memo(function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">SELFFIN</h1>
      <p className="text-gray-600">
        AI 기반 인테리어 프로젝트 일정 관리 시스템
      </p>
    </div>
  )
})

const EmptyProjectsView = memo(function EmptyProjectsView() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div className="text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 프로젝트가 없습니다</h3>
        <p className="text-gray-600 mb-6">첫 번째 인테리어 프로젝트를 만들어보세요</p>
        <Link
          href="/create"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          프로젝트 만들기
        </Link>
      </div>
    </div>
  )
})

// 메인 컴포넌트 - 최적화됨
export default function FastHomePage() {
  const router = useRouter()
  const { isMobile } = useWindowSize()

  // 샘플 프로젝트 데이터 (로딩 없이)
  const sampleProjects = useMemo(() => [
    {
      id: '1',
      name: '아파트 전체 리모델링',
      type: 'residential',
      startDate: new Date('2025-02-01'),
      budget: 30000000,
      area: 25,
      schedule: { totalDuration: 30 }
    }
  ], [])

  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`)
  }, [router])

  // 모바일 뷰 (단순화)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-notion-bg-secondary pb-20">
        <div className="px-5 py-6">
          <h1 className="text-2xl font-bold mb-4">SELFFIN</h1>
          <p className="text-gray-600 mb-8">빠른 인테리어 프로젝트 관리</p>
          
          <Link
            href="/create"
            className="block w-full text-center py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            새 프로젝트 만들기
          </Link>
        </div>
      </div>
    )
  }

  // 데스크톱 뷰
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />
        
        <div className="mb-8">
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 프로젝트 만들기
          </Link>
        </div>

        {sampleProjects.length === 0 ? (
          <EmptyProjectsView />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}