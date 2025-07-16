"use client"

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Users, Volume2, Wind } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isWeekend,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarTask {
  id: string;
  name: string;
  start: string;
  end: string;
  space: string;
  category: string;
  isCritical: boolean;
  noiseLevel?: string;
  dustLevel?: string;
  resources?: string[];
}

interface CalendarViewProps {
  tasks: CalendarTask[];
  startDate: Date;
  endDate: Date;
  onTaskClick?: (task: CalendarTask) => void;
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

export function CalendarView({ tasks, startDate, endDate, onTaskClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  
  // 현재 월의 캘린더 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentMonth]);
  
  // 날짜별 작업 매핑
  const tasksByDate = useMemo(() => {
    const mapping = new Map<string, CalendarTask[]>();
    
    tasks.forEach(task => {
      const taskStart = parseISO(task.start);
      const taskEnd = parseISO(task.end);
      
      let currentDate = taskStart;
      while (currentDate <= taskEnd) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        if (!mapping.has(dateKey)) {
          mapping.set(dateKey, []);
        }
        mapping.get(dateKey)!.push(task);
        currentDate = addDays(currentDate, 1);
      }
    });
    
    return mapping;
  }, [tasks]);
  
  const navigateMonth = (direction: number) => {
    setCurrentMonth(direction > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };
  
  const getTasksForDate = (date: Date): CalendarTask[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate.get(dateKey) || [];
  };
  
  const getDayStatus = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const hasHighNoise = dayTasks.some(t => t.noiseLevel === 'high');
    const hasHighDust = dayTasks.some(t => t.dustLevel === 'high');
    const hasCritical = dayTasks.some(t => t.isCritical);
    const workload = dayTasks.length;
    
    return { hasHighNoise, hasHighDust, hasCritical, workload };
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 헤더 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">캘린더 뷰</h3>
          <div className="flex items-center gap-4">
            {/* 범례 */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>중요 작업</span>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-orange-500" />
                <span>고소음</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4 text-gray-500" />
                <span>고분진</span>
              </div>
            </div>
            
            {/* 월 네비게이션 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-lg w-32 text-center">
                {format(currentMonth, 'yyyy년 M월', { locale: ko })}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 캘린더 그리드 */}
      <div className="p-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-medium py-2 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const { hasHighNoise, hasHighDust, hasCritical, workload } = getDayStatus(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isWeekendDay = isWeekend(day);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isToday(day) ? 'border-blue-500 border-2' : 'border-gray-200'}
                  ${isWeekendDay ? 'bg-gray-50' : ''}
                  hover:shadow-md
                `}
                onClick={() => setSelectedDate(day)}
              >
                {/* 날짜 */}
                <div className="flex items-start justify-between mb-1">
                  <span className={`
                    text-sm font-medium
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-1">
                    {hasCritical && <AlertCircle className="w-3 h-3 text-red-500" />}
                    {hasHighNoise && <Volume2 className="w-3 h-3 text-orange-500" />}
                    {hasHighDust && <Wind className="w-3 h-3 text-gray-500" />}
                  </div>
                </div>
                
                {/* 작업 표시 */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className={`
                        text-xs px-1 py-0.5 rounded truncate cursor-pointer
                        ${task.isCritical ? 'ring-1 ring-red-400' : ''}
                      `}
                      style={{
                        backgroundColor: categoryColors[task.category] + '20',
                        color: categoryColors[task.category]
                      }}
                      onMouseEnter={() => setHoveredTask(task.id)}
                      onMouseLeave={() => setHoveredTask(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick?.(task);
                      }}
                    >
                      {task.space.substring(0, 2)} - {categoryNames[task.category]}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3}개
                    </div>
                  )}
                </div>
                
                {/* 작업량 인디케이터 */}
                {workload > 0 && (
                  <div className="mt-1 flex gap-0.5">
                    {[...Array(Math.min(workload, 5))].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          workload > 3 ? 'bg-red-400' : workload > 2 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 선택된 날짜의 상세 작업 */}
        {selectedDate && getTasksForDate(selectedDate).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">
              {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })} 작업 목록
            </h4>
            <div className="space-y-2">
              {getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  className="bg-white p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: categoryColors[task.category] + '20',
                            color: categoryColors[task.category]
                          }}
                        >
                          {categoryNames[task.category]}
                        </span>
                        {task.resources && task.resources.length > 0 && (
                          <span className="ml-2">
                            <Users className="w-3 h-3 inline mr-1" />
                            {task.resources.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {task.isCritical && (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          중요
                        </span>
                      )}
                      {task.noiseLevel === 'high' && (
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          고소음
                        </span>
                      )}
                      {task.dustLevel === 'high' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          고분진
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 월간 요약 */}
      <div className="p-4 border-t bg-gray-50">
        <h4 className="font-medium mb-2">월간 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">총 작업일:</span>
            <span className="ml-2 font-medium">
              {new Set(
                tasks
                  .filter(t => {
                    const start = parseISO(t.start);
                    const end = parseISO(t.end);
                    return (
                      (start >= startOfMonth(currentMonth) && start <= endOfMonth(currentMonth)) ||
                      (end >= startOfMonth(currentMonth) && end <= endOfMonth(currentMonth))
                    );
                  })
                  .flatMap(t => {
                    const dates = [];
                    let current = parseISO(t.start);
                    const end = parseISO(t.end);
                    while (current <= end) {
                      if (isSameMonth(current, currentMonth)) {
                        dates.push(format(current, 'yyyy-MM-dd'));
                      }
                      current = addDays(current, 1);
                    }
                    return dates;
                  })
              ).size}일
            </span>
          </div>
          <div>
            <span className="text-gray-500">중요 작업:</span>
            <span className="ml-2 font-medium text-red-500">
              {tasks.filter(t => t.isCritical && 
                isSameMonth(parseISO(t.start), currentMonth)
              ).length}개
            </span>
          </div>
          <div>
            <span className="text-gray-500">고소음 작업:</span>
            <span className="ml-2 font-medium text-orange-500">
              {tasks.filter(t => t.noiseLevel === 'high' && 
                isSameMonth(parseISO(t.start), currentMonth)
              ).length}개
            </span>
          </div>
          <div>
            <span className="text-gray-500">주말 작업:</span>
            <span className="ml-2 font-medium">
              {tasks.filter(t => {
                const start = parseISO(t.start);
                return isSameMonth(start, currentMonth) && isWeekend(start);
              }).length}개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}