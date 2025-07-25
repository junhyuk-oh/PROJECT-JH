import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { generateSchedule } from '@/lib/scheduleGenerator'
import { ProjectFormData } from '@/types'
import { useCreateProject } from '@/hooks/queries/useProjectQueries'

const initialFormData: ProjectFormData = {
  name: '',
  type: 'residential',
  startDate: new Date(),
  budget: 0,
  area: 0,
  currentState: 'partial',
  specificRequirements: '',
  weatherSensitivity: 50,
  complexity: 'normal',
  scheduleFlexibility: 'normal',
}

export function useProjectForm() {
  const router = useRouter()
  const createProject = useCreateProject()
  const [showRiskAssessment, setShowRiskAssessment] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData)

  const updateFormData = useCallback((updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const toggleRiskAssessment = useCallback(() => {
    setShowRiskAssessment(prev => !prev)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 프로젝트 데이터를 기반으로 일정 생성
      const schedule = generateSchedule({
        projectType: formData.type,
        area: formData.area,
        budget: formData.budget,
        startDate: formData.startDate,
        currentState: formData.currentState,
        weatherSensitivity: formData.weatherSensitivity,
        complexity: formData.complexity,
        scheduleFlexibility: formData.scheduleFlexibility,
      } as any)

      // React Query 뮤테이션 사용
      const newProject = await createProject.mutateAsync({
        ...formData,
        id: `project-${Date.now()}`,
        schedule,
        createdAt: new Date().toISOString(),
      } as any)

      // 일정 결과 페이지로 이동 (newProject는 프로젝트 ID 문자열)
      router.push(`/schedule-results?projectId=${newProject}`)
    } catch (error) {
      console.error('프로젝트 생성 실패:', error)
      alert('프로젝트 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }, [formData, router, createProject])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setShowRiskAssessment(false)
  }, [])

  return {
    formData,
    isLoading: createProject.isPending,
    showRiskAssessment,
    updateFormData,
    toggleRiskAssessment,
    handleSubmit,
    resetForm,
  }
}