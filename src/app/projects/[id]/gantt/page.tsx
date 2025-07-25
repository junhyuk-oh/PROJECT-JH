'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProject } from '@/lib/taskDatabase'
import { GanttChart } from '@/components/visualizations/GanttChart'
import { NotionCalendar } from '@/components/visualizations/NotionCalendar'
import { ChevronLeft, Calendar, BarChart3 } from 'lucide-react'

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

export default function ProjectGanttPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'gantt' | 'calendar'>('gantt')

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

  const getProjectTypeLabel = (type: string) => {
    const labels = {
      residential: '주거공간',
      bathroom: '욕실',
      kitchen: '주방',
      commercial: '상업공간',
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">간트차트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(projectStart.getTime() + project.schedule.totalDuration * 24 * 60 * 60 * 1000)

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
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
                <h1 className="text-xl font-semibold text-gray-900">
                  {viewMode === 'gantt' ? '간트차트' : '노션 캘린더'}
                </h1>
                <p className="text-sm text-gray-600">
                  {project.name} • {getProjectTypeLabel(project.type)}
                </p>
              </div>
            </div>
            
            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                캘린더
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === 'gantt'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                간트차트
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="flex-1 p-4">
        <div className="h-full bg-white rounded-lg shadow-sm">
          {viewMode === 'gantt' ? (
            <GanttChart
              tasks={project.schedule.schedule as any}
              startDate={projectStart}
              endDate={projectEnd}
            />
          ) : (
            <NotionCalendar
              tasks={project.schedule.schedule as any}
              onTaskClick={(task) => console.log('Task clicked:', task)}
            />
          )}
        </div>
      </div>

      {/* 모바일 최적화 안내 */}
      {viewMode === 'gantt' && (
        <div className="md:hidden fixed bottom-24 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">모바일 사용 팁</p>
          <p>화면을 좌우로 스크롤하여 전체 일정을 확인하세요</p>
        </div>
      )}
    </div>
  )
}