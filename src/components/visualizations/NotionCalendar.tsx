'use client'

import React, { useState, useMemo } from 'react'
import { Task } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  TASK_ICONS, 
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS 
} from '@/lib/constants/calendar'

interface NotionCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

export function NotionCalendar({ tasks, onTaskClick }: NotionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  // 월의 모든 날짜 가져오기 (이전/다음 달 포함)
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: ko })
    const end = endOfWeek(endOfMonth(currentMonth), { locale: ko })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // 날짜별 작업 그룹화
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    
    tasks.forEach(task => {
      if (!task.startDate || !task.endDate) return
      
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)
      const interval = eachDayOfInterval({ start, end })
      
      interval.forEach(date => {
        const key = format(date, 'yyyy-MM-dd')
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key)!.push(task)
      })
    })
    
    return map
  }, [tasks])

  // 특정 날짜의 작업 가져오기
  const getTasksForDate = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    return tasksByDate.get(key) || []
  }

  // 작업 클릭 핸들러
  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTask(task)
    onTaskClick?.(task)
  }

  // 월 변경
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'yyyy년 M월', { locale: ko })}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              오늘
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`px-2 py-3 text-sm font-medium text-center ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {monthDays.map((date, index) => {
          const dayTasks = getTasksForDate(date)
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isCurrentDay = isToday(date)
          const dayOfWeek = date.getDay()
          
          return (
            <div
              key={date.toISOString()}
              className={`
                border-r border-b border-gray-200 p-2 min-h-[120px]
                ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                ${isCurrentDay ? 'bg-blue-50' : ''}
                ${hoveredDate && isSameDay(date, hoveredDate) ? 'bg-gray-50' : ''}
                hover:bg-gray-50 transition-colors cursor-pointer
              `}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* 날짜 */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`
                    text-sm font-medium
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${dayOfWeek === 0 ? 'text-red-600' : ''}
                    ${dayOfWeek === 6 ? 'text-blue-600' : ''}
                    ${isCurrentDay ? 'bg-blue-600 text-white px-2 py-0.5 rounded-full' : ''}
                  `}
                >
                  {format(date, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {dayTasks.length}개
                  </span>
                )}
              </div>

              {/* 작업 목록 */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task, taskIndex) => {
                  const isStart = task.startDate && isSameDay(new Date(task.startDate), date)
                  const isEnd = task.endDate && isSameDay(new Date(task.endDate), date)
                  const isCritical = task.isCritical
                  
                  return (
                    <div
                      key={`${task.id}-${taskIndex}`}
                      onClick={(e) => handleTaskClick(task, e)}
                      className={`
                        px-2 py-1 text-xs rounded-md cursor-pointer
                        transition-all hover:shadow-sm hover:scale-[1.02]
                        ${TASK_TYPE_COLORS[task.type] || 'bg-gray-100 text-gray-700'}
                        ${isCritical ? 'ring-2 ring-red-400 ring-offset-1' : ''}
                        ${selectedTask?.id === task.id ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      `}
                      style={{
                        borderRadius: isStart && !isEnd ? '6px 2px 2px 6px' : 
                                     !isStart && isEnd ? '2px 6px 6px 2px' : 
                                     '6px'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="flex-shrink-0">
                          {TASK_ICONS[task.type] || '📋'}
                        </span>
                        <span className="truncate font-medium">
                          {task.name}
                        </span>
                        {isCritical && <span className="flex-shrink-0">⭐</span>}
                      </div>
                      {task.progress !== undefined && (
                        <div className="mt-1 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white/70 transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{dayTasks.length - 3} 더보기
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 하단 범례 */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-100 ring-2 ring-red-400"></div>
              <span className="text-gray-600">임계경로</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 bg-gray-400"></div>
              <span className="text-gray-600">진행률</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            작업을 클릭하면 상세 정보를 볼 수 있습니다
          </div>
        </div>
      </div>

      {/* 선택된 작업 정보 (옵션) */}
      {selectedTask && (
        <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{TASK_ICONS[selectedTask.type]}</span>
                <h3 className="font-semibold text-gray-900">{selectedTask.name}</h3>
                {selectedTask.isCritical && <span className="text-sm">⭐ 임계경로</span>}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>종류: {TASK_TYPE_LABELS[selectedTask.type]}</div>
                <div>기간: {selectedTask.duration}일</div>
                {selectedTask.startDate && selectedTask.endDate && (
                  <div>
                    일정: {format(new Date(selectedTask.startDate), 'M/d')} - {format(new Date(selectedTask.endDate), 'M/d')}
                  </div>
                )}
                {selectedTask.progress !== undefined && (
                  <div>진행률: {selectedTask.progress}%</div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}