import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ActionButtonsProps {
  projectId: string
}

export const ActionButtons = React.memo(function ActionButtons({ projectId }: ActionButtonsProps) {
  const router = useRouter()

  const handleSaveProject = () => {
    // 실제로는 여기서 프로젝트 저장 로직을 구현
    router.push('/projects')
  }

  return (
    <div className="mt-8 flex gap-4">
      <button
        onClick={handleSaveProject}
        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        프로젝트 저장
      </button>
      <Link
        href={`/projects/${projectId}/gantt`}
        className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-center"
      >
        간트차트 보기
      </Link>
    </div>
  )
})