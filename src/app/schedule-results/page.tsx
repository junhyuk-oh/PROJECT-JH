'use client'

import React, { useState, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Hooks
import { useProject } from '@/hooks'

// Components
import { LoadingSpinner, ErrorMessage } from '@/components/common'
import { CPMAnalysisProgress } from '@/components/CPMAnalysisProgress'
import { SimpleHistogram } from '@/components/charts/SimpleHistogram'
import { WhatIfAnalysis } from '@/components/WhatIfAnalysis'
import { TabNavigation } from '@/components/schedule-results/TabNavigation'
import { ProjectSummary } from '@/components/schedule-results/ProjectSummary'
import { ScheduleTab } from '@/components/schedule-results/ScheduleTab'
import { RiskTab } from '@/components/schedule-results/RiskTab'
import { OptimizationTab } from '@/components/schedule-results/OptimizationTab'
import { ActionButtons } from '@/components/schedule-results/ActionButtons'

// Types
import { Task, Project } from '@/types'

// Constants
import { 
  PROJECT_TYPE_LABELS, 
  TASK_COLORS,
  TASK_ICONS,
  TASK_TYPE_LABELS,
  RISK_COLORS,
  RISK_LABELS
} from '@/constants'

// Utils
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { MonteCarloSimulator } from '@/lib/monteCarloSimulator'

// Types
interface SimulationResult {
  percentiles: { p10: number; p50: number; p90: number }
  confidence: number
  standardDeviation: number
  histogram: Array<{ day: number; count: number }>
}

interface ExtendedProject extends Project {
  schedule: {
    schedule: Task[]
    totalDuration: number
    criticalPath: string[]
  }
  weatherSensitivity?: number
  complexity?: 'simple' | 'normal' | 'complex'
  scheduleFlexibility?: 'flexible' | 'normal' | 'strict'
}

type TabType = 'schedule' | 'risk' | 'optimization'

// Helper functions
function getTaskTypeColor(type: string): string {
  // Use colors from constants
  const color = TASK_COLORS[type]
  if (!color) return 'bg-gray-100 text-gray-700'
  
  // Convert hex to tailwind classes
  if (color.startsWith('#DC2626')) return 'bg-red-100 text-red-700'
  if (color.startsWith('#3B82F6')) return 'bg-blue-100 text-blue-700'
  if (color.startsWith('#FBBF24')) return 'bg-yellow-100 text-yellow-700'
  if (color.startsWith('#059669')) return 'bg-green-100 text-green-700'
  if (color.startsWith('#7C3AED')) return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}

function ScheduleResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('schedule')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  
  const { project, loading, error } = useProject(projectId || null)

  // Cast project to ExtendedProject type
  const extendedProject = project as ExtendedProject | null

  // CPM 분석 완료 핸들러
  const handleAnalysisComplete = useCallback(() => {
    if (extendedProject) {
      // Monte Carlo 시뮬레이션 실행
      const simulator = new MonteCarloSimulator(
        extendedProject.schedule.schedule as any,
        {
          projectType: extendedProject.type,
          area: extendedProject.area,
          budget: extendedProject.budget,
          startDate: new Date(extendedProject.startDate),
          currentState: extendedProject.currentState,
          weatherSensitivity: extendedProject.weatherSensitivity,
          complexity: extendedProject.complexity,
          scheduleFlexibility: extendedProject.scheduleFlexibility
        }
      )
      const result = simulator.runSimulation()
      setSimulationResult(result as any)
    }
    setIsAnalyzing(false)
  }, [extendedProject])

  // Critical tasks 계산 - 모든 Hook은 조건문 전에 호출되어야 함
  const criticalTasks = useMemo(() => 
    extendedProject?.schedule?.schedule.filter((task: Task) => 
      extendedProject?.schedule?.criticalPath.includes(task.id)
    ) || [],
    [extendedProject?.schedule]
  )

  // Early returns after all hooks
  if (!projectId) {
    router.push('/')
    return null
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="프로젝트를 불러오는 중..." />
  }

  if (error) {
    return <ErrorMessage error={error} fullScreen />
  }

  if (!extendedProject) {
    router.push('/')
    return null
  }

  // CPM 분석 중일 때
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CPMAnalysisProgress 
          isAnalyzing={isAnalyzing}
          onComplete={handleAnalysisComplete}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">일정 생성 완료</h1>
          <p className="text-gray-600">
            CPM 알고리즘과 Monte Carlo 시뮬레이션을 통해 최적화된 프로젝트 일정이 생성되었습니다.
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          tabs={[
            { id: 'schedule', label: '기본 일정' },
            { id: 'risk', label: '리스크 분석' },
            { id: 'optimization', label: '최적화 제안' }
          ]}
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab as TabType)} 
        />

        {/* Project Summary */}
        <ProjectSummary project={extendedProject} />

        {/* Tab Content */}
        {activeTab === 'schedule' && (
          <ScheduleTab project={extendedProject} criticalTasks={criticalTasks} />
        )}

        {activeTab === 'risk' && simulationResult && simulationResult.percentiles && (
          <RiskTab project={extendedProject} simulationResult={simulationResult} />
        )}

        {activeTab === 'optimization' && (
          <OptimizationTab project={extendedProject} simulationResult={simulationResult} />
        )}

        {/* Action Buttons */}
        <ActionButtons projectId={extendedProject.id} />
      </div>
    </div>
  )
}

export default function ScheduleResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="페이지를 불러오는 중..." />}>
      <ScheduleResultsContent />
    </Suspense>
  )
}