'use client'

import { useState, useEffect } from 'react'

export interface AnalysisStep {
  id: string
  title: string
  description: string
  icon: string
  status: 'pending' | 'processing' | 'completed'
  progress?: number
}

interface CPMAnalysisProgressProps {
  onComplete?: () => void
  isAnalyzing: boolean
}

export function CPMAnalysisProgress({ onComplete, isAnalyzing }: CPMAnalysisProgressProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'data-collection',
      title: '데이터 수집',
      description: '프로젝트 정보 분석 중',
      icon: '📊',
      status: 'pending'
    },
    {
      id: 'dependency-analysis',
      title: '의존성 분석',
      description: '작업 간 관계 파악 중',
      icon: '🔗',
      status: 'pending'
    },
    {
      id: 'forward-pass',
      title: 'Forward Pass',
      description: '최조 착수일 계산 중',
      icon: '⏩',
      status: 'pending'
    },
    {
      id: 'backward-pass',
      title: 'Backward Pass',
      description: '최만 착수일 계산 중',
      icon: '⏪',
      status: 'pending'
    },
    {
      id: 'critical-path',
      title: 'Critical Path 추출',
      description: '임계 경로 식별 중',
      icon: '🎯',
      status: 'pending'
    },
    {
      id: 'monte-carlo',
      title: '확률 시뮬레이션',
      description: 'Monte Carlo 시뮬레이션 실행 중',
      icon: '🎲',
      status: 'pending',
      progress: 0
    },
    {
      id: 'optimization',
      title: '최적화 분석',
      description: '일정 최적화 방안 도출 중',
      icon: '💡',
      status: 'pending'
    },
    {
      id: 'finalization',
      title: '일정 생성 완료',
      description: '최종 일정표 작성 중',
      icon: '✅',
      status: 'pending'
    }
  ])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [monteCarloProgress, setMonteCarloProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) return

    // 각 단계를 순차적으로 진행
    const stepDuration = 800 // 각 단계별 소요 시간 (ms)
    const monteCarloStepIndex = 5 // Monte Carlo 시뮬레이션 단계 인덱스

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length) {
          clearInterval(interval)
          onComplete?.()
          return prev
        }

        // 현재 단계를 processing으로 변경
        setSteps((prevSteps) => 
          prevSteps.map((step, index) => {
            if (index === prev) {
              return { ...step, status: 'processing' }
            } else if (index < prev) {
              return { ...step, status: 'completed' }
            }
            return step
          })
        )

        // Monte Carlo 단계에서는 진행률 표시
        if (prev === monteCarloStepIndex) {
          let progress = 0
          const progressInterval = setInterval(() => {
            progress += 10
            setMonteCarloProgress(progress)
            setSteps((prevSteps) => 
              prevSteps.map((step, index) => 
                index === monteCarloStepIndex 
                  ? { ...step, progress } 
                  : step
              )
            )
            if (progress >= 100) {
              clearInterval(progressInterval)
            }
          }, stepDuration / 10)
        }

        return prev + 1
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [isAnalyzing, onComplete, steps.length])

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CPM 알고리즘 분석 중
        </h2>
        <p className="text-gray-600">
          최적의 프로젝트 일정을 생성하고 있습니다
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              step.status === 'completed' 
                ? 'bg-green-50 border-green-200'
                : step.status === 'processing'
                ? 'bg-blue-50 border-blue-300 shadow-sm'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {/* 아이콘 */}
            <div className={`text-3xl transition-transform ${
              step.status === 'processing' ? 'scale-110' : ''
            }`}>
              {step.icon}
            </div>

            {/* 내용 */}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                step.status === 'completed' 
                  ? 'text-green-700'
                  : step.status === 'processing'
                  ? 'text-blue-700'
                  : 'text-gray-700'
              }`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
              
              {/* Monte Carlo 진행률 바 */}
              {step.id === 'monte-carlo' && step.status === 'processing' && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>시뮬레이션 진행중...</span>
                    <span>{step.progress}% (1,000회)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 상태 표시 */}
            <div>
              {step.status === 'completed' && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {step.status === 'processing' && (
                <div className="w-6 h-6">
                  <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {step.status === 'pending' && (
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 전문 용어 설명 */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 알고리즘 설명</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <p><strong>CPM (Critical Path Method)</strong>: 프로젝트의 최단 완료 시간을 계산하는 기법</p>
          <p><strong>Forward/Backward Pass</strong>: 각 작업의 최조/최만 시작 시간을 계산</p>
          <p><strong>Monte Carlo</strong>: 무작위 시뮬레이션으로 불확실성을 고려한 예측</p>
        </div>
      </div>
    </div>
  )
}