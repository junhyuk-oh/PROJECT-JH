"use client"

import { ScheduledTask } from '@/lib/types'
import { format } from 'date-fns'
import { Star, Volume2, Clock, AlertCircle } from 'lucide-react'
import {
  TASK_ICONS,
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS,
  STATUS_TEXT_COLORS,
  STATUS_LABELS
} from '@/lib/constants/calendar'

interface TaskCardProps {
  task: ScheduledTask
  isCritical?: boolean
  showDates?: boolean
  compact?: boolean
}

export function TaskCard({ 
  task, 
  isCritical = false, 
  showDates = true,
  compact = false 
}: TaskCardProps) {
  return (
    <div
      className={`rounded-lg border-2 transition-all hover:shadow-md ${
        compact ? 'p-2' : 'p-3'
      }`}
      style={{
        backgroundColor: `${TASK_TYPE_COLORS[task.type]}20`,
        borderColor: TASK_TYPE_COLORS[task.type]
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={compact ? "text-base" : "text-lg"} title={TASK_TYPE_LABELS[task.type]}>
            {TASK_ICONS[task.type] || '📌'}
          </span>
          <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>
            {task.name}
          </h3>
          {isCritical && <Star className={compact ? "w-3 h-3" : "w-4 h-4"} />}
        </div>
        <span
          className={`px-2 py-1 rounded-full font-medium ${
            compact ? 'text-xs' : 'text-xs'
          }`}
          style={{
            backgroundColor: STATUS_TEXT_COLORS[task.status],
            color: 'white'
          }}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>
      
      <div className={`space-y-1 text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
        {showDates && (
          <div className="flex items-center justify-between">
            <span>기간: {task.duration}일</span>
            <span>
              {format(new Date(task.startDate), 'M/d')} - {format(new Date(task.endDate), 'M/d')}
            </span>
          </div>
        )}
        
        {/* 특수 정보 표시 */}
        <TaskSpecialInfo task={task} compact={compact} />
        
        {/* DIY 정보 */}
        {task.diyPossible && !compact && (
          <div className="mt-2 text-xs text-gray-500">
            DIY 가능 (난이도: {task.diyDifficulty})
          </div>
        )}
      </div>
    </div>
  )
}

// 특수 정보 표시 컴포넌트
function TaskSpecialInfo({ task, compact }: { task: ScheduledTask, compact: boolean }) {
  const badges = []
  
  if (task.noiseLevel === 'high') {
    badges.push(
      <span key="noise" className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
        <Volume2 className="w-3 h-3" /> 소음작업
      </span>
    )
  }
  
  if (task.dryingTime) {
    badges.push(
      <span key="drying" className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
        <Clock className="w-3 h-3" /> 건조 {task.dryingTime}시간
      </span>
    )
  }
  
  if (task.weatherDependent) {
    badges.push(
      <span key="weather" className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
        <AlertCircle className="w-3 h-3" /> 날씨영향
      </span>
    )
  }
  
  if (badges.length === 0) return null
  
  return (
    <div className={`flex flex-wrap gap-${compact ? '1' : '2'} mt-${compact ? '1' : '2'}`}>
      {badges}
    </div>
  )
}