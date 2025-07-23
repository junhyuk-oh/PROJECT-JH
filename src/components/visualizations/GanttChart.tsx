'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Task } from '@/lib/types'
import { format, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns'
import { ko } from 'date-fns/locale'

interface GanttChartProps {
  tasks: Task[]
  startDate: Date
  endDate: Date
}

export function GanttChart({ tasks, startDate, endDate }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isPanEnabled, setIsPanEnabled] = useState(false) // Space키로 활성화

  const dayWidth = 40 * scale
  const rowHeight = 50
  const headerHeight = 80
  const leftPanelWidth = 200

  const totalDays = differenceInDays(endDate, startDate) + 1
  const chartWidth = totalDays * dayWidth

  // 날짜 배열 생성
  const dates = Array.from({ length: totalDays }, (_, i) => addDays(startDate, i))

  // 작업 위치 계산
  const getTaskPosition = (task: Task) => {
    const taskStart = startOfDay(new Date(task.startDate || new Date()))
    const taskEnd = endOfDay(new Date(task.endDate || new Date()))
    const startOffset = differenceInDays(taskStart, startDate)
    const duration = differenceInDays(taskEnd, taskStart) + 1
    
    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
      row: tasks.findIndex(t => t.id === task.id)
    }
  }

  // 의존성 선 그리기를 위한 경로 계산
  const getDependencyPath = (fromTask: Task, toTask: Task, index: number) => {
    const fromPos = getTaskPosition(fromTask)
    const toPos = getTaskPosition(toTask)
    
    const fromX = fromPos.left + fromPos.width - 5
    const fromY = headerHeight + fromPos.row * rowHeight + rowHeight / 2
    const toX = toPos.left + 5
    const toY = headerHeight + toPos.row * rowHeight + rowHeight / 2
    
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
  }

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanEnabled) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - scrollPosition.x,
      y: e.clientY - scrollPosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isPanEnabled) return
    
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    setScrollPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 줌 핸들러
  const handleZoom = useCallback((delta: number) => {
    const newScale = Math.max(0.5, Math.min(2, scale + delta))
    setScale(newScale)
  }, [scale])

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPanEnabled(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPanEnabled(false)
        setIsDragging(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

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

  // 작업 상태별 색상
  const getTaskColor = (task: Task) => {
    if (task.isCritical) return '#DC2626' // 임계경로 - 빨간색
    if (task.progress === 100) return '#10B981' // 완료 - 초록색
    if (task.progress > 0) return '#F59E0B' // 진행중 - 주황색
    return '#3B82F6' // 예정 - 파란색
  }

  // 의존성 관계 하이라이트
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const isTaskHighlighted = (taskId: string) => {
    if (!hoveredTask && !selectedTask) return false
    const activeTask = selectedTask || hoveredTask
    const task = tasks.find(t => t.id === activeTask)
    if (!task) return false
    
    return taskId === activeTask || 
           task.dependencies?.includes(taskId) || 
           tasks.some(t => t.dependencies?.includes(activeTask) && t.id === taskId)
  }

  return (
    <div className="relative h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 컨트롤 패널 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
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
        
        {/* 팬 모드 표시 */}
        {isPanEnabled && (
          <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md text-xs font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>팬 모드 활성</span>
            </div>
          </div>
        )}
      </div>

      {/* 네비게이션 화살표 */}
      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-20">
        <button
          onClick={() => {
            const container = containerRef.current
            if (container) container.scrollLeft -= 200
          }}
          className="w-10 h-10 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md"
          title="왼쪽으로 이동"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-20">
        <button
          onClick={() => {
            const container = containerRef.current
            if (container) container.scrollLeft += 200
          }}
          className="w-10 h-10 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md"
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedTask(null)}
        style={{ cursor: isPanEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* 고정 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex">
            {/* 작업명 헤더 */}
            <div className="sticky left-0 z-20 bg-white border-r border-gray-200" style={{ width: leftPanelWidth }}>
              <div className="h-20 px-4 flex items-center">
                <span className="font-semibold text-gray-700">작업명</span>
              </div>
            </div>
            
            {/* 날짜 헤더 */}
            <div className="relative" style={{ width: chartWidth }}>
              <div className="flex h-20">
                {dates.map((date, i) => (
                  <div
                    key={i}
                    className="border-r border-gray-100 flex flex-col justify-center items-center"
                    style={{ width: dayWidth }}
                  >
                    <span className="text-xs text-gray-500">
                      {format(date, 'MM/dd', { locale: ko })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(date, 'EEE', { locale: ko })}
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
            width={leftPanelWidth + chartWidth}
            height={tasks.length * rowHeight}
            style={{ transform: `translate(${scrollPosition.x}px, ${scrollPosition.y}px)` }}
          >
            {/* 세로 그리드 라인 */}
            {dates.map((_, i) => (
              <line
                key={i}
                x1={leftPanelWidth + i * dayWidth}
                y1={0}
                x2={leftPanelWidth + i * dayWidth}
                y2={tasks.length * rowHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* 가로 그리드 라인 */}
            {tasks.map((_, i) => (
              <line
                key={i}
                x1={leftPanelWidth}
                y1={(i + 1) * rowHeight}
                x2={leftPanelWidth + chartWidth}
                y2={(i + 1) * rowHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* 작업 행 */}
          {tasks.map((task, index) => {
            const position = getTaskPosition(task)
            
            return (
              <div key={task.id} className="flex">
                {/* 작업명 */}
                <div
                  className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 flex items-center"
                  style={{ width: leftPanelWidth, height: rowHeight }}
                >
                  <span className="text-sm text-gray-700 truncate">{task.name}</span>
                </div>
                
                {/* 작업 바 */}
                <div
                  className="relative"
                  style={{ width: chartWidth, height: rowHeight }}
                >
                  <div
                    className="absolute top-3 rounded-md shadow-sm flex items-center px-2 text-white text-xs font-medium transition-all hover:shadow-md cursor-pointer"
                    style={{
                      left: position.left,
                      width: position.width,
                      height: rowHeight - 24,
                      backgroundColor: getTaskColor(task),
                      opacity: hoveredTask && !isTaskHighlighted(task.id) ? 0.3 : 1,
                      transform: `translate(${scrollPosition.x}px, 0)`,
                      border: selectedTask === task.id ? '2px solid #1F2937' : 'none'
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(selectedTask === task.id ? null : task.id)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{task.name}</span>
                      {task.progress !== undefined && (
                        <span className="ml-2 font-bold">{task.progress}%</span>
                      )}
                    </div>
                  </div>
                  {/* 진행률 바 */}
                  {task.progress !== undefined && task.progress > 0 && task.progress < 100 && (
                    <div
                      className="absolute bottom-2 left-0 h-1 bg-white/30 rounded"
                      style={{
                        left: position.left,
                        width: position.width * (task.progress / 100),
                        transform: `translate(${scrollPosition.x}px, 0)`
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
            width={leftPanelWidth + chartWidth}
            height={tasks.length * rowHeight}
            style={{ transform: `translate(${scrollPosition.x}px, ${scrollPosition.y}px)` }}
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
                      d={getDependencyPath(fromTask, task, taskIndex * 10 + depIndex)}
                      fill="none"
                      stroke={isHighlighted ? '#DC2626' : '#9CA3AF'}
                      strokeWidth={isHighlighted ? "3" : "2"}
                      strokeDasharray={task.isCritical && fromTask.isCritical ? "0" : "5,5"}
                      opacity={hoveredTask && !isHighlighted ? 0.2 : 1}
                      markerEnd={`url(#arrowhead-${isHighlighted ? 'highlight' : 'normal'})`}
                    />
                    {/* 의존성 레이블 */}
                    {isHighlighted && (
                      <text
                        x={(getTaskPosition(fromTask).left + getTaskPosition(fromTask).width + getTaskPosition(task).left) / 2}
                        y={headerHeight + Math.min(getTaskPosition(fromTask).row, getTaskPosition(task).row) * rowHeight - 5}
                        textAnchor="middle"
                        className="fill-red-600 text-xs font-medium"
                      >
                        의존관계
                      </text>
                    )}
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
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> + 드래그: 화면 이동</div>
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd> + 스크롤: 확대/축소</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}