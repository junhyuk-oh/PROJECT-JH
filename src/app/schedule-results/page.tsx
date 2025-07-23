'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProject } from '@/lib/taskDatabase'
import { Task } from '@/lib/types'
import Link from 'next/link'

interface ScheduleData {
  schedule: Task[]
  criticalPath: string[]
  totalDuration: number
}

interface Project {
  id: string
  name: string
  type: string
  startDate: Date
  budget: number
  area: number
  currentState: string
  specificRequirements: string
  schedule: ScheduleData
  createdAt: string
}

function ScheduleResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProject = useCallback(async () => {
    try {
      const projectData = await getProject(projectId!)
      if (!projectData) {
        router.push('/')
        return
      }
      setProject(projectData)
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => {
    if (!projectId) {
      router.push('/')
      return
    }

    loadProject()
  }, [projectId, router, loadProject])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">일정을 생성하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  const getTaskTypeColor = (type: string) => {
    const colors = {
      demolition: 'bg-red-100 text-red-700',
      construction: 'bg-blue-100 text-blue-700',
      electrical: 'bg-yellow-100 text-yellow-700',
      plumbing: 'bg-green-100 text-green-700',
      finishing: 'bg-purple-100 text-purple-700',
      inspection: 'bg-gray-100 text-gray-700',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const criticalTasks = project.schedule.schedule.filter(task => 
    project.schedule.criticalPath.includes(task.id)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">일정 생성 완료</h1>
          <p className="text-gray-600">
            CPM 알고리즘을 통해 최적화된 프로젝트 일정이 생성되었습니다.
          </p>
        </div>

        {/* 프로젝트 요약 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{project.name}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">프로젝트 타입</p>
              <p className="font-medium text-gray-900">
                {project.type === 'residential' ? '주거공간' :
                 project.type === 'bathroom' ? '욕실' :
                 project.type === 'kitchen' ? '주방' : '상업공간'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">예산</p>
              <p className="font-medium text-gray-900">{formatBudget(project.budget)}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">공간 크기</p>
              <p className="font-medium text-gray-900">{project.area}평</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">총 공사 기간</p>
              <p className="font-medium text-gray-900">{project.schedule.totalDuration}일</p>
            </div>
          </div>

          {project.specificRequirements && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">특별 요구사항</p>
              <p className="mt-1 text-gray-900">{project.specificRequirements}</p>
            </div>
          )}
        </div>

        {/* 크리티컬 패스 */}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">
            크리티컬 패스 (Critical Path)
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            아래 작업들은 프로젝트 전체 일정에 직접적인 영향을 미치는 중요 작업입니다.
          </p>
          <div className="space-y-2">
            {criticalTasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.name}</p>
                  <p className="text-sm text-gray-600">
                    {task.startDate ? formatDate(task.startDate) : 'TBD'} - {task.endDate ? formatDate(task.endDate) : 'TBD'} ({task.duration}일)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 일정 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 작업 일정</h3>
          
          <div className="space-y-3">
            {project.schedule.schedule.map((task) => {
              const isCritical = project.schedule.criticalPath.includes(task.id)
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border ${
                    isCritical ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </span>
                        {isCritical && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            크리티컬
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.name} 작업</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{task.startDate ? formatDate(task.startDate) : 'TBD'} - {task.endDate ? formatDate(task.endDate) : 'TBD'}</span>
                        <span>{task.duration}일</span>
                        {task.dependencies.length > 0 && (
                          <span>선행: {task.dependencies.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Link
            href="/gantt"
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium text-center hover:bg-blue-600 transition-colors"
          >
            간트 차트 보기
          </Link>
          <Link
            href="/"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ScheduleResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ScheduleResultsContent />
    </Suspense>
  )
}