'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { AlertTriangle, Cloud, Calendar, TrendingUp } from 'lucide-react'

interface RiskDashboardProps {
  tasks: Task[]
  projectStartDate: Date
}

interface RiskFactor {
  id: string
  title: string
  level: 'low' | 'medium' | 'high'
  description: string
  icon: React.ReactNode
  action: string
}

export function RiskDashboard({ tasks, projectStartDate }: RiskDashboardProps) {
  const [currentRiskLevel, setCurrentRiskLevel] = useState<'low' | 'medium' | 'high'>('low')
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([])

  useEffect(() => {
    analyzeRisks()
  }, [tasks])

  const analyzeRisks = () => {
    const factors: RiskFactor[] = []
    
    // 1. 지연 리스크 분석
    const today = new Date()
    const delayedTasks = tasks.filter(task => {
      if (!task.endDate || !task.progress) return false
      const expectedProgress = calculateExpectedProgress(task, today)
      return task.progress < expectedProgress - 10 // 10% 이상 지연
    })

    if (delayedTasks.length > 0) {
      factors.push({
        id: 'delay',
        title: '일정 지연',
        level: delayedTasks.length > 3 ? 'high' : 'medium',
        description: `${delayedTasks.length}개 작업이 예정보다 늦어지고 있습니다`,
        icon: <Calendar className="w-5 h-5" />,
        action: '지연 작업에 추가 인력 투입 필요'
      })
    }

    // 2. 날씨 리스크 (외부 작업 체크)
    const outdoorTasks = tasks.filter(task => 
      task.weatherDependent && task.progress !== undefined && task.progress < 100
    )
    
    if (outdoorTasks.length > 0) {
      factors.push({
        id: 'weather',
        title: '날씨 영향',
        level: outdoorTasks.length > 2 ? 'medium' : 'low',
        description: `${outdoorTasks.length}개의 외부 작업이 날씨 영향을 받을 수 있습니다`,
        icon: <Cloud className="w-5 h-5" />,
        action: '날씨 예보 확인 및 대체 작업 준비'
      })
    }

    // 3. 임계 경로 리스크
    const criticalTasksInProgress = tasks.filter(task => 
      task.isCritical && task.progress !== undefined && task.progress > 0 && task.progress < 100
    )

    if (criticalTasksInProgress.length > 0) {
      factors.push({
        id: 'critical',
        title: '임계 작업 진행중',
        level: 'high',
        description: `${criticalTasksInProgress.length}개의 임계 작업이 전체 일정에 직접 영향`,
        icon: <AlertTriangle className="w-5 h-5" />,
        action: '임계 작업 집중 관리 및 자원 우선 배치'
      })
    }

    setRiskFactors(factors)
    
    // 전체 리스크 레벨 결정
    const highRiskCount = factors.filter(f => f.level === 'high').length
    const mediumRiskCount = factors.filter(f => f.level === 'medium').length
    
    if (highRiskCount > 0) {
      setCurrentRiskLevel('high')
    } else if (mediumRiskCount > 1) {
      setCurrentRiskLevel('medium')
    } else {
      setCurrentRiskLevel('low')
    }
  }

  const calculateExpectedProgress = (task: Task, currentDate: Date): number => {
    if (!task.startDate || !task.endDate) return 0
    
    const start = new Date(task.startDate).getTime()
    const end = new Date(task.endDate).getTime()
    const current = currentDate.getTime()
    
    if (current < start) return 0
    if (current > end) return 100
    
    return Math.round(((current - start) / (end - start)) * 100)
  }

  const getRiskLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
    }
  }

  const getRiskLevelBorderColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'border-green-200'
      case 'medium': return 'border-yellow-200'
      case 'high': return 'border-red-200'
    }
  }

  const getRiskLevelLabel = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '낮음'
      case 'medium': return '보통'
      case 'high': return '높음'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">리스크 현황</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(currentRiskLevel)}`}>
          전체 리스크: {getRiskLevelLabel(currentRiskLevel)}
        </div>
      </div>

      {riskFactors.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">현재 특별한 리스크 요인이 없습니다</p>
          <p className="text-sm text-gray-500 mt-1">프로젝트가 정상적으로 진행되고 있습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {riskFactors.map((factor) => (
            <div
              key={factor.id}
              className={`p-3 rounded-lg border ${getRiskLevelBorderColor(factor.level)} ${
                factor.level === 'high' ? 'bg-red-50' : factor.level === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getRiskLevelColor(factor.level)}`}>
                  {factor.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{factor.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getRiskLevelColor(factor.level)}`}>
                      {getRiskLevelLabel(factor.level)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    💡 {factor.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 권장 조치사항 */}
      {riskFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">권장 조치사항</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {currentRiskLevel === 'high' && (
              <>
                <li>• 일일 진행 상황 점검 회의 실시</li>
                <li>• 임계 작업에 추가 자원 투입 검토</li>
                <li>• 대안 일정 계획 수립</li>
              </>
            )}
            {currentRiskLevel === 'medium' && (
              <>
                <li>• 주 2-3회 진행 상황 모니터링</li>
                <li>• 리스크 요인별 대응 계획 준비</li>
              </>
            )}
            {currentRiskLevel === 'low' && (
              <li>• 정기적인 일정 점검 유지</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}