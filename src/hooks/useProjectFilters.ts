import { useState, useMemo, useCallback } from 'react'
import { Project, ProjectFilter } from '@/types'
import { filterProjectsByStatus, countProjectsByStatus } from '@/lib/projectUtils'

export function useProjectFilters(projects: Project[]) {
  const [filter, setFilter] = useState<ProjectFilter>('all')

  const filteredProjects = useMemo(() => {
    return filterProjectsByStatus(projects, filter)
  }, [projects, filter])

  const projectCounts = useMemo(() => {
    return countProjectsByStatus(projects)
  }, [projects])

  const updateFilter = useCallback((newFilter: ProjectFilter) => {
    setFilter(newFilter)
  }, [])

  return {
    filter,
    filteredProjects,
    projectCounts,
    updateFilter
  }
}