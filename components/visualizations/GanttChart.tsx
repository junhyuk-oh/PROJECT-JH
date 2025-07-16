"use client"

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Users, Clock, DollarSign } from 'lucide-react';
import { format, differenceInDays, addDays, startOfDay, isWeekend } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  duration: number;
  dependencies: string[];
  progress: number;
  isCritical: boolean;
  category: string;
  space: string;
  resources: string[];
  cost: number;
  warnings?: string[];
  tips?: string[];
  noiseLevel?: string;
  dustLevel?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
  onTaskClick?: (task: GanttTask) => void;
}

const categoryColors: Record<string, string> = {
  demolition: '#ef4444',
  plumbing: '#3b82f6',
  electrical: '#eab308',
  waterproofing: '#06b6d4',
  tiling: '#8b5cf6',
  carpentry: '#f97316',
  painting: '#10b981',
  installation: '#6366f1',
  cleaning: '#84cc16'
};

const categoryNames: Record<string, string> = {
  demolition: '철거',
  plumbing: '배관',
  electrical: '전기',
  waterproofing: '방수',
  tiling: '타일',
  carpentry: '목공',
  painting: '도장',
  installation: '설치',
  cleaning: '청소'
};

export function GanttChart({ tasks, startDate, endDate, onTaskClick }: GanttChartProps) {
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const dayWidth = 40;
  const rowHeight = 40;
  const headerHeight = 120;
  
  // 공간별로 작업 그룹화
  const tasksBySpace = useMemo(() => {
    const grouped = new Map<string, GanttTask[]>();
    tasks.forEach(task => {
      if (!grouped.has(task.space)) {
        grouped.set(task.space, []);
      }
      grouped.get(task.space)!.push(task);
    });
    return grouped;
  }, [tasks]);
  
  // 날짜 배열 생성
  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < totalDays; i++) {
      result.push(addDays(startDate, i));
    }
    return result;
  }, [startDate, totalDays]);
  
  // 월별 그룹화
  const monthGroups = useMemo(() => {
    const groups = new Map<string, Date[]>();
    dates.forEach(date => {
      const monthKey = format(date, 'yyyy-MM');
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(date);
    });
    return groups;
  }, [dates]);
  
  const toggleSpace = (space: string) => {
    const newCollapsed = new Set(collapsedSpaces);
    if (newCollapsed.has(space)) {
      newCollapsed.delete(space);
    } else {
      newCollapsed.add(space);
    }
    setCollapsedSpaces(newCollapsed);
  };
  
  const getTaskPosition = (task: GanttTask) => {
    const taskStart = startOfDay(new Date(task.start));
    const left = differenceInDays(taskStart, startDate) * dayWidth;
    const width = task.duration * dayWidth;
    return { left, width };
  };
  
  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task.id);
    onTaskClick?.(task);
  };
  
  // 의존성 화살표 그리기
  const renderDependencyArrows = () => {
    const arrows: JSX.Element[] = [];
    let rowIndex = 0;
    
    tasksBySpace.forEach((spaceTasks, space) => {
      if (collapsedSpaces.has(space)) {
        rowIndex++;
        return;
      }
      
      rowIndex++; // 공간 헤더
      
      spaceTasks.forEach((task, taskIndex) => {
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          if (!depTask) return;
          
          const fromPos = getTaskPosition(depTask);
          const toPos = getTaskPosition(task);
          
          // 의존 작업의 행 위치 찾기
          let depRowIndex = 0;
          let found = false;
          
          tasksBySpace.forEach((sTasks, s) => {
            if (found) return;
            if (collapsedSpaces.has(s)) {
              depRowIndex++;
              return;
            }
            depRowIndex++; // 공간 헤더
            
            sTasks.forEach((t, i) => {
              if (t.id === depId) {
                depRowIndex += i;
                found = true;
              }
            });
          });
          
          const currentRow = rowIndex + taskIndex;
          
          const x1 = fromPos.left + fromPos.width;
          const y1 = depRowIndex * rowHeight + rowHeight / 2;
          const x2 = toPos.left;
          const y2 = currentRow * rowHeight + rowHeight / 2;
          
          const midX = (x1 + x2) / 2;
          
          arrows.push(
            <path
              key={`${depId}-${task.id}`}
              d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="opacity-50"
            />
          );
        });
        
        rowIndex++;
      });
    });
    
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: totalDays * dayWidth, height: '100%' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#94a3b8"
            />
          </marker>
        </defs>
        {arrows}
      </svg>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <div className="mt-2 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>중요 경로</span>
          </div>
          {Object.entries(categoryColors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
              <span>{categoryNames[key]}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="overflow-auto" ref={chartRef}>
        <div className="flex">
          {/* 작업 목록 */}
          <div className="flex-shrink-0 w-64 border-r bg-gray-50">
            {/* 헤더 */}
            <div className="h-[120px] border-b bg-white p-4 flex items-end">
              <span className="text-sm font-medium text-gray-700">작업명</span>
            </div>
            
            {/* 작업 행 */}
            <div>
              {Array.from(tasksBySpace.entries()).map(([space, spaceTasks]) => (
                <React.Fragment key={space}>
                  {/* 공간 헤더 */}
                  <div
                    className="h-10 bg-gray-100 border-b px-4 flex items-center cursor-pointer hover:bg-gray-200"
                    onClick={() => toggleSpace(space)}
                  >
                    {collapsedSpaces.has(space) ? (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    <span className="font-medium">{space}</span>
                    <span className="ml-auto text-sm text-gray-500">
                      ({spaceTasks.length}개 작업)
                    </span>
                  </div>
                  
                  {/* 공간별 작업들 */}
                  {!collapsedSpaces.has(space) && spaceTasks.map(task => (
                    <div
                      key={task.id}
                      className={`h-10 border-b px-4 flex items-center text-sm cursor-pointer hover:bg-gray-50 ${
                        selectedTask === task.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <span className="truncate">{task.name.split(' - ')[1]}</span>
                      {task.isCritical && (
                        <AlertCircle className="w-4 h-4 ml-2 text-red-500" />
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* 차트 영역 */}
          <div className="flex-1 relative">
            {/* 날짜 헤더 */}
            <div className="h-[120px] border-b bg-white sticky top-0 z-10">
              {/* 월 행 */}
              <div className="h-10 border-b flex">
                {Array.from(monthGroups.entries()).map(([month, monthDates]) => (
                  <div
                    key={month}
                    className="border-r flex items-center justify-center font-medium text-sm"
                    style={{ width: monthDates.length * dayWidth }}
                  >
                    {format(monthDates[0], 'yyyy년 M월', { locale: ko })}
                  </div>
                ))}
              </div>
              
              {/* 주 행 */}
              <div className="h-10 border-b flex">
                {dates.map((date, index) => {
                  const isFirstOfWeek = date.getDay() === 1;
                  const weekNumber = Math.ceil((index + 1) / 7);
                  
                  return (
                    <div
                      key={index}
                      className={`border-r flex items-center justify-center text-xs ${
                        isFirstOfWeek ? 'font-medium' : ''
                      }`}
                      style={{ width: dayWidth }}
                    >
                      {isFirstOfWeek && `${weekNumber}주`}
                    </div>
                  );
                })}
              </div>
              
              {/* 일 행 */}
              <div className="h-10 flex">
                {dates.map((date, index) => (
                  <div
                    key={index}
                    className={`border-r flex flex-col items-center justify-center text-xs ${
                      isWeekend(date) ? 'bg-gray-100' : ''
                    }`}
                    style={{ width: dayWidth }}
                  >
                    <span className="font-medium">{format(date, 'd')}</span>
                    <span className="text-gray-500">{format(date, 'EEE', { locale: ko })}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 차트 바디 */}
            <div className="relative">
              {/* 그리드 라인 */}
              <div className="absolute inset-0">
                {dates.map((date, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 bottom-0 border-r ${
                      isWeekend(date) ? 'bg-gray-50' : ''
                    }`}
                    style={{ left: index * dayWidth, width: dayWidth }}
                  />
                ))}
              </div>
              
              {/* 의존성 화살표 */}
              {renderDependencyArrows()}
              
              {/* 작업 바 */}
              <div className="relative">
                {Array.from(tasksBySpace.entries()).map(([space, spaceTasks]) => (
                  <React.Fragment key={space}>
                    {/* 공간 헤더 행 */}
                    <div className="h-10 border-b" />
                    
                    {/* 작업 바들 */}
                    {!collapsedSpaces.has(space) && spaceTasks.map(task => {
                      const { left, width } = getTaskPosition(task);
                      const isHovered = hoveredTask === task.id;
                      const isSelected = selectedTask === task.id;
                      
                      return (
                        <div key={task.id} className="h-10 border-b relative">
                          <div
                            className={`absolute h-8 top-1 rounded cursor-pointer transition-all ${
                              task.isCritical ? 'ring-2 ring-red-500' : ''
                            } ${isHovered ? 'shadow-lg z-10' : ''} ${
                              isSelected ? 'ring-2 ring-blue-500' : ''
                            }`}
                            style={{
                              left: `${left}px`,
                              width: `${width}px`,
                              backgroundColor: categoryColors[task.category] || '#6b7280'
                            }}
                            onMouseEnter={() => setHoveredTask(task.id)}
                            onMouseLeave={() => setHoveredTask(null)}
                            onClick={() => handleTaskClick(task)}
                          >
                            {/* 진행률 표시 */}
                            <div
                              className="absolute inset-0 bg-gray-700 bg-opacity-20 rounded"
                              style={{ width: `${task.progress}%` }}
                            />
                            
                            {/* 작업명 (바 안에 표시) */}
                            {width > 80 && (
                              <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-medium">
                                <span className="truncate">{task.name.split(' - ')[1]}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* 호버 툴팁 */}
                          {isHovered && (
                            <div className="absolute z-20 bg-gray-700 text-white p-3 rounded-lg shadow-xl text-sm"
                              style={{
                                left: `${left + width / 2}px`,
                                top: '45px',
                                transform: 'translateX(-50%)',
                                minWidth: '200px'
                              }}
                            >
                              <div className="font-medium mb-1">{task.name}</div>
                              <div className="text-xs space-y-1 text-gray-200">
                                <div>기간: {task.duration}일</div>
                                <div>시작: {format(new Date(task.start), 'M월 d일')}</div>
                                <div>종료: {format(new Date(task.end), 'M월 d일')}</div>
                                {task.resources.length > 0 && (
                                  <div>필요 인력: {task.resources.join(', ')}</div>
                                )}
                                <div>예상 비용: {task.cost.toLocaleString()}원</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}