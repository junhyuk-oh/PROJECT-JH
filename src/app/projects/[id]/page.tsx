'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/taskDatabase'
import { ChevronLeft, Calendar, BarChart3, Edit, Trash2, Clock, Home, Users, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils/dateUtils'
import { TASK_TYPE_LABELS, TASK_ICONS } from '@/lib/constants/calendar'
import { RiskDashboard } from '@/components/RiskDashboard'

interface ScheduleData {
  schedule: Task[]
  criticalPath: string[]
  totalDuration: number
}

interface Task {
  id: string
  name: string
  type: string
  duration: number
  startDate?: Date
  endDate?: Date
  dependencies: string[]
  resources?: string[]
  progress?: number
  isCritical?: boolean
}

interface Project {
  id: string
  name: string
  type: string
  startDate: Date
  budget: number
  area: number
  currentState: string
  totalDuration: number
  schedule: ScheduleData
  createdAt: string
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'tasks'>('overview')

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      const loadedProject = await getProject(projectId)
      if (loadedProject) {
        setProject(loadedProject)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
      router.push('/projects')
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

  const getProjectStatus = () => {
    if (!project) return null
    
    const startDate = new Date(project.startDate)
    const today = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + project.schedule.totalDuration)

    if (today < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { 
        label: '시작 예정', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        detail: `${daysUntilStart}일 후 시작`
      }
    } else if (today > endDate) {
      return { 
        label: '완료', 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        detail: '프로젝트 완료'
      }
    } else {
      const progress = Math.round(((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)
      return { 
        label: '진행 중', 
        color: 'bg-green-100 text-green-700 border-green-200',
        detail: `${progress}% 완료`
      }
    }
  }

  const getUpcomingTasks = () => {
    if (!project) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return project.schedule.schedule.filter(task => {
      if (!task.startDate) return false
      const taskStart = new Date(task.startDate)
      taskStart.setHours(0, 0, 0, 0)
      return taskStart >= today && taskStart <= nextWeek
    }).sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
  }

  const getInProgressTasks = () => {
    if (!project) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return project.schedule.schedule.filter(task => {
      if (!task.startDate || !task.endDate) return false
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      taskStart.setHours(0, 0, 0, 0)
      taskEnd.setHours(0, 0, 0, 0)
      return taskStart <= today && taskEnd >= today
    })
  }

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

  if (!project) {
    return null
  }

  const status = getProjectStatus()
  const upcomingTasks = getUpcomingTasks()
  const inProgressTasks = getInProgressTasks()

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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-600">{getProjectTypeLabel(project.type)} • {project.area}평</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="px-4">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              개요
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'schedule'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              일정
              {activeTab === 'schedule' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'tasks'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              작업 목록
              {activeTab === 'tasks' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* 상태 카드 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">프로젝트 현황</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status?.color}`}>
                  {status?.label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">시작일</p>
                  <p className="font-medium">{formatDate(new Date(project.startDate))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">완료 예정일</p>
                  <p className="font-medium">
                    {formatDate(new Date(new Date(project.startDate).getTime() + project.schedule.totalDuration * 24 * 60 * 60 * 1000))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">예산</p>
                  <p className="font-medium">{formatBudget(project.budget)}원</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">진행률</p>
                  <p className="font-medium">{status?.detail}</p>
                </div>
              </div>
            </div>

            {/* 진행 중인 작업 */}
            {inProgressTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">진행 중인 작업</h2>
                <div className="space-y-2">
                  {inProgressTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-lg">{TASK_ICONS[task.type] || '📋'}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.name}</p>
                        <p className="text-sm text-gray-600">
                          {task.duration}일 • {task.progress || 0}% 완료
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 다가오는 작업 */}
            {upcomingTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">다가오는 작업</h2>
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-lg">{TASK_ICONS[task.type] || '📋'}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(new Date(task.startDate!))} 시작 • {task.duration}일
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 리스크 대시보드 */}
            <RiskDashboard 
              tasks={project.schedule.schedule}
              projectStartDate={new Date(project.startDate)}
            />

            {/* 빠른 액션 */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/projects/${project.id}/calendar`}
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">캘린더 보기</span>
              </Link>
              <Link
                href={`/projects/${project.id}/gantt`}
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">간트차트 보기</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">전체 일정</h2>
              <div className="flex gap-2">
                <Link
                  href={`/projects/${project.id}/calendar`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  캘린더
                </Link>
                <Link
                  href={`/projects/${project.id}/gantt`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  간트차트
                </Link>
              </div>
            </div>
            
            <div className="space-y-2">
              {project.schedule.schedule.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    task.isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{TASK_ICONS[task.type] || '📋'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{task.name}</p>
                      {task.isCritical && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          임계경로
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {task.startDate && task.endDate
                        ? `${formatDate(new Date(task.startDate))} - ${formatDate(new Date(task.endDate))}`
                        : `${task.duration}일 소요`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">D{index + 1}</p>
                    {task.progress !== undefined && (
                      <p className="text-xs text-gray-600">{task.progress}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* 작업 통계 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">작업 통계</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">전체 작업</p>
                  <p className="text-2xl font-bold text-gray-900">{project.schedule.schedule.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">임계 작업</p>
                  <p className="text-2xl font-bold text-red-600">{project.schedule.criticalPath.length}</p>
                </div>
              </div>
            </div>

            {/* 작업 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">전체 작업 목록</h2>
              <div className="space-y-2">
                {project.schedule.schedule.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-1">{TASK_ICONS[task.type] || '📋'}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                            {TASK_TYPE_LABELS[task.type] || task.type}
                          </span>
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                            {task.duration}일
                          </span>
                          {task.resources && task.resources.length > 0 && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                              {task.resources.join(', ')}
                            </span>
                          )}
                          {task.dependencies.length > 0 && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                              선행: {task.dependencies.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}