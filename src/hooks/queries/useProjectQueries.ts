import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Project } from '@/types'
import { getAllProjects, getProject, saveProject } from '@/lib/taskDatabase'

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
  list: () => ['projects', 'list'] as const,
}

// Get all projects
export function useProjects() {
  const query = useQuery({
    queryKey: projectKeys.list(),
    queryFn: getAllProjects,
    staleTime: 1000 * 60 * 2, // 2분간 fresh
  })

  return {
    projects: query.data || [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    reload: query.refetch
  }
}

// Get single project
export function useProject(id: string | null) {
  const query = useQuery({
    queryKey: projectKeys.detail(id || ''),
    queryFn: () => getProject(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분간 fresh
  })

  return {
    project: query.data || null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    reload: query.refetch
  }
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: saveProject,
    onSuccess: (newProject) => {
      // 프로젝트 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: projectKeys.list() })
      
      // 새 프로젝트를 캐시에 추가 (newProject는 saveProject에서 반환되는 string ID)
      // 실제 프로젝트 데이터는 리스트 갱신을 통해 처리
    },
    onError: (error) => {
      console.error('프로젝트 생성 실패:', error)
    },
  })
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      saveProject({ id, ...data } as Project),
    onSuccess: (updatedProjectId, variables) => {
      // 프로젝트 리스트 캐시 무효화 (업데이트된 데이터로 갱신)
      queryClient.invalidateQueries({ queryKey: projectKeys.list() })
      
      // 개별 프로젝트 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
    },
  })
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  const deleteProject = async (id: string) => {
    const allProjects = await getAllProjects()
    const filtered = allProjects.filter(p => p.id !== id)
    localStorage.setItem('projects', JSON.stringify(filtered))
    return id
  }
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (deletedId) => {
      // 개별 프로젝트 캐시 제거
      queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) })
      
      // 프로젝트 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: projectKeys.list() })
    },
  })
}

// Prefetch project
export function usePrefetchProject() {
  const queryClient = useQueryClient()
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: projectKeys.detail(id),
      queryFn: () => getProject(id),
      staleTime: 1000 * 60 * 5,
    })
  }
}