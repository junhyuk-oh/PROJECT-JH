'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllProjects } from '@/lib/taskDatabase'
import { ChevronLeft, Calendar, BarChart3, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils/dateUtils'
import { TASK_ICONS } from '@/lib/constants/calendar'

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

interface ProjectTask extends Task {
  projectId: string
  projectName: string
  projectType: string
}

export default function SchedulePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('week')
  const [selectedProject, setSelectedProject] = useState<string>('all')

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

  const getProjectTypeLabel = (type: string) => {
    const labels = {
      residential: '주거공간',
      bathroom: '욕실',
      kitchen: '주방',
      commercial: '상업공간',
    }
    return labels[type as keyof typeof labels] || type
  }

  // 모든 프로젝트의 작업을 하나로 합치기
  const getAllTasks = (): ProjectTask[] => {
    const allTasks: ProjectTask[] = []
    
    projects.forEach(project => {
      if (!project.schedule?.schedule) return
      
      project.schedule.schedule.forEach(task => {
        if (task.startDate) {
          allTasks.push({
            ...task,
            projectId: project.id,
            projectName: project.name,
            projectType: project.type
          })
        }
      })
    })
    
    return allTasks.sort((a, b) => 
      new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
    )
  }

  // 날짜 범위에 따른 작업 필터링
  const getTasksInRange = (start: Date, end: Date) => {
    const allTasks = getAllTasks()
    return allTasks.filter(task => {
      if (!task.startDate || !task.endDate) return false
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      return taskEnd >= start && taskStart <= end
    })
  }

  // 오늘의 작업
  const getTodayTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return getTasksInRange(today, tomorrow)
  }

  // 이번 주 작업
  const getWeekTasks = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return getTasksInRange(startOfWeek, endOfWeek)
  }

  // 이번 달 작업
  const getMonthTasks = () => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)
    
    return getTasksInRange(startOfMonth, endOfMonth)
  }

  const filteredTasks = () => {
    let tasks: ProjectTask[] = []
    
    switch (viewMode) {
      case 'today':
        tasks = getTodayTasks()
        break
      case 'week':
        tasks = getWeekTasks()
        break
      case 'month':
        tasks = getMonthTasks()
        break
    }
    
    if (selectedProject !== 'all') {
      tasks = tasks.filter(task => task.projectId === selectedProject)
    }
    
    return tasks
  }

  const activeProjects = projects.filter(project => {
    const startDate = new Date(project.startDate)
    const today = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + project.totalDuration)
    
    return today >= startDate && today <= endDate
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">일정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const tasks = filteredTasks()
  const viewModeLabel = viewMode === 'today' ? '오늘' : viewMode === 'week' ? '이번 주' : '이번 달'

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
              <h1 className="text-xl font-semibold text-gray-900">전체 일정</h1>
            </div>
            <div className="text-sm text-gray-600">
              {activeProjects.length}개 프로젝트 진행 중
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="px-4 pb-3">
          {/* 기간 필터 */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'today'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              이번 주
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              이번 달
            </button>
          </div>

          {/* 프로젝트 필터 */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedProject('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedProject === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedProject === project.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 작업 목록 */}
      <div className="p-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {viewModeLabel} 예정된 작업이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? '새 프로젝트를 만들어 일정을 관리해보세요'
                : '다른 기간을 선택해보세요'}
            </p>
            {projects.length === 0 && (
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                프로젝트 만들기
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 날짜별로 그룹화 */}
            {Object.entries(
              tasks.reduce((groups, task) => {
                const date = formatDate(new Date(task.startDate!))
                if (!groups[date]) groups[date] = []
                groups[date].push(task)
                return groups
              }, {} as Record<string, ProjectTask[]>)
            ).map(([date, dateTasks]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-600 mb-2">{date}</h3>
                <div className="space-y-2">
                  {dateTasks.map(task => (
                    <Link
                      key={`${task.projectId}-${task.id}`}
                      href={`/projects/${task.projectId}`}
                      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">{TASK_ICONS[task.type] || '📋'}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{task.name}</h4>
                            {task.isCritical && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                임계경로
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{task.projectName}</span>
                            <span className="text-gray-400">•</span>
                            <span>{getProjectTypeLabel(task.projectType)}</span>
                            <span className="text-gray-400">•</span>
                            <span>{task.duration}일</span>
                          </div>
                          {task.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>진행률</span>
                                <span>{task.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <div className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                            <Calendar className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                            <BarChart3 className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}