import { Project } from '@/types'

export interface ProjectStatus {
  label: string
  color: string
  detail: string
  status: 'pending' | 'active' | 'completed'
}

export function getProjectStatus(project: Project): ProjectStatus {
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

export function getProjectProgress(project: Project): number {
  const status = getProjectStatus(project)
  
  if (status.status === 'pending') return 0
  if (status.status === 'completed') return 100
  
  const startDate = new Date(project.startDate)
  const today = new Date()
  const totalDuration = project.schedule.totalDuration * 24 * 60 * 60 * 1000
  
  return Math.min(100, Math.max(0, 
    Math.round(((today.getTime() - startDate.getTime()) / totalDuration) * 100)
  ))
}

export function getProjectDaysRemaining(project: Project): number {
  const startDate = new Date(project.startDate)
  const today = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + project.schedule.totalDuration)
  
  return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}

export function filterProjectsByStatus(projects: Project[], filter: 'all' | 'in-progress' | 'completed'): Project[] {
  if (filter === 'all') return projects
  
  return projects.filter(project => {
    const status = getProjectStatus(project).status
    
    if (filter === 'in-progress') return status === 'active'
    if (filter === 'completed') return status === 'completed'
    return true
  })
}

export function countProjectsByStatus(projects: Project[]): {
  total: number
  active: number
  completed: number
  pending: number
} {
  const counts = {
    total: projects.length,
    active: 0,
    completed: 0,
    pending: 0
  }
  
  projects.forEach(project => {
    const status = getProjectStatus(project).status
    counts[status]++
  })
  
  return counts
}