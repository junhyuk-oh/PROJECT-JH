import React from 'react'
import { WhatIfAnalysis } from '@/components/WhatIfAnalysis'
import { Task } from '@/types'
import { TASK_ICONS } from '@/constants'

interface SimulationResult {
  percentiles: { p10: number; p50: number; p90: number }
  confidence: number
  standardDeviation: number
  histogram: Array<{ day: number; count: number }>
}

interface ExtendedProject {
  id: string
  name: string
  schedule: {
    schedule: Task[]
    totalDuration: number
    criticalPath: string[]
  }
}

interface OptimizationTabProps {
  project: ExtendedProject
  simulationResult: SimulationResult | null
}

export const OptimizationTab = React.memo(function OptimizationTab({ project, simulationResult }: OptimizationTabProps) {
  const parallelOpportunities = findParallelOpportunities(project.schedule.schedule)
  const costSavingTips = generateCostSavingTips(project.schedule.schedule)

  return (
    <div className="space-y-6">
      {/* Parallel Work Opportunities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">병렬 작업 기회</h3>
        {parallelOpportunities.length > 0 ? (
          <div className="space-y-3">
            {parallelOpportunities.map((opp, index) => (
              <OpportunityItem key={index} opportunity={opp} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">현재 일정은 이미 최적화되어 있습니다.</p>
        )}
      </div>

      {/* Cost Saving Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">비용 절감 팁</h3>
        <div className="space-y-3">
          {costSavingTips.map((tip, index) => (
            <TipItem key={index} tip={tip} />
          ))}
        </div>
      </div>

      {/* What-if Analysis */}
      {simulationResult && (
        <WhatIfAnalysis
          tasks={project.schedule.schedule}
          projectData={project as any}
          originalDuration={project.schedule.totalDuration}
        />
      )}
    </div>
  )
})

interface OpportunityItemProps {
  opportunity: {
    tasks: string[]
    potentialSaving: number
    description: string
  }
}

const OpportunityItem = React.memo(function OpportunityItem({ opportunity }: OpportunityItemProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-blue-900">{opportunity.description}</h4>
        <span className="text-blue-600 font-medium">-{opportunity.potentialSaving}일</span>
      </div>
      <p className="text-sm text-blue-700">
        작업: {opportunity.tasks.join(', ')}
      </p>
    </div>
  )
})

interface TipItemProps {
  tip: {
    icon: string
    title: string
    description: string
    savings: string
  }
}

const TipItem = React.memo(function TipItem({ tip }: TipItemProps) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{tip.icon}</span>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{tip.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
        <p className="text-sm text-green-600 font-medium mt-1">{tip.savings}</p>
      </div>
    </div>
  )
})

// Helper functions
function findParallelOpportunities(tasks: Task[]) {
  const opportunities = []
  
  // Group tasks by type and check if they can be done in parallel
  const tasksByType = tasks.reduce((acc, task) => {
    if (!acc[task.type]) acc[task.type] = []
    acc[task.type].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Check for parallel flooring/tiling opportunities
  if (tasksByType['flooring'] && tasksByType['tile']) {
    opportunities.push({
      tasks: ['바닥재 시공', '타일 시공'],
      potentialSaving: 2,
      description: '바닥재와 타일 작업을 다른 공간에서 동시 진행'
    })
  }

  // Check for parallel painting/wallpaper
  if (tasksByType['painting'] && tasksByType['wallpaper']) {
    opportunities.push({
      tasks: ['도장 작업', '도배 작업'],
      potentialSaving: 1,
      description: '도장과 도배를 다른 방에서 동시 진행'
    })
  }

  return opportunities
}

function generateCostSavingTips(tasks: Task[]) {
  const tips = []

  // DIY 가능 작업 확인
  const diyTasks = tasks.filter(task => task.diyPossible)
  if (diyTasks.length > 0) {
    tips.push({
      icon: '🛠️',
      title: 'DIY 가능 작업',
      description: `${diyTasks.map(t => t.name).join(', ')} 등은 직접 시공 가능합니다.`,
      savings: '약 30-50% 인건비 절감'
    })
  }

  // 자재 일괄 구매
  tips.push({
    icon: '📦',
    title: '자재 일괄 구매',
    description: '모든 자재를 한 번에 구매하면 배송비와 할인 혜택을 받을 수 있습니다.',
    savings: '5-10% 자재비 절감'
  })

  // 비수기 활용
  tips.push({
    icon: '📅',
    title: '비수기 활용',
    description: '봄/가을이 아닌 여름/겨울에 공사하면 인건비를 절약할 수 있습니다.',
    savings: '10-15% 인건비 절감'
  })

  // 패키지 계약
  tips.push({
    icon: '📋',
    title: '통합 업체 활용',
    description: '여러 공종을 한 업체에서 진행하면 할인을 받을 수 있습니다.',
    savings: '5-10% 전체 비용 절감'
  })

  return tips
}