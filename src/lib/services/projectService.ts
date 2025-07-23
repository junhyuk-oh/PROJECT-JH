import { Project } from '../types'
import { validateProject } from '../utils/validationUtils'

// 프로젝트 저장소 (임시 - 실제로는 DB 사용)
const projectStorage = new Map<string, Project>()

/**
 * 프로젝트 저장
 */
export async function saveProject(projectData: Partial<Project>): Promise<string> {
  // 프로젝트 ID 생성
  const projectId = generateProjectId()
  
  const project: Project = {
    ...projectData,
    id: projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Project
  
  // 검증
  const validation = validateProject(project)
  if (!validation.valid) {
    throw new Error(`프로젝트 검증 실패: ${validation.errors.join(', ')}`)
  }
  
  // localStorage에 저장 (브라우저 환경)
  if (typeof window !== 'undefined') {
    const projects = getProjectsFromLocalStorage()
    projects[projectId] = project
    localStorage.setItem('selffin-projects', JSON.stringify(projects))
  }
  
  // 메모리 저장소에도 저장
  projectStorage.set(projectId, project)
  
  return projectId
}

/**
 * 프로젝트 업데이트
 */
export async function updateProject(
  projectId: string, 
  updates: Partial<Project>
): Promise<void> {
  const existing = await getProject(projectId)
  if (!existing) {
    throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}`)
  }
  
  const updated: Project = {
    ...existing,
    ...updates,
    id: projectId, // ID는 변경 불가
    createdAt: existing.createdAt, // 생성일시는 변경 불가
    updatedAt: new Date().toISOString()
  }
  
  // 검증
  const validation = validateProject(updated)
  if (!validation.valid) {
    throw new Error(`프로젝트 검증 실패: ${validation.errors.join(', ')}`)
  }
  
  // 저장
  if (typeof window !== 'undefined') {
    const projects = getProjectsFromLocalStorage()
    projects[projectId] = updated
    localStorage.setItem('selffin-projects', JSON.stringify(projects))
  }
  
  projectStorage.set(projectId, updated)
}

/**
 * 프로젝트 조회
 */
export async function getProject(projectId: string): Promise<Project | null> {
  // localStorage에서 조회
  if (typeof window !== 'undefined') {
    const projects = getProjectsFromLocalStorage()
    if (projects[projectId]) {
      return projects[projectId]
    }
  }
  
  // 메모리 저장소에서 조회
  return projectStorage.get(projectId) || null
}

/**
 * 모든 프로젝트 조회
 */
export async function getAllProjects(): Promise<Project[]> {
  if (typeof window !== 'undefined') {
    const projects = getProjectsFromLocalStorage()
    return Object.values(projects)
  }
  
  return Array.from(projectStorage.values())
}

/**
 * 프로젝트 삭제
 */
export async function deleteProject(projectId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const projects = getProjectsFromLocalStorage()
    delete projects[projectId]
    localStorage.setItem('selffin-projects', JSON.stringify(projects))
  }
  
  projectStorage.delete(projectId)
}

/**
 * 프로젝트 검색
 */
export async function searchProjects(query: string): Promise<Project[]> {
  const allProjects = await getAllProjects()
  const lowerQuery = query.toLowerCase()
  
  return allProjects.filter(project => 
    project.name.toLowerCase().includes(lowerQuery) ||
    project.type.toLowerCase().includes(lowerQuery) ||
    project.currentState?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * 진행 중인 프로젝트 조회
 */
export async function getActiveProjects(): Promise<Project[]> {
  const allProjects = await getAllProjects()
  return allProjects.filter(project => 
    project.currentState !== 'completed' && 
    project.currentState !== 'cancelled'
  )
}

/**
 * 프로젝트 통계
 */
export interface ProjectStats {
  total: number
  active: number
  completed: number
  totalBudget: number
  averageBudget: number
}

export async function getProjectStats(): Promise<ProjectStats> {
  const projects = await getAllProjects()
  
  const stats: ProjectStats = {
    total: projects.length,
    active: 0,
    completed: 0,
    totalBudget: 0,
    averageBudget: 0
  }
  
  projects.forEach(project => {
    if (project.currentState === 'completed') {
      stats.completed++
    } else if (project.currentState !== 'cancelled') {
      stats.active++
    }
    stats.totalBudget += project.budget
  })
  
  if (stats.total > 0) {
    stats.averageBudget = stats.totalBudget / stats.total
  }
  
  return stats
}

// Helper functions

/**
 * 프로젝트 ID 생성
 */
function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * localStorage에서 프로젝트 데이터 가져오기
 */
function getProjectsFromLocalStorage(): Record<string, Project> {
  try {
    const data = localStorage.getItem('selffin-projects')
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('localStorage 읽기 오류:', error)
    return {}
  }
}