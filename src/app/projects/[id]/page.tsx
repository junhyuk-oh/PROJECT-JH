'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, BarChart3, Edit, Trash2, Clock, AlertCircle } from 'lucide-react'

// Hooks
import { useProject } from '@/hooks'

// Components
import { LoadingSpinner, ErrorMessage } from '@/components/common'
import { RiskDashboard } from '@/components/RiskDashboard'

// Types
import { Task, Project } from '@/types'

// Constants
import { 
  TASK_ICONS, 
  TASK_TYPE_LABELS, 
  PROJECT_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS
} from '@/constants'

// Utils
import { formatDate, formatCurrency, cn } from '@/lib/utils'

// Types
type TabType = 'overview' | 'schedule' | 'tasks'

interface ProjectStatus {
  label: string
  color: string
  detail: string
  status: 'pending' | 'active' | 'completed'
}

interface ExtendedProject extends Project {
  schedule: {
    schedule: Task[]
    totalDuration: number
    criticalPath: string[]
  }
}

// Helper functions
function getProjectStatus(project: ExtendedProject): ProjectStatus {
  const startDate = new Date(project.startDate)
  const today = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + project.schedule.totalDuration)

  if (today < startDate) {
    const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { 
      label: '시작 예정', 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      detail: `${daysUntilStart}일 후 시작`,
      status: 'pending'
    }
  } else if (today > endDate) {
    return { 
      label: '완료', 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      detail: '프로젝트 완료',
      status: 'completed'
    }
  } else {
    const progress = Math.round(((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)
    return { 
      label: '진행 중', 
      color: 'bg-green-100 text-green-700 border-green-200',
      detail: `${progress}% 완료`,
      status: 'active'
    }
  }
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const { project, loading, error, reload } = useProject(projectId)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const getUpcomingTasks = useCallback(() => {
    if (!project) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return (project as ExtendedProject).schedule.schedule.filter((task: Task) => {
      if (!task.startDate) return false
      const taskStart = new Date(task.startDate)
      taskStart.setHours(0, 0, 0, 0)
      return taskStart >= today && taskStart <= nextWeek
    }).sort((a: Task, b: Task) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
  }, [project])

  const getInProgressTasks = useCallback(() => {
    if (!project) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return (project as ExtendedProject).schedule.schedule.filter((task: Task) => {
      if (!task.startDate || !task.endDate) return false
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      taskStart.setHours(0, 0, 0, 0)
      taskEnd.setHours(0, 0, 0, 0)
      return taskStart <= today && taskEnd >= today
    })
  }, [project])

  // useMemo hooks must be called before any early returns
  const status = useMemo(() => project ? getProjectStatus(project as ExtendedProject) : null, [project])
  const upcomingTasks = useMemo(() => getUpcomingTasks(), [getUpcomingTasks])
  const inProgressTasks = useMemo(() => getInProgressTasks(), [getInProgressTasks])

  if (loading) {
    return <LoadingSpinner fullScreen message="프로젝트를 불러오는 중..." />
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={reload} fullScreen />
  }

  if (!project) {
    router.push('/projects')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-600">{PROJECT_TYPE_LABELS[project.type as keyof typeof PROJECT_TYPE_LABELS] || project.type} • {project.area}평</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex gap-4 border-b border-gray-200">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="개요"
            />
            <TabButton
              active={activeTab === 'schedule'}
              onClick={() => setActiveTab('schedule')}
              label="일정"
            />
            <TabButton
              active={activeTab === 'tasks'}
              onClick={() => setActiveTab('tasks')}
              label="작업 목록"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">프로젝트 현황</h2>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  status?.color
                )}>
                  {status?.label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="시작일" value={formatDate(new Date(project.startDate))} />
                <InfoItem 
                  label="완료 예정일" 
                  value={formatDate(new Date(new Date(project.startDate).getTime() + (project as ExtendedProject).schedule.totalDuration * 24 * 60 * 60 * 1000))} 
                />
                <InfoItem label="예산" value={`${formatCurrency(project.budget)}원`} />
                <InfoItem label="진행률" value={status?.detail || ''} />
              </div>
            </div>

            {/* In-progress tasks */}
            {inProgressTasks.length > 0 && (
              <TaskSection 
                title="진행 중인 작업"
                tasks={inProgressTasks}
                variant="in-progress"
              />
            )}

            {/* Upcoming tasks */}
            {upcomingTasks.length > 0 && (
              <TaskSection 
                title="다가오는 작업"
                tasks={upcomingTasks.slice(0, 5)}
                variant="upcoming"
              />
            )}

            {/* Risk dashboard */}
            <RiskDashboard 
              tasks={(project as ExtendedProject).schedule.schedule}
              projectStartDate={new Date(project.startDate)}
            />

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <QuickActionLink
                href={`/projects/${project.id}/calendar`}
                icon={<Calendar className="w-5 h-5 text-blue-600" />}
                label="캘린더 보기"
              />
              <QuickActionLink
                href={`/projects/${project.id}/gantt`}
                icon={<BarChart3 className="w-5 h-5 text-green-600" />}
                label="간트차트 보기"
              />
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab project={project} />
        )}

        {activeTab === 'tasks' && (
          <TasksTab project={project} />
        )}
      </div>
    </div>
  )
}

// Sub-components
interface TabButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

const TabButton = React.memo(function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-3 px-1 text-sm font-medium transition-colors relative",
        active ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
      )}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
      )}
    </button>
  )
})

interface InfoItemProps {
  label: string
  value: string
}

const InfoItem = React.memo(function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
})

interface TaskSectionProps {
  title: string
  tasks: Task[]
  variant: 'in-progress' | 'upcoming'
}

const TaskSection = React.memo(function TaskSection({ title, tasks, variant }: TaskSectionProps) {
  const bgColor = variant === 'in-progress' ? 'bg-green-50' : 'bg-blue-50'
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            bgColor
          )}>
            <span className="text-lg">{TASK_ICONS[task.type] || '📋'}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{task.name}</p>
              <p className="text-sm text-gray-600">
                {variant === 'in-progress' 
                  ? `${task.duration}일 • ${task.progress || 0}% 완료`
                  : `${formatDate(new Date(task.startDate!))} 시작 • ${task.duration}일`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

interface QuickActionLinkProps {
  href: string
  icon: React.ReactNode
  label: string
}

const QuickActionLink = React.memo(function QuickActionLink({ href, icon, label }: QuickActionLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      {icon}
      <span className="font-medium text-gray-900">{label}</span>
    </Link>
  )
})

interface ScheduleTabProps {
  project: ExtendedProject
}

const ScheduleTab = React.memo(function ScheduleTab({ project }: ScheduleTabProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">전체 일정</h2>
        <div className="flex gap-2">
          <ViewLink
            href={`/projects/${project.id}/calendar`}
            icon={<Calendar className="w-4 h-4" />}
            label="캘린더"
          />
          <ViewLink
            href={`/projects/${project.id}/gantt`}
            icon={<BarChart3 className="w-4 h-4" />}
            label="간트차트"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {project.schedule.schedule.map((task: Task, index: number) => (
          <ScheduleTaskItem key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  )
})

interface ViewLinkProps {
  href: string
  icon: React.ReactNode
  label: string
}

const ViewLink = React.memo(function ViewLink({ href, icon, label }: ViewLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
    >
      {icon}
      {label}
    </Link>
  )
})

interface ScheduleTaskItemProps {
  task: Task
  index: number
}

const ScheduleTaskItem = React.memo(function ScheduleTaskItem({ task, index }: ScheduleTaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        task.isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
      )}
    >
      <span className="text-lg">{TASK_ICONS[task.type] || '📋'}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{task.name}</p>
          {task.isCritical && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              임계경로
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {task.startDate && task.endDate
            ? `${formatDate(new Date(task.startDate))} - ${formatDate(new Date(task.endDate))}`
            : `${task.duration}일 소요`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">D{index + 1}</p>
        {task.progress !== undefined && (
          <p className="text-xs text-gray-600">{task.progress}%</p>
        )}
      </div>
    </div>
  )
})

interface TasksTabProps {
  project: ExtendedProject
}

const TasksTab = React.memo(function TasksTab({ project }: TasksTabProps) {
  const criticalTaskCount = useMemo(() => 
    project.schedule.schedule.filter((task: Task) => task.isCritical).length,
    [project.schedule.schedule]
  )

  return (
    <div className="space-y-4">
      {/* Task statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">작업 통계</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="전체 작업" value={project.schedule.schedule.length} />
          <StatItem label="임계 작업" value={criticalTaskCount} valueColor="text-red-600" />
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">전체 작업 목록</h2>
        <div className="space-y-2">
          {project.schedule.schedule.map((task: Task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  )
})

interface StatItemProps {
  label: string
  value: number
  valueColor?: string
}

const StatItem = React.memo(function StatItem({ label, value, valueColor = 'text-gray-900' }: StatItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
    </div>
  )
})

interface TaskListItemProps {
  task: Task
}

const TaskListItem = React.memo(function TaskListItem({ task }: TaskListItemProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-lg mt-1">{TASK_ICONS[task.type] || '📋'}</span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{task.name}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <TaskTag label={TASK_TYPE_LABELS[task.type] || task.type} />
            <TaskTag label={`${task.duration}일`} />
            {task.resources && task.resources.length > 0 && (
              <TaskTag label={task.resources.join(', ')} />
            )}
            {task.dependencies.length > 0 && (
              <TaskTag label={`선행: ${task.dependencies.join(', ')}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

interface TaskTagProps {
  label: string
}

const TaskTag = React.memo(function TaskTag({ label }: TaskTagProps) {
  return (
    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
      {label}
    </span>
  )
})