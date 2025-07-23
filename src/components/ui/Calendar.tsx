"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onDateClick?: (date: Date) => void
  renderDate?: (date: Date) => React.ReactNode
  viewMode?: 'month' | 'week'
  taskDates?: any
}

export function Calendar({
  currentMonth,
  onMonthChange,
  onDateClick,
  renderDate,
  viewMode = 'month',
  taskDates
}: CalendarProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // 주간 뷰를 위한 현재 주 계산
  const [currentWeek, setCurrentWeek] = useState(0)
  
  // 월의 첫날과 마지막날 구하기
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 첫 주의 시작 날짜 구하기 (일요일 시작)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // 달력에 표시할 날짜들 생성
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  
  if (viewMode === 'month') {
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else {
    // 주간 뷰: 현재 주의 7일만 표시
    const weekStart = new Date(startDate)
    weekStart.setDate(weekStart.getDate() + (currentWeek * 7))
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(weekStart))
      weekStart.setDate(weekStart.getDate() + 1)
    }
  }
  
  // 월/주 이동 핸들러
  const handlePrev = () => {
    if (viewMode === 'month') {
      const newDate = new Date(year, month - 1, 1)
      onMonthChange(newDate)
    } else {
      if (currentWeek > 0) {
        setCurrentWeek(currentWeek - 1)
      } else {
        const newDate = new Date(year, month - 1, 1)
        onMonthChange(newDate)
        // 이전 달의 마지막 주로 이동
        const lastDayPrevMonth = new Date(year, month, 0)
        const weeksInPrevMonth = Math.ceil((lastDayPrevMonth.getDate() + new Date(year, month - 1, 1).getDay()) / 7)
        setCurrentWeek(weeksInPrevMonth - 1)
      }
    }
  }
  
  const handleNext = () => {
    if (viewMode === 'month') {
      const newDate = new Date(year, month + 1, 1)
      onMonthChange(newDate)
    } else {
      const weeksInMonth = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7)
      if (currentWeek < weeksInMonth - 1) {
        setCurrentWeek(currentWeek + 1)
      } else {
        const newDate = new Date(year, month + 1, 1)
        onMonthChange(newDate)
        setCurrentWeek(0)
      }
    }
  }
  
  // 오늘 날짜 확인
  const today = new Date()
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }
  
  // 현재 월의 날짜인지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }
  
  // 월 이름 포맷
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  
  return (
    <div className="w-full bg-white rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label={viewMode === 'month' ? "이전 달" : "이전 주"}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {year}년 {monthNames[month]}
          {viewMode === 'week' && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              {currentWeek + 1}주차
            </span>
          )}
        </h2>
        
        <button
          onClick={handleNext}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label={viewMode === 'month' ? "다음 달" : "다음 주"}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`
              py-2 text-center text-xs font-medium
              ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}
            `}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {dates.map((date, index) => {
          const dayOfWeek = date.getDay()
          return (
            <div
              key={index}
              onClick={() => onDateClick?.(date)}
              className={`
                relative ${viewMode === 'month' ? 'min-h-[60px]' : 'min-h-[100px]'} p-2 border-r border-b border-gray-200
                ${!isCurrentMonth(date) && viewMode === 'month' ? 'bg-gray-50' : 'bg-white'}
                ${onDateClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                ${index % 7 === 6 ? 'border-r-0' : ''}
                ${dates.length - index <= 7 ? 'border-b-0' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-1">
                <div
                  className={`
                    text-sm font-medium
                    ${!isCurrentMonth(date) && viewMode === 'month' ? 'text-gray-400' : 
                      dayOfWeek === 0 ? 'text-red-500' : 
                      dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-900'}
                    ${isToday(date) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}
                >
                  {date.getDate()}
                </div>
                
                {/* 작업 기간 표시 바 */}
                {taskDates && viewMode === 'week' && (
                  <div className="flex items-center gap-1">
                    {taskDates.get(date.toDateString())?.start && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="시작" />
                    )}
                    {taskDates.get(date.toDateString())?.ongoing && (
                      <div className="flex-1 h-1 bg-blue-500" title="진행중" />
                    )}
                    {taskDates.get(date.toDateString())?.end && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" title="종료" />
                    )}
                  </div>
                )}
              </div>
              
              {/* 커스텀 날짜 렌더링 */}
              {renderDate && (viewMode === 'month' ? isCurrentMonth(date) : true) && (
                <div className="mt-1">
                  {renderDate(date)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}