import React from 'react'
import { Task } from '@/types'
import { TASK_ICONS, TASK_TYPE_LABELS } from '@/constants'
import { formatDate, cn } from '@/lib/utils'

interface ExtendedProject {
  schedule: {
    schedule: Task[]
    totalDuration: number
    criticalPath: string[]
  }
}

interface ScheduleTabProps {
  project: ExtendedProject
  criticalTasks: Task[]
}

export const ScheduleTab = React.memo(function ScheduleTab({ project, criticalTasks }: ScheduleTabProps) {
  return (
    <>
      {/* Critical Path */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          크리티컬 패스 (Critical Path)
        </h3>
        <p className="text-sm text-amber-700 mb-4">
          아래 작업들은 프로젝트 전체 일정에 직접적인 영향을 미치는 중요 작업입니다.
        </p>
        <div className="space-y-2">
          {criticalTasks.map((task, index) => (
            <CriticalTaskItem key={task.id} task={task} index={index} />
          ))}
        </div>
      </div>

      {/* Full Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 작업 일정</h3>
        
        <div className="space-y-3">
          {project.schedule.schedule.map((task: Task) => (
            <ScheduleTaskItem 
              key={task.id} 
              task={task} 
              isCritical={project.schedule.criticalPath.includes(task.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
})

interface CriticalTaskItemProps {
  task: Task
  index: number
}

const CriticalTaskItem = React.memo(function CriticalTaskItem({ task, index }: CriticalTaskItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-sm font-medium">
        {index + 1}
      </div>
      <div className="flex-1">
        <span className="font-medium text-amber-900">{task.name}</span>
        <span className="text-sm text-amber-700 ml-2">({task.duration}일)</span>
      </div>
    </div>
  )
})

interface ScheduleTaskItemProps {
  task: Task
  isCritical: boolean
}

const ScheduleTaskItem = React.memo(function ScheduleTaskItem({ task, isCritical }: ScheduleTaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border",
        isCritical
          ? 'bg-amber-50 border-amber-200'
          : 'bg-gray-50 border-gray-200'
      )}
    >
      <span className="text-2xl">{TASK_ICONS[task.type] || '📋'}</span>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{task.name}</h4>
          {isCritical && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
              임계경로
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {TASK_TYPE_LABELS[task.type] || task.type} • {task.duration}일 소요
          {task.dependencies.length > 0 && (
            <span className="ml-2">• 선행: {task.dependencies.join(', ')}</span>
          )}
        </p>
        {task.startDate && task.endDate && (
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(new Date(task.startDate))} - {formatDate(new Date(task.endDate))}
          </p>
        )}
      </div>
    </div>
  )
})