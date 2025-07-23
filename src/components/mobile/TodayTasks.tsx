'use client'

import { useState } from 'react'

interface Task {
  id: string
  title: string
  time: string
  status: 'completed' | 'in_progress' | 'pending'
  order: number
}

interface TodayTasksProps {
  tasks: Task[]
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void
}

export default function TodayTasks({ tasks, onTaskStatusChange }: TodayTasksProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)

  const handleStatusChange = (taskId: string) => {
    const updatedTasks = localTasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'pending' ? 'in_progress' : 
                         task.status === 'in_progress' ? 'completed' : 
                         'completed'
        
        if (onTaskStatusChange) {
          onTaskStatusChange(taskId, newStatus)
        }
        
        return { ...task, status: newStatus as Task['status'] }
      }
      return task
    })
    
    setLocalTasks(updatedTasks)
  }

  const getStatusInfo = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: '완료',
          bgColor: 'bg-notion-green-bg',
          textColor: 'text-notion-green',
          checkboxBg: 'bg-notion-green',
          checkboxBorder: 'border-notion-green'
        }
      case 'in_progress':
        return {
          label: '진행중',
          bgColor: 'bg-notion-blue-bg',
          textColor: 'text-notion-blue',
          checkboxBg: 'bg-white',
          checkboxBorder: 'border-notion-blue'
        }
      case 'pending':
        return {
          label: '대기',
          bgColor: 'bg-notion-yellow-bg',
          textColor: 'text-notion-yellow',
          checkboxBg: 'bg-white',
          checkboxBorder: 'border-notion-border'
        }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-notion-text flex items-center gap-2">
        <span className="text-xl">📅</span>
        오늘 할 일
      </h2>

      <div className="space-y-3">
        {localTasks.map((task, index) => {
          const statusInfo = getStatusInfo(task.status)
          
          return (
            <div
              key={task.id}
              className="bg-white rounded-xl p-4 shadow-notion-sm hover:shadow-notion-md transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                {/* 체크박스/순서 */}
                <button
                  onClick={() => handleStatusChange(task.id)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${statusInfo.checkboxBg} ${statusInfo.checkboxBorder}
                    border-2 transition-all duration-200
                    ${task.status === 'completed' ? 'text-white' : 'text-notion-text-secondary'}
                  `}
                >
                  {task.status === 'completed' ? '✓' : task.order}
                </button>

                {/* 태스크 정보 */}
                <div className="flex-1">
                  <h3 className={`
                    font-medium text-notion-text
                    ${task.status === 'completed' ? 'line-through opacity-60' : ''}
                  `}>
                    {task.title}
                  </h3>
                  <p className="text-notion-sm text-notion-text-secondary mt-0.5">
                    {task.time}
                  </p>
                </div>

                {/* 상태 뱃지 */}
                <span className={`
                  px-2.5 py-1 rounded-md text-xs font-medium
                  ${statusInfo.bgColor} ${statusInfo.textColor}
                `}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {localTasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-notion-text-secondary">오늘 예정된 작업이 없습니다</p>
        </div>
      )}
    </div>
  )
}