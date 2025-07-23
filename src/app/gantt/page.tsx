'use client'

import { useState, useEffect } from 'react'
import { GanttChart } from '@/components/visualizations/GanttChart'
import { NotionCalendar } from '@/components/visualizations/NotionCalendar'
import { Task, ScheduleOptions, TaskType } from '@/lib/types'
import { ScheduleGenerator } from '@/lib/scheduleGenerator'
import { ChevronLeft } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { Calendar, BarChart3 } from 'lucide-react'

export default function GanttPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projectStart, setProjectStart] = useState<Date>(new Date())
  const [projectEnd, setProjectEnd] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'gantt' | 'calendar'>('gantt')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    // 주거공간 리모델링 샘플 데이터로 CPM 일정 생성
    const projectData = {
      name: '주거공간 리모델링',
      startDate: new Date(),
      tasks: [
        {
          id: '1',
          name: '설계 및 허가',
          type: 'other' as TaskType,
          duration: 14,
          dependencies: [],
          resources: ['설계사', '행정팀']
        },
        {
          id: '2',
          name: '철거 작업',
          type: 'demolition' as TaskType,
          duration: 5,
          dependencies: ['1'],
          resources: ['철거팀'],
          progress: 100
        },
        {
          id: '3',
          name: '전기 배선',
          type: 'electrical' as TaskType,
          duration: 7,
          dependencies: ['2'],
          resources: ['전기기사'],
          progress: 80
        },
        {
          id: '4',
          name: '배관 공사',
          type: 'plumbing' as TaskType,
          duration: 6,
          dependencies: ['2'],
          resources: ['배관공'],
          progress: 90
        },
        {
          id: '5',
          name: '벽체 공사',
          type: 'carpentry' as TaskType,
          duration: 8,
          dependencies: ['3', '4'],
          resources: ['목수팀'],
          progress: 50
        },
        {
          id: '6',
          name: '바닥 공사',
          type: 'flooring' as TaskType,
          duration: 5,
          dependencies: ['5'],
          resources: ['바닥시공팀'],
          progress: 20
        },
        {
          id: '7',
          name: '도장 작업',
          type: 'painting' as TaskType,
          duration: 4,
          dependencies: ['5'],
          resources: ['도장팀'],
          progress: 30
        },
        {
          id: '8',
          name: '주방 설치',
          type: 'other' as TaskType,
          duration: 3,
          dependencies: ['6', '7'],
          resources: ['주방설치팀'],
          progress: 0
        },
        {
          id: '9',
          name: '욕실 설치',
          type: 'other' as TaskType,
          duration: 3,
          dependencies: ['6', '7'],
          resources: ['욕실설치팀'],
          progress: 0
        },
        {
          id: '10',
          name: '마감 및 청소',
          type: 'cleaning' as TaskType,
          duration: 2,
          dependencies: ['8', '9'],
          resources: ['청소팀'],
          progress: 0
        },
        {
          id: '11',
          name: '타일 공사',
          type: 'tile' as TaskType,
          duration: 4,
          dependencies: ['4'],
          resources: ['타일팀'],
          progress: 70,
          isCritical: true
        },
        {
          id: '12',
          name: '도배 작업',
          type: 'wallpaper' as TaskType,
          duration: 3,
          dependencies: ['7'],
          resources: ['도배팀'],
          progress: 40
        },
        {
          id: '13',
          name: '조명 설치',
          type: 'lighting' as TaskType,
          duration: 2,
          dependencies: ['3'],
          resources: ['조명팀'],
          progress: 60
        },
        {
          id: '14',
          name: '방수 공사',
          type: 'waterproofing' as TaskType,
          duration: 3,
          dependencies: ['2'],
          resources: ['방수팀'],
          progress: 100,
          isCritical: true
        }
      ]
    }

    // 프로젝트 옵션 생성
    const options: ScheduleOptions = {
      projectType: 'residential',
      area: 25,
      budget: 50000000,
      startDate: new Date()
    }
    
    const generator = new ScheduleGenerator(projectData.tasks, options)
    const schedule = generator.generateSchedule()
    
    if (schedule && schedule.tasks.length > 0) {
      setTasks(schedule.tasks)
      setProjectStart(new Date(schedule.startDate))
      setProjectEnd(new Date(schedule.endDate))
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">일정을 계산하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
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
                {viewMode === 'gantt' ? '간트차트' : '캘린더'}
              </h1>
              <p className="text-sm text-gray-600">주거공간 리모델링 프로젝트</p>
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
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">프로젝트 기간:</span>
              <span className="font-medium text-gray-900">
                {projectStart.toLocaleDateString('ko-KR')} - {projectEnd.toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">총 작업:</span>
              <span className="font-medium text-gray-900">{tasks.length}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="flex-1 p-4">
        <div className="h-full bg-white rounded-lg shadow-sm">
          {viewMode === 'gantt' ? (
            <GanttChart
              tasks={tasks}
              startDate={projectStart}
              endDate={projectEnd}
            />
          ) : (
            <NotionCalendar
              tasks={tasks}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          )}
        </div>
      </div>

      {/* 모바일 최적화 안내 */}
      {viewMode === 'gantt' && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">모바일 사용 팁</p>
          <p>화면을 좌우로 스크롤하여 전체 일정을 확인하세요</p>
        </div>
      )}
    </div>
  )
}