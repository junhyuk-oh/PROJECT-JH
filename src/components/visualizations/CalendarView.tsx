"use client"

import { useState, useMemo, useCallback } from 'react'
import { Calendar } from '@/components/ui/Calendar'
import { X, Volume2, Clock, Star } from 'lucide-react'

// 통합 타입 임포트
import type { Task as ScheduledTask, TaskType } from '@/types'

// 통합 상수 임포트
import {
  TASK_ICONS,
  TASK_TYPE_LABELS,
  TASK_COLORS as TASK_TYPE_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/constants'

// 유틸리티 임포트
import { 
  groupTasksByDate, 
  getTasksForDate,
  TASK_DISPLAY,
  SPECIAL_INDICATORS 
} from '@/lib/utils/calendarUtils'
import { 
  calculateTaskStatistics, 
  getTasksByType 
} from '@/lib/utils/taskStatistics'
import { formatDate } from '@/lib/utils'

// 컴포넌트 임포트
import { TaskCard } from '@/components/TaskCard'

interface CalendarViewProps {
  tasks: ScheduledTask[]
  criticalPath?: string[]
}

// 범례 아이템 컴포넌트
interface LegendItemProps {
  icon: React.ReactNode
  label: string
  className?: string
}

function LegendItem({ icon, label, className = "" }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={className}>{icon}</span>
      <span className="text-gray-600">{label}</span>
    </div>
  )
}

// 뷰 모드 버튼 컴포넌트
interface ViewModeButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function ViewModeButton({ active, onClick, label }: ViewModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// 작업 섹션 컴포넌트
interface TaskSectionProps {
  title: string
  tasks: ScheduledTask[]
  criticalPath: string[]
  icon: string
  iconColor: string
}

function TaskSection({ title, tasks, criticalPath, icon, iconColor }: TaskSectionProps) {
  if (tasks.length === 0) return null
  
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <span className={iconColor}>{icon}</span> {title}
      </h3>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task as any} 
            isCritical={criticalPath.includes(task.id)} 
          />
        ))}
      </div>
    </div>
  )
}

type ViewModeType = 'month' | 'week'

export function CalendarView({ tasks, criticalPath = [] }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewModeType>('month')
  
  // 날짜별 작업 그룹핑
  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks])
  
  // 전체 진행률 계산
  const overallProgress = useMemo(() => {
    const stats = calculateTaskStatistics(tasks as any, 0)
    return stats.progress.overall
  }, [tasks])
  
  // 날짜 클릭 핸들러
  const handleDateClick = useCallback((date: Date) => {
    const { all } = getTasksForDate(tasksByDate, date)
    if (all.length > 0) {
      setSelectedDate(date)
      setShowModal(true)
    }
  }, [tasksByDate])
  
  // 모달 닫기
  const closeModal = useCallback(() => {
    setShowModal(false)
    setSelectedDate(null)
  }, [])
  
  // 날짜 렌더링 함수
  const renderDate = useCallback((date: Date) => {
    const { starting, ongoing, ending, all } = getTasksForDate(tasksByDate, date)
    if (all.length === 0) return null
    
    // 작업 타입별로 그룹핑
    const typeGroups = getTasksByType(all as any)
    
    // 중요 정보 체크
    const hasNoiseWork = all.some(task => task.noiseLevel === 'high')
    const hasCriticalTask = all.some(task => criticalPath.includes(task.id))
    const hasDryingTask = all.some(task => task.dryingTime && task.dryingTime > 0)
    
    return (
      <div className="space-y-1">
        {/* 작업 시작/종료 표시 */}
        <div className="flex items-center justify-between text-xs">
          {starting.length > 0 && (
            <span className="text-green-600">
              {TASK_DISPLAY.ARROW_SYMBOLS.START} {starting.length}
            </span>
          )}
          {ongoing.length > 0 && (
            <span className="text-blue-600">
              {TASK_DISPLAY.ARROW_SYMBOLS.ONGOING} {ongoing.length}
            </span>
          )}
          {ending.length > 0 && (
            <span className="text-red-600">
              {TASK_DISPLAY.ARROW_SYMBOLS.END} {ending.length}
            </span>
          )}
        </div>
        
        {/* 작업 타입 아이콘 표시 */}
        <div className="flex flex-wrap gap-0.5 justify-center">
          {Object.entries(typeGroups)
            .slice(0, TASK_DISPLAY.MAX_ICONS_PER_DATE)
            .map(([type]) => {
              const taskType = type as TaskType
              return (
                <span 
                  key={type} 
                  className="text-xs" 
                  title={TASK_TYPE_LABELS[taskType]}
                >
                  {TASK_ICONS[taskType] || '📌'}
                </span>
              )
            })}
          {Object.keys(typeGroups).length > TASK_DISPLAY.MAX_ICONS_PER_DATE && (
            <span className="text-xs text-gray-500">
              +{Object.keys(typeGroups).length - TASK_DISPLAY.MAX_ICONS_PER_DATE}
            </span>
          )}
        </div>
        
        {/* 특별 표시 */}
        <div className="flex items-center justify-center gap-1">
          {hasCriticalTask && <Star className="w-3 h-3 text-red-500" />}
          {hasNoiseWork && <Volume2 className="w-3 h-3 text-orange-500" />}
          {hasDryingTask && <Clock className="w-3 h-3 text-blue-500" />}
        </div>
      </div>
    )
  }, [tasksByDate, criticalPath])
  
  // 선택된 날짜의 작업들
  const selectedTasksData = selectedDate ? getTasksForDate(tasksByDate, selectedDate) : null
  
  return (
    <>
      <div className="w-full max-w-[600px] mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">인테리어 일정 캘린더</h1>
          
          {/* 전체 진행률 표시 */}
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">전체 공정 진행률</span>
              <span className="text-sm font-semibold text-gray-900">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          
          {/* 뷰 모드 전환 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <ViewModeButton
                active={viewMode === 'month'}
                onClick={() => setViewMode('month')}
                label="월간"
              />
              <ViewModeButton
                active={viewMode === 'week'}
                onClick={() => setViewMode('week')}
                label="주간"
              />
            </div>
          </div>
        </div>
        
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDateClick={handleDateClick}
          renderDate={renderDate}
          viewMode={viewMode}
          taskDates={tasksByDate}
        />
        
        {/* 범례 */}
        <div className="mt-4 space-y-2 bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">범례</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <LegendItem 
              icon={TASK_DISPLAY.ARROW_SYMBOLS.START} 
              label="작업 시작" 
              className="text-green-600" 
            />
            <LegendItem 
              icon={TASK_DISPLAY.ARROW_SYMBOLS.END} 
              label="작업 종료" 
              className="text-red-600" 
            />
            <LegendItem 
              icon={<Star className="w-3 h-3 text-red-500" />} 
              label="임계경로" 
            />
            <LegendItem 
              icon={<Volume2 className="w-3 h-3 text-orange-500" />} 
              label="소음작업" 
            />
            <LegendItem 
              icon={<Clock className="w-3 h-3 text-blue-500" />} 
              label="건조시간" 
            />
          </div>
        </div>
      </div>
      
      {/* 작업 상세 모달 */}
      {showModal && selectedDate && selectedTasksData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-[500px] max-h-[80vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* 작업 목록 */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {selectedTasksData.all.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  이 날짜에 등록된 작업이 없습니다.
                </p>
              ) : (
                <>
                  <TaskSection
                    title="시작하는 작업"
                    tasks={selectedTasksData.starting}
                    criticalPath={criticalPath}
                    icon={TASK_DISPLAY.ARROW_SYMBOLS.START}
                    iconColor="text-green-600"
                  />
                  
                  <TaskSection
                    title="진행중인 작업"
                    tasks={selectedTasksData.ongoing}
                    criticalPath={criticalPath}
                    icon={TASK_DISPLAY.ARROW_SYMBOLS.ONGOING}
                    iconColor="text-blue-600"
                  />
                  
                  <TaskSection
                    title="종료되는 작업"
                    tasks={selectedTasksData.ending}
                    criticalPath={criticalPath}
                    icon={TASK_DISPLAY.ARROW_SYMBOLS.END}
                    iconColor="text-red-600"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}