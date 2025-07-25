import React from 'react'
import { EmptyState } from '@/components/common'
import { ProjectFilter } from '@/types'

interface ProjectEmptyStateProps {
  filter: ProjectFilter
}

const messages = {
  all: {
    title: '프로젝트가 없습니다',
    description: '첫 번째 인테리어 프로젝트를 만들어보세요',
    showAction: true
  },
  'in-progress': {
    title: '진행 중인 프로젝트가 없습니다',
    description: '다른 필터를 선택해보세요',
    showAction: false
  },
  completed: {
    title: '완료된 프로젝트가 없습니다',
    description: '다른 필터를 선택해보세요',
    showAction: false
  }
}

export const ProjectEmptyState = React.memo(function ProjectEmptyState({ filter }: ProjectEmptyStateProps) {
  const message = messages[filter]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <EmptyState
        title={message.title}
        description={message.description}
        icon={
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        }
        action={message.showAction ? {
          label: '프로젝트 만들기',
          onClick: () => window.location.href = '/create'
        } : undefined}
      />
    </div>
  )
})