"use client"

import { useMemo } from 'react'
import { ScheduledTask } from '@/lib/types'
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react'
import { calculateTaskStatistics } from '@/lib/utils/taskStatistics'

interface ProgressOverviewProps {
  tasks: ScheduledTask[]
  totalDuration: number
  currentDate?: Date
}

export function ProgressOverview({ tasks, totalDuration, currentDate = new Date() }: ProgressOverviewProps) {
  // 작업 상태별 통계
  const stats = useMemo(() => {
    return calculateTaskStatistics(tasks, totalDuration, currentDate)
  }, [tasks, totalDuration, currentDate])
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* 전체 진행률 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">전체 공정 진행률</h3>
          <span className="text-2xl font-bold text-blue-600">{stats.progress.overall}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500 relative"
            style={{ width: `${stats.progress.overall}%` }}
          >
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
              {stats.byStatus.completed}/{stats.total}
            </span>
          </div>
        </div>
      </div>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">완료</span>
          </div>
          <p className="text-xl font-bold text-green-600">{stats.byStatus.completed}개</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-gray-600">진행중</span>
          </div>
          <p className="text-xl font-bold text-yellow-600">{stats.byStatus.inProgress}개</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">대기중</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{stats.byStatus.pending}개</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600">지연</span>
          </div>
          <p className="text-xl font-bold text-red-600">{stats.byStatus.delayed}개</p>
        </div>
      </div>
      
      {/* 일정 정보 */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">오늘 작업</span>
          <span className="font-semibold text-gray-900">{stats.timeline.todayCount}개</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">이번 주 작업</span>
          <span className="font-semibold text-gray-900">{stats.timeline.weekCount}개</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">남은 공사 기간</span>
          <span className="font-semibold text-gray-900">{stats.timeline.remainingDays}일</span>
        </div>
      </div>
    </div>
  )
}