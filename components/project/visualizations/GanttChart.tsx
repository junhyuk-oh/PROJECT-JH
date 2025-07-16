"use client"

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, AlertTriangle, TrendingUp, Filter } from 'lucide-react'
import { GanttChartData } from '@/lib/types'
import { format, addDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns'
import { ko } from 'date-fns/locale'

interface GanttChartProps {
  data: GanttChartData
  onTaskClick?: (taskId: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<GanttChartData['tasks'][0]>) => void
}

type ViewMode = 'day' | 'week' | 'month'
type FilterMode = 'all' | 'critical' | 'space'

export default function GanttChart({ data, onTaskClick, onTaskUpdate }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedSpace, setSelectedSpace] = useState<string>('all')
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)

  // 필터링된 태스크들
  const filteredTasks = useMemo(() => {
    let filtered = data.tasks

    if (filterMode === 'critical') {
      filtered = filtered.filter(task => task.isCritical)
    } else if (filterMode === 'space' && selectedSpace !== 'all') {
      filtered = filtered.filter(task => task.space === selectedSpace)
    }

    return filtered.sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [data.tasks, filterMode, selectedSpace])

  // 고유 공간 목록
  const spaces = useMemo(() => {
    const uniqueSpaces = [...new Set(data.tasks.map(task => task.space))]
    return uniqueSpaces.sort()
  }, [data.tasks])

  // 타임라인 계산
  const timeline = useMemo(() => {
    const startDate = data.timeline.startDate
    const endDate = data.timeline.endDate
    const totalDays = differenceInDays(endDate, startDate) + 1

    const days: Date[] = []
    for (let i = 0; i < totalDays; i++) {
      days.push(addDays(startDate, i))
    }

    // 뷰 모드에 따른 단위 계산
    let timeUnits: { date: Date; label: string; isWeekend: boolean }[] = []
    
    if (viewMode === 'day') {
      timeUnits = days.map(date => ({
        date,
        label: format(date, 'MM/dd', { locale: ko }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      }))
    } else if (viewMode === 'week') {
      const weeks = new Set<string>()
      days.forEach(date => {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 })
        weeks.add(weekStart.toISOString())
      })
      
      timeUnits = Array.from(weeks)
        .map(weekStr => new Date(weekStr))
        .sort((a, b) => a.getTime() - b.getTime())
        .map(weekStart => ({
          date: weekStart,
          label: `${format(weekStart, 'MM/dd', { locale: ko })}~${format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MM/dd', { locale: ko })}`,
          isWeekend: false
        }))
    }

    return { days, timeUnits, totalDays }
  }, [data.timeline, viewMode])

  // 태스크 바 위치 계산
  const getTaskBarStyle = (task: GanttChartData['tasks'][0]) => {
    const startOffset = differenceInDays(task.start, data.timeline.startDate)
    const duration = differenceInDays(task.end, task.start) + 1
    
    const cellWidth = viewMode === 'day' ? 40 : viewMode === 'week' ? 120 : 200
    const left = startOffset * (cellWidth / (viewMode === 'week' ? 7 : 1))
    const width = duration * (cellWidth / (viewMode === 'week' ? 7 : 1))

    return {
      left: `${left}px`,
      width: `${Math.max(width, cellWidth * 0.5)}px`,
      backgroundColor: task.color,
      opacity: task.isCritical ? 1 : 0.8
    }
  }

  // 진행률 바 스타일
  const getProgressStyle = (task: GanttChartData['tasks'][0]) => {
    return {
      width: `${task.progress}%`,
      backgroundColor: task.isCritical ? '#ffffff' : 'rgba(255,255,255,0.8)'
    }
  }

  // 카테고리별 색상 및 아이콘
  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      demolition: { name: '철거', icon: '🔨', color: 'bg-red-500' },
      electrical: { name: '전기', icon: '⚡', color: 'bg-yellow-500' },
      plumbing: { name: '배관', icon: '🔧', color: 'bg-blue-500' },
      carpentry: { name: '목공', icon: '🪚', color: 'bg-purple-500' },
      painting: { name: '도장', icon: '🎨', color: 'bg-green-500' },
      flooring: { name: '바닥', icon: '🪜', color: 'bg-orange-500' },
      lighting: { name: '조명', icon: '💡', color: 'bg-yellow-400' },
      cleanup: { name: '정리', icon: '🧹', color: 'bg-gray-500' }
    }
    return categoryMap[category as keyof typeof categoryMap] || { name: category, icon: '📋', color: 'bg-gray-400' }
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {/* 헤더 및 컨트롤 */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <CardTitle className="flex items-center text-2xl">
                <Calendar className="w-6 h-6 mr-2" />
                🏗️ 인테리어 공정표
              </CardTitle>
              
              <div className="flex flex-wrap gap-3">
                {/* 뷰 모드 선택 */}
                <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">일별 보기</SelectItem>
                    <SelectItem value="week">주별 보기</SelectItem>
                  </SelectContent>
                </Select>

                {/* 필터 모드 */}
                <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 작업</SelectItem>
                    <SelectItem value="critical">중요 경로</SelectItem>
                    <SelectItem value="space">공간별</SelectItem>
                  </SelectContent>
                </Select>

                {/* 공간 선택 */}
                {filterMode === 'space' && (
                  <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 공간</SelectItem>
                      {spaces.map(space => (
                        <SelectItem key={space} value={space}>{space}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 인사이트 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">총 기간</p>
                  <p className="text-2xl font-bold text-blue-600">{data.timeline.totalDays}일</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">중요 작업</p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.tasks.filter(t => t.isCritical).length}개
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">예상 비용</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(data.tasks.reduce((sum, task) => sum + task.estimatedCost, 0) / 10000)}만원
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">복잡도</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {data.insights.complexity.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 간트차트 메인 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* 헤더 타임라인 */}
                <div className="flex border-b bg-gray-50">
                  <div className="w-64 p-3 border-r font-semibold">작업명</div>
                  <div className="flex">
                    {timeline.timeUnits.map((unit, index) => (
                      <div
                        key={index}
                        className={`p-2 text-xs text-center border-r min-w-[40px] ${
                          unit.isWeekend ? 'bg-red-50 text-red-600' : ''
                        } ${viewMode === 'week' ? 'min-w-[120px]' : ''}`}
                      >
                        {unit.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 태스크 행들 */}
                <div className="relative">
                  {filteredTasks.map((task, taskIndex) => {
                    const categoryInfo = getCategoryInfo(task.category)
                    
                    return (
                      <div key={task.id} className="flex border-b hover:bg-gray-50 group">
                        {/* 태스크 정보 열 */}
                        <div className="w-64 p-3 border-r">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${categoryInfo.color} text-white text-xs`}
                            >
                              {categoryInfo.icon} {categoryInfo.name}
                            </Badge>
                            {task.isCritical && (
                              <Badge variant="destructive" className="text-xs">
                                중요
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm mt-1 truncate">{task.name}</p>
                          <p className="text-xs text-gray-500">{task.space}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {task.duration}일
                            </span>
                            <span className="text-xs text-gray-500">
                              {task.progress}%
                            </span>
                          </div>
                        </div>

                        {/* 간트 바 영역 */}
                        <div className="flex-1 relative p-2 min-h-[60px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-2 h-6 rounded cursor-pointer transition-all duration-200 hover:opacity-90 group-hover:shadow-lg"
                                style={getTaskBarStyle(task)}
                                onClick={() => onTaskClick?.(task.id)}
                                onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                              >
                                {/* 진행률 바 */}
                                <div
                                  className="h-full rounded transition-all duration-300"
                                  style={getProgressStyle(task)}
                                />
                                
                                {/* 태스크 레이블 */}
                                <div className="absolute inset-0 flex items-center px-2">
                                  <span className="text-xs font-medium text-white truncate">
                                    {task.name.length > 15 ? `${task.name.substring(0, 15)}...` : task.name}
                                  </span>
                                </div>

                                {/* 마일스톤 표시 */}
                                {task.isMilestone && (
                                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-yellow-400 rotate-45 border border-white"></div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-semibold">{task.name}</p>
                                <p className="text-sm">공간: {task.space}</p>
                                <p className="text-sm">기간: {format(task.start, 'MM/dd', { locale: ko })} ~ {format(task.end, 'MM/dd', { locale: ko })}</p>
                                <p className="text-sm">소요일: {task.duration}일</p>
                                <p className="text-sm">진행률: {task.progress}%</p>
                                <p className="text-sm">예상비용: {task.estimatedCost.toLocaleString()}원</p>
                                {task.dependencies.length > 0 && (
                                  <p className="text-sm">의존성: {task.dependencies.length}개 작업</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 인사이트 및 경고 */}
        {data.insights.warnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                AI 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.insights.warnings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">⚠️ 주의사항</h4>
                  <ul className="space-y-1">
                    {data.insights.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-600">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.insights.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">💡 개선 제안</h4>
                  <ul className="space-y-1">
                    {data.insights.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-600">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.insights.optimizations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✨ 최적화 결과</h4>
                  <ul className="space-y-1">
                    {data.insights.optimizations.map((optimization, index) => (
                      <li key={index} className="text-sm text-green-600">• {optimization}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}