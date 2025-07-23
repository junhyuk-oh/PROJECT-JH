'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProject } from '@/lib/taskDatabase'
import { CalendarView } from '@/components/visualizations/CalendarView'
import { ChevronLeft } from 'lucide-react'

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

export default function ProjectCalendarPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

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
          <p className="mt-4 text-gray-600">캘린더를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">캘린더</h1>
              <p className="text-sm text-gray-600">
                {project.name} • {getProjectTypeLabel(project.type)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="flex-1">
        <CalendarView 
          tasks={project.schedule.schedule}
          projectStart={new Date(project.startDate)}
          projectEnd={new Date(new Date(project.startDate).getTime() + project.schedule.totalDuration * 24 * 60 * 60 * 1000)}
        />
      </div>
    </div>
  )
}