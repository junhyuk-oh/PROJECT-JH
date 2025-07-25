'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { format, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns'
import { ko } from 'date-fns/locale'

// Types
import { Task } from '@/types'

// Constants
import { TASK_COLORS, Z_INDEX, ANIMATION } from '@/constants'

// Utils
import { cn } from '@/lib/utils'

interface GanttChartProps {
  tasks: Task[]
  startDate: Date
  endDate: Date
  className?: string
}

// Task position type
interface TaskPosition {
  left: number
  width: number
  row: number
  x: number      // 실제 렌더링된 X 좌표
  y: number      // 실제 렌더링된 Y 좌표
  endX: number   // 작업 바 끝 X 좌표
}

// Chart dimensions
interface ChartDimensions {
  dayWidth: number
  rowHeight: number
  headerHeight: number
  leftPanelWidth: number
}

export function GanttChart({ tasks, startDate, endDate, className }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)
  const [taskPositions, setTaskPositions] = useState<Map<string, TaskPosition>>(new Map())

  // Chart dimensions
  const dimensions = useMemo<ChartDimensions>(() => ({
    dayWidth: 40 * scale,
    rowHeight: 50,
    headerHeight: 80,
    leftPanelWidth: 200
  }), [scale])

  // 시작일과 종료일 정규화
  const normalizedStartDate = useMemo(() => startOfDay(startDate), [startDate])
  const normalizedEndDate = useMemo(() => endOfDay(endDate), [endDate])
  
  const totalDays = useMemo(() => differenceInDays(normalizedEndDate, normalizedStartDate) + 1, [normalizedEndDate, normalizedStartDate])
  const chartWidth = useMemo(() => totalDays * dimensions.dayWidth, [totalDays, dimensions.dayWidth])

  // 날짜 배열 생성
  const dates = useMemo(() => 
    Array.from({ length: totalDays }, (_, i) => addDays(normalizedStartDate, i)),
    [totalDays, normalizedStartDate]
  )

  // 작업 위치 계산
  const calculateTaskPosition = useCallback((task: Task, index: number): TaskPosition => {
    const taskStart = startOfDay(new Date(task.startDate || new Date()))
    const taskEnd = endOfDay(new Date(task.endDate || new Date()))
    const startOffset = differenceInDays(taskStart, normalizedStartDate)
    const duration = differenceInDays(taskEnd, taskStart) + 1
    
    // 그리드에 정확히 맞추기 위한 계산
    const left = startOffset * dimensions.dayWidth
    const width = duration * dimensions.dayWidth
    const row = index
    
    // 실제 렌더링 좌표 계산 (바의 패딩 고려)
    const padding = 2
    const x = dimensions.leftPanelWidth + left + padding
    const y = row * dimensions.rowHeight + dimensions.rowHeight / 2
    const endX = x + width - (padding * 2)
    
    return {
      left,
      width: width - (padding * 2), // 양쪽 패딩
      row,
      x,
      y,
      endX
    }
  }, [normalizedStartDate, dimensions])

  // 의존성 선 그리기를 위한 경로 계산
  const getDependencyPath = useCallback((fromTaskId: string, toTaskId: string, index: number): string => {
    const fromPos = taskPositions.get(fromTaskId)
    const toPos = taskPositions.get(toTaskId)
    
    if (!fromPos || !toPos) return ''
    
    // 저장된 실제 좌표 사용
    const fromX = fromPos.endX
    const fromY = fromPos.y
    const toX = toPos.x
    const toY = toPos.y
    
    // 여러 선이 겹치지 않도록 offset 추가
    const verticalOffset = (index % 3) * 10 - 10
    const horizontalOffset = 20 + (index % 2) * 15
    
    if (fromY === toY) {
      // 같은 행의 작업
      const midY = fromY - 25 - verticalOffset
      return `M ${fromX} ${fromY} L ${fromX + 10} ${fromY} L ${fromX + 10} ${midY} L ${toX - 10} ${midY} L ${toX - 10} ${toY} L ${toX} ${toY}`
    } else if (fromY < toY) {
      // 아래로 향하는 의존성
      const midX = Math.max(fromX + horizontalOffset, (fromX + toX) / 2)
      return `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`
    } else {
      // 위로 향하는 의존성
      const midX = Math.max(fromX + horizontalOffset, (fromX + toX) / 2)
      return `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`
    }
  }, [taskPositions])

  // 작업 클릭/호버 핸들러
  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTask(current => current === taskId ? null : taskId)
  }, [])

  const handleTaskHover = useCallback((taskId: string | null) => {
    setHoveredTask(taskId)
  }, [])

  // 줌 핸들러
  const handleZoom = useCallback((delta: number) => {
    const newScale = Math.max(0.5, Math.min(2, scale + delta))
    setScale(newScale)
  }, [scale])


  // 터치 이벤트를 위한 패시브 리스너 추가
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        handleZoom(e.deltaY < 0 ? 0.1 : -0.1)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [scale, handleZoom])

  // 작업 위치 업데이트
  useEffect(() => {
    const positions = new Map<string, TaskPosition>()
    tasks.forEach((task, index) => {
      positions.set(task.id, calculateTaskPosition(task, index))
    })
    setTaskPositions(positions)
  }, [tasks, calculateTaskPosition])

  // 작업이 하이라이트되어야 하는지 확인
  const isTaskHighlighted = useCallback((taskId: string): boolean => {
    if (!hoveredTask && !selectedTask) return false
    
    const activeTaskId = hoveredTask || selectedTask
    if (activeTaskId === taskId) return true
    
    // 의존관계가 있는 작업도 하이라이트
    const activeTask = tasks.find(t => t.id === activeTaskId)
    if (!activeTask) return false
    
    // 현재 작업이 의존하는 작업인지 확인
    if (activeTask.dependencies.includes(taskId)) return true
    
    // 현재 작업에 의존하는 작업인지 확인
    const dependentTask = tasks.find(t => t.id === taskId)
    return dependentTask && activeTaskId ? dependentTask.dependencies.includes(activeTaskId) : false
  }, [hoveredTask, selectedTask, tasks])

  // 작업 상태별 색상
  const getTaskColor = useCallback((task: Task): string => {
    if (task.isCritical) return TASK_COLORS.critical
    if (task.progress === 100) return TASK_COLORS.completed
    if (task.progress && task.progress > 0) return TASK_COLORS.inProgress
    return TASK_COLORS.pending
  }, [])


  return (
    <div className={cn(
      "relative h-full bg-white rounded-lg shadow-sm overflow-hidden",
      className
    )}>
      {/* 컨트롤 패널 */}
      <div 
        className="absolute top-4 right-4 flex flex-col gap-2"
        style={{ zIndex: Z_INDEX.sticky }}
      >
        {/* 줌 컨트롤 */}
        <div className="flex gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200">
          <button
            onClick={() => handleZoom(0.1)}
            className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
            title="확대"
          >
            <span className="text-gray-600">+</span>
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
            title="축소"
          >
            <span className="text-gray-600">-</span>
          </button>
          <button
            onClick={() => setScale(1)}
            className="px-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
            title="원래 크기"
          >
            100%
          </button>
        </div>
        
      </div>

      {/* 네비게이션 화살표 */}
      <div 
        className="absolute top-1/2 left-2 transform -translate-y-1/2"
        style={{ zIndex: Z_INDEX.sticky }}
      >
        <button
          onClick={() => {
            const container = containerRef.current
            if (container) container.scrollLeft -= 200
          }}
          className="w-10 h-10 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md transition-colors"
          style={{ transitionDuration: `${ANIMATION.duration.fast}ms` }}
          title="왼쪽으로 이동"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div 
        className="absolute top-1/2 right-2 transform -translate-y-1/2"
        style={{ zIndex: Z_INDEX.sticky }}
      >
        <button
          onClick={() => {
            const container = containerRef.current
            if (container) container.scrollLeft += 200
          }}
          className="w-10 h-10 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md transition-colors"
          style={{ transitionDuration: `${ANIMATION.duration.fast}ms` }}
          title="오른쪽으로 이동"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full overflow-auto"
        onClick={() => setSelectedTask(null)}
      >
        {/* 고정 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex">
            {/* 작업명 헤더 */}
            <div 
              className="sticky left-0 z-20 bg-white border-r border-gray-200" 
              style={{ width: dimensions.leftPanelWidth, height: dimensions.headerHeight }}
            >
              <div className="h-full px-4 flex items-center">
                <span className="font-semibold text-gray-700">작업명</span>
              </div>
            </div>
            
            {/* 날짜 헤더 */}
            <div className="relative" style={{ width: chartWidth }}>
              <div className="flex" style={{ height: dimensions.headerHeight }}>
                {dates.map((date, i) => (
                  <div
                    key={i}
                    className="border-r border-gray-200 flex flex-col justify-center items-center relative"
                    style={{ width: dimensions.dayWidth }}
                  >
                    <span className="text-xs text-gray-500 font-medium">
                      {format(date, 'MM/dd', { locale: ko })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(date, 'EEE', { locale: ko })}
                    </span>
                    {/* 디버깅용 일수 표시 */}
                    <span className="text-[10px] text-gray-300 absolute bottom-1">
                      D{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 간트 차트 본문 */}
        <div className="relative">
          {/* 그리드 배경 */}
          <svg
            className="absolute inset-0"
            width={dimensions.leftPanelWidth + chartWidth}
            height={tasks.length * dimensions.rowHeight}
          >
            {/* 세로 그리드 라인 */}
            {dates.map((_, i) => (
              <line
                key={i}
                x1={dimensions.leftPanelWidth + i * dimensions.dayWidth}
                y1={0}
                x2={dimensions.leftPanelWidth + i * dimensions.dayWidth}
                y2={tasks.length * dimensions.rowHeight}
                stroke={i % 7 === 0 ? "#d1d5db" : "#e5e7eb"}
                strokeWidth={i % 7 === 0 ? "2" : "1"}
                strokeDasharray={i % 7 === 0 ? "0" : "2,2"}
              />
            ))}
            
            {/* 가로 그리드 라인 */}
            {tasks.map((_, i) => (
              <line
                key={i}
                x1={dimensions.leftPanelWidth}
                y1={(i + 1) * dimensions.rowHeight}
                x2={dimensions.leftPanelWidth + chartWidth}
                y2={(i + 1) * dimensions.rowHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* 작업 행 */}
          {tasks.map((task, index) => {
            const position = taskPositions.get(task.id)
            if (!position) return null
            
            return (
              <div key={task.id} className="flex">
                {/* 작업명 */}
                <div
                  className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 flex items-center"
                  style={{ width: dimensions.leftPanelWidth, height: dimensions.rowHeight }}
                >
                  <span className="text-sm text-gray-700 truncate">{task.name}</span>
                </div>
                
                {/* 작업 바 */}
                <div
                  className="relative"
                  style={{ width: chartWidth, height: dimensions.rowHeight }}
                >
                  <div
                    className="absolute rounded-md shadow-sm flex items-center px-2 text-white text-xs font-medium transition-all hover:shadow-md cursor-pointer"
                    style={{
                      left: position.left + 2,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: position.width,
                      height: dimensions.rowHeight - 20,
                      backgroundColor: getTaskColor(task),
                      opacity: hoveredTask && !isTaskHighlighted(task.id) ? 0.3 : 1,
                      border: selectedTask === task.id ? '2px solid #1F2937' : 'none',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={() => handleTaskHover(task.id)}
                    onMouseLeave={() => handleTaskHover(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTaskClick(task.id)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate flex-1">{task.name}</span>
                      {task.progress !== undefined && (
                        <span className="ml-2 font-bold whitespace-nowrap">{task.progress}%</span>
                      )}
                    </div>
                    {/* 디버깅용 날짜 표시 */}
                    <div className="absolute -bottom-4 left-0 text-[10px] text-gray-500 whitespace-nowrap">
                      {format(new Date(task.startDate!), 'MM/dd')} - {format(new Date(task.endDate!), 'MM/dd')}
                    </div>
                  </div>
                  {/* 진행률 바 */}
                  {task.progress !== undefined && task.progress > 0 && task.progress < 100 && (
                    <div
                      className="absolute h-1 bg-white/30 rounded"
                      style={{
                        left: position.left + 2,
                        bottom: '15%',
                        width: position.width * (task.progress / 100)
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}

          {/* 의존성 화살표 */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={dimensions.leftPanelWidth + chartWidth}
            height={tasks.length * dimensions.rowHeight}
          >
            {tasks.map((task, taskIndex) => 
              task.dependencies?.map((depId, depIndex) => {
                const fromTask = tasks.find(t => t.id === depId)
                if (!fromTask) return null
                
                const isHighlighted = (hoveredTask || selectedTask) && 
                  (isTaskHighlighted(task.id) || isTaskHighlighted(fromTask.id))
                
                return (
                  <g key={`${depId}-${task.id}`}>
                    <path
                      d={getDependencyPath(fromTask.id, task.id, taskIndex * 10 + depIndex)}
                      fill="none"
                      stroke={isHighlighted ? '#DC2626' : '#9CA3AF'}
                      strokeWidth={isHighlighted ? "3" : "2"}
                      strokeDasharray={task.isCritical && fromTask.isCritical ? "0" : "5,5"}
                      opacity={hoveredTask && !isHighlighted ? 0.2 : 1}
                      markerEnd={`url(#arrowhead-${isHighlighted ? 'highlight' : 'normal'})`}
                    />
                    {/* 의존성 레이블 */}
                    {isHighlighted && (() => {
                      const fromPos = taskPositions.get(fromTask.id)
                      const toPos = taskPositions.get(task.id)
                      if (!fromPos || !toPos) return null
                      return (
                        <text
                          x={(fromPos.endX + toPos.x) / 2}
                          y={Math.min(fromPos.y, toPos.y) - 10}
                          textAnchor="middle"
                          className="fill-red-600 text-xs font-medium"
                        >
                          의존관계
                        </text>
                      )
                    })()}
                  </g>
                )
              })
            )}
            
            {/* 화살표 마커 정의 */}
            <defs>
              <marker
                id="arrowhead-normal"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#9CA3AF"
                />
              </marker>
              <marker
                id="arrowhead-highlight"
                markerWidth="12"
                markerHeight="9"
                refX="11"
                refY="4.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 12 4.5, 0 9"
                  fill="#DC2626"
                />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* 범례 및 안내 */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <div className="space-y-2">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
              <span>임계경로</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
              <span>예정</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
              <span>진행중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
              <span>완료</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
              <span>실선: 임계경로 의존성</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
              <span>점선: 일반 의존성</span>
            </div>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="text-xs font-semibold text-gray-700 mb-1">조작 방법</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• 작업 클릭: 의존관계 보기</div>
              <div>• 좌우 화살표 버튼: 화면 이동</div>
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd> + 스크롤: 확대/축소</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}