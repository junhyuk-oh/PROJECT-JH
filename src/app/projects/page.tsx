'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllProjects } from '@/lib/taskDatabase'
import { ChevronLeft, Plus, Calendar, BarChart3, Clock, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils/dateUtils'

interface Project {
  id: string
  name: string
  type: string
  startDate: Date
  budget: number
  area: number
  currentState: string
  totalDuration: number
  createdAt: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const allProjects = await getAllProjects()
      setProjects(allProjects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  const getProjectTypeLabel = (type: string) => {
    const labels = {
      residential: '주거공간',
      bathroom: '욕실',
      kitchen: '주방',
      commercial: '상업공간',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getProjectStatus = (project: Project) => {
    const startDate = new Date(project.startDate)
    const today = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + project.totalDuration)

    if (today < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { 
        label: '시작 예정', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        detail: `${daysUntilStart}일 후 시작`,
        status: 'pending'
      }
    } else if (today > endDate) {
      return { 
        label: '완료', 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        detail: '프로젝트 완료',
        status: 'completed'
      }
    } else {
      const progress = Math.round(((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)
      return { 
        label: '진행 중', 
        color: 'bg-green-100 text-green-700 border-green-200',
        detail: `${progress}% 완료`,
        status: 'active'
      }
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    const status = getProjectStatus(project).status
    return status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
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

        {/* 필터 탭 */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체 ({projects.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              진행 중 ({projects.filter(p => getProjectStatus(p).status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              완료 ({projects.filter(p => getProjectStatus(p).status === 'completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div className="p-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? '프로젝트가 없습니다' : `${filter === 'active' ? '진행 중인' : '완료된'} 프로젝트가 없습니다`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? '첫 번째 인테리어 프로젝트를 만들어보세요' : '다른 필터를 선택해보세요'}
            </p>
            {filter === 'all' && (
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                프로젝트 만들기
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const status = getProjectStatus(project)
              const progress = status.status === 'active' 
                ? Math.round(((new Date().getTime() - new Date(project.startDate).getTime()) / (project.totalDuration * 24 * 60 * 60 * 1000)) * 100)
                : status.status === 'completed' ? 100 : 0

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{getProjectTypeLabel(project.type)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{project.area}평</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* 진행률 바 */}
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(new Date(project.startDate))} 시작</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{formatBudget(project.budget)}원</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{status.detail}</span>
                    <div className="flex gap-2">
                      <div className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}