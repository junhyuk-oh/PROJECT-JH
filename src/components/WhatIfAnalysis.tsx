'use client'

import { useState, useCallback } from 'react'
import { Task } from '@/types'
import { MonteCarloSimulator } from '@/lib/monteCarloSimulator'
import { AlertTriangle, Zap, Clock, Users, TrendingUp, RefreshCw } from 'lucide-react'

interface WhatIfAnalysisProps {
  tasks: Task[]
  projectData: {
    type: string
    area: number
    budget: number
    startDate: Date
    currentState: string
    weatherSensitivity?: number
    complexity?: string
    scheduleFlexibility?: string
  }
  originalDuration: number
}

interface Scenario {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  adjustments: {
    taskDelays?: { [taskId: string]: number }
    globalDelay?: number
    resourceBoost?: number
    weatherImpact?: number
  }
  color: string
}

export function WhatIfAnalysis({ tasks, projectData, originalDuration }: WhatIfAnalysisProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    newDuration: number
    impact: number
    criticalTasks: string[]
    recommendations: string[]
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const scenarios: Scenario[] = [
    {
      id: 'key-delay',
      title: '핵심 작업 지연',
      description: '철거, 전기, 설비 등 주요 공정이 2-3일씩 지연되는 경우',
      icon: <AlertTriangle className="w-5 h-5" />,
      adjustments: {
        taskDelays: {
          'demolition': 3,
          'electrical': 2,
          'plumbing': 2,
          'framing': 2
        }
      },
      color: 'orange'
    },
    {
      id: 'bad-weather',
      title: '악천후 영향',
      description: '장마철이나 태풍으로 외부 작업이 전반적으로 지연되는 경우',
      icon: <Clock className="w-5 h-5" />,
      adjustments: {
        weatherImpact: 30, // 30% 지연
        taskDelays: {
          'painting': 3,
          'window': 5,
          'demolition': 2
        }
      },
      color: 'blue'
    },
    {
      id: 'resource-shortage',
      title: '인력 부족',
      description: '숙련 기술자 부족으로 작업 효율이 20% 감소하는 경우',
      icon: <Users className="w-5 h-5" />,
      adjustments: {
        globalDelay: 20 // 20% 전체 지연
      },
      color: 'purple'
    },
    {
      id: 'fast-track',
      title: '일정 단축 시도',
      description: '추가 인력 투입과 병렬 작업으로 20% 단축을 시도하는 경우',
      icon: <Zap className="w-5 h-5" />,
      adjustments: {
        resourceBoost: -20 // 20% 단축
      },
      color: 'green'
    },
    {
      id: 'material-delay',
      title: '자재 수급 지연',
      description: '타일, 마루 등 마감재 수급이 일주일 지연되는 경우',
      icon: <TrendingUp className="w-5 h-5" />,
      adjustments: {
        taskDelays: {
          'tiling': 7,
          'flooring': 7,
          'kitchen': 5,
          'bathroom': 5
        }
      },
      color: 'red'
    }
  ]

  const analyzeScenario = useCallback(async (scenario: Scenario) => {
    setIsAnalyzing(true)
    
    try {
      // 시나리오에 따라 작업 기간 조정
      const adjustedTasks = tasks.map(task => {
        let newDuration = task.duration

        // 특정 작업 지연
        if (scenario.adjustments.taskDelays && scenario.adjustments.taskDelays[task.id]) {
          newDuration += scenario.adjustments.taskDelays[task.id]
        }

        // 전체 지연
        if (scenario.adjustments.globalDelay) {
          newDuration = Math.ceil(newDuration * (1 + scenario.adjustments.globalDelay / 100))
        }

        // 자원 증가로 인한 단축
        if (scenario.adjustments.resourceBoost) {
          newDuration = Math.ceil(newDuration * (1 + scenario.adjustments.resourceBoost / 100))
        }

        // 날씨 영향 (외부 작업만)
        if (scenario.adjustments.weatherImpact && task.weatherDependent) {
          newDuration = Math.ceil(newDuration * (1 + scenario.adjustments.weatherImpact / 100))
        }

        return {
          ...task,
          duration: Math.max(1, newDuration) // 최소 1일
        }
      })

      // Monte Carlo 시뮬레이션 실행
      const simulator = new MonteCarloSimulator(adjustedTasks as any, projectData as any)
      const result = simulator.runSimulation()

      // Critical Path 재계산
      const criticalTasks = findCriticalPath(adjustedTasks)

      // 영향 분석
      const impact = ((result.p50 - originalDuration) / originalDuration) * 100

      // 권장사항 생성
      const recommendations = generateRecommendations(scenario, impact, criticalTasks)

      setAnalysisResult({
        newDuration: result.p50,
        impact: Math.round(impact * 10) / 10,
        criticalTasks: criticalTasks.map(t => t.name),
        recommendations
      })
    } catch (error) {
      console.error('시나리오 분석 실패:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [tasks, projectData, originalDuration])

  const findCriticalPath = (tasks: Task[]): Task[] => {
    // 간단한 Critical Path 찾기 (실제로는 더 복잡한 알고리즘 필요)
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    const criticalTasks: Task[] = []
    
    // 의존성이 없는 작업부터 시작
    const startTasks = tasks.filter(t => t.dependencies.length === 0)
    
    // DFS로 가장 긴 경로 찾기
    const visited = new Set<string>()
    const findLongestPath = (taskId: string, path: Task[]): Task[] => {
      if (visited.has(taskId)) return path
      visited.add(taskId)
      
      const task = taskMap.get(taskId)
      if (!task) return path
      
      const newPath = [...path, task]
      const dependentTasks = tasks.filter(t => t.dependencies.includes(taskId))
      
      if (dependentTasks.length === 0) return newPath
      
      let longestPath = newPath
      for (const depTask of dependentTasks) {
        const subPath = findLongestPath(depTask.id, newPath)
        if (subPath.reduce((sum, t) => sum + t.duration, 0) > 
            longestPath.reduce((sum, t) => sum + t.duration, 0)) {
          longestPath = subPath
        }
      }
      
      return longestPath
    }
    
    for (const startTask of startTasks) {
      const path = findLongestPath(startTask.id, [])
      if (path.length > criticalTasks.length) {
        criticalTasks.length = 0
        criticalTasks.push(...path)
      }
    }
    
    return criticalTasks
  }

  const generateRecommendations = (
    scenario: Scenario, 
    impact: number, 
    criticalTasks: Task[]
  ): string[] => {
    const recommendations: string[] = []

    if (impact > 20) {
      recommendations.push('⚠️ 심각한 지연이 예상됩니다. 즉각적인 대응이 필요합니다.')
    }

    switch (scenario.id) {
      case 'key-delay':
        recommendations.push('🔧 지연된 작업에 추가 인력 투입 검토')
        recommendations.push('📅 후속 작업 일정 재조정 필요')
        recommendations.push('💰 추가 비용 발생 가능성 검토')
        break
      
      case 'bad-weather':
        recommendations.push('🏠 실내 작업 우선 진행')
        recommendations.push('📊 날씨 예보 모니터링 강화')
        recommendations.push('🛡️ 우천 대비 자재 보호 조치')
        break
      
      case 'resource-shortage':
        recommendations.push('👥 협력업체 추가 섭외 검토')
        recommendations.push('⏰ 작업 시간 연장 검토 (야간/주말)')
        recommendations.push('🎯 핵심 작업 우선순위 재배치')
        break
      
      case 'fast-track':
        recommendations.push('✅ 품질 관리 강화 필요')
        recommendations.push('🔄 병렬 작업 가능 공정 확인')
        recommendations.push('💡 안전사고 예방 조치 강화')
        break
      
      case 'material-delay':
        recommendations.push('📦 대체 자재 검토')
        recommendations.push('🚚 긴급 배송 옵션 확인')
        recommendations.push('📋 타 공정 우선 진행 검토')
        break
    }

    if (criticalTasks.length > 0) {
      recommendations.push(`🎯 임계 작업 집중 관리: ${criticalTasks.slice(0, 3).join(', ')}`)
    }

    return recommendations
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What-if 시나리오 분석
        </h3>
        <p className="text-sm text-gray-600">
          다양한 상황을 가정하고 프로젝트 일정에 미치는 영향을 분석해보세요.
        </p>
      </div>

      {/* 시나리오 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => {
              setSelectedScenario(scenario.id)
              analyzeScenario(scenario)
            }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedScenario === scenario.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                scenario.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                scenario.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                scenario.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                scenario.color === 'green' ? 'bg-green-100 text-green-600' :
                'bg-red-100 text-red-600'
              }`}>
                {scenario.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 분석 결과 */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">시나리오 분석 중...</p>
        </div>
      )}

      {!isAnalyzing && analysisResult && selectedScenario && (
        <div className="space-y-4">
          {/* 영향도 요약 */}
          <div className={`p-4 rounded-lg ${
            analysisResult.impact > 20 ? 'bg-red-50 border border-red-200' :
            analysisResult.impact > 10 ? 'bg-yellow-50 border border-yellow-200' :
            analysisResult.impact < -10 ? 'bg-green-50 border border-green-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">영향 분석 결과</h4>
              <span className={`text-2xl font-bold ${
                analysisResult.impact > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {analysisResult.impact > 0 ? '+' : ''}{analysisResult.impact}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">원래 일정:</span>
                <span className="ml-2 font-medium">{originalDuration}일</span>
              </div>
              <div>
                <span className="text-gray-600">예상 일정:</span>
                <span className="ml-2 font-medium">{analysisResult.newDuration}일</span>
              </div>
            </div>
          </div>

          {/* 권장사항 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">권장 대응 방안</h4>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-800">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* 영향받는 임계 작업 */}
          {analysisResult.criticalTasks.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">주요 영향 작업</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.criticalTasks.map((task, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full border border-gray-300"
                  >
                    {task}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}