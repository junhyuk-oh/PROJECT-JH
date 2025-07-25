import React from 'react'
import { SimpleHistogram } from '@/components/charts/SimpleHistogram'
import { cn } from '@/lib/utils'

interface SimulationResult {
  percentiles: { p10: number; p50: number; p90: number }
  confidence: number
  standardDeviation: number
  histogram: Array<{ day: number; count: number }>
  mean?: number
  stdDev?: number
}

interface ExtendedProject {
  id: string
  name: string
  weatherSensitivity?: number
  complexity?: string
  scheduleFlexibility?: string
}

interface RiskTabProps {
  project: ExtendedProject
  simulationResult: SimulationResult
}

export const RiskTab = React.memo(function RiskTab({ project, simulationResult }: RiskTabProps) {
  const { percentiles } = simulationResult
  
  return (
    <div className="space-y-6">
      {/* Monte Carlo Simulation Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          확률적 공기 산정 결과
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ProbabilityCard
            label="낙관적 (10% 확률)"
            value={percentiles.p10}
            color="blue"
          />
          <ProbabilityCard
            label="현실적 (50% 확률)"
            value={percentiles.p50}
            color="green"
          />
          <ProbabilityCard
            label="보수적 (90% 확률)"
            value={percentiles.p90}
            color="amber"
          />
        </div>

        <SimulationStats result={simulationResult} />
      </div>

      {/* Probability Distribution Histogram */}
      <SimpleHistogram simulationResult={simulationResult as any} />

      {/* Risk Factors */}
      <RiskFactors project={project} />
    </div>
  )
})

interface ProbabilityCardProps {
  label: string
  value: number
  color: 'blue' | 'green' | 'amber'
}

const ProbabilityCard = React.memo(function ProbabilityCard({ label, value, color }: ProbabilityCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600'
  }

  return (
    <div className={cn(colorClasses[color], "rounded-lg p-4")}>
      <p className="text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}일</p>
    </div>
  )
})

interface SimulationStatsProps {
  result: SimulationResult
}

const SimulationStats = React.memo(function SimulationStats({ result }: SimulationStatsProps) {
  return (
    <div className="border-t pt-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <StatItem label="평균 공기" value={`${result.mean || Math.round(result.percentiles.p50)}일`} />
        <StatItem label="표준편차" value={`±${result.stdDev || result.standardDeviation}일`} />
        <StatItem label="신뢰도" value={`${result.confidence}%`} />
        <StatItem label="시뮬레이션" value="1,000회" />
      </div>
    </div>
  )
})

interface StatItemProps {
  label: string
  value: string
}

const StatItem = React.memo(function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <span className="text-gray-600">{label}:</span>
      <span className="ml-2 font-medium">{value}</span>
    </div>
  )
})

interface RiskFactorsProps {
  project: ExtendedProject
}

const RiskFactors = React.memo(function RiskFactors({ project }: RiskFactorsProps) {
  const factors = [
    {
      label: '날씨 민감도',
      value: project.weatherSensitivity ? `${project.weatherSensitivity}%` : '낮음',
      level: getWeatherLevel(project.weatherSensitivity || 0)
    },
    {
      label: '공사 복잡도',
      value: project.complexity || '보통',
      level: getComplexityLevel(project.complexity || 'normal')
    },
    {
      label: '일정 유연성',
      value: project.scheduleFlexibility || '보통',
      level: getFlexibilityLevel(project.scheduleFlexibility || 'normal')
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">리스크 요인 분석</h3>
      <div className="space-y-3">
        {factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700">{factor.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">{factor.value}</span>
              <RiskLevel level={factor.level} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

interface RiskLevelProps {
  level: 'low' | 'medium' | 'high'
}

const RiskLevel = React.memo(function RiskLevel({ level }: RiskLevelProps) {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  }

  const labels = {
    low: '낮음',
    medium: '보통',
    high: '높음'
  }

  return (
    <span className={cn(colors[level], "px-2 py-1 rounded text-xs font-medium")}>
      {labels[level]}
    </span>
  )
})

// Helper functions
function getWeatherLevel(sensitivity: number): 'low' | 'medium' | 'high' {
  if (sensitivity < 30) return 'low'
  if (sensitivity < 70) return 'medium'
  return 'high'
}

function getComplexityLevel(complexity: string): 'low' | 'medium' | 'high' {
  if (complexity === 'simple') return 'low'
  if (complexity === 'complex') return 'high'
  return 'medium'
}

function getFlexibilityLevel(flexibility: string): 'low' | 'medium' | 'high' {
  if (flexibility === 'flexible') return 'low'
  if (flexibility === 'strict') return 'high'
  return 'medium'
}