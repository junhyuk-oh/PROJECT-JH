'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProject } from '@/lib/taskDatabase'
import { Task } from '@/lib/types'
import Link from 'next/link'
import { CPMAnalysisProgress } from '@/components/CPMAnalysisProgress'
import { MonteCarloSimulator, SimulationResult } from '@/lib/monteCarloSimulator'

interface ScheduleData {
  schedule: Task[]
  criticalPath: string[]
  totalDuration: number
}

interface Project {
  id: string
  name: string
  type: string
  startDate: Date
  budget: number
  area: number
  currentState: string
  specificRequirements: string
  schedule: ScheduleData
  createdAt: string
}

function ScheduleResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedule' | 'risk' | 'optimization'>('schedule')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)

  const loadProject = useCallback(async () => {
    try {
      const projectData = await getProject(projectId!)
      if (!projectData) {
        router.push('/')
        return
      }
      setProject(projectData)
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => {
    if (!projectId) {
      router.push('/')
      return
    }

    loadProject()
  }, [projectId, router, loadProject])

  // CPM 분석 완료 핸들러
  const handleAnalysisComplete = useCallback(() => {
    if (project) {
      // Monte Carlo 시뮬레이션 실행
      const simulator = new MonteCarloSimulator(
        project.schedule.schedule,
        {
          projectType: project.type as any,
          area: project.area,
          budget: project.budget,
          startDate: new Date(project.startDate),
          currentState: project.currentState,
          // 리스크 평가 정보는 나중에 추가
        }
      )
      const result = simulator.runSimulation()
      setSimulationResult(result)
    }
    setIsAnalyzing(false)
  }, [project])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // CPM 분석 중일 때
  if (isAnalyzing && project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CPMAnalysisProgress 
          isAnalyzing={isAnalyzing}
          onComplete={handleAnalysisComplete}
        />
      </div>
    )
  }

  if (!project) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  const getTaskTypeColor = (type: string) => {
    const colors = {
      demolition: 'bg-red-100 text-red-700',
      construction: 'bg-blue-100 text-blue-700',
      electrical: 'bg-yellow-100 text-yellow-700',
      plumbing: 'bg-green-100 text-green-700',
      finishing: 'bg-purple-100 text-purple-700',
      inspection: 'bg-gray-100 text-gray-700',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const criticalTasks = project.schedule.schedule.filter(task => 
    project.schedule.criticalPath.includes(task.id)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">일정 생성 완료</h1>
          <p className="text-gray-600">
            CPM 알고리즘과 Monte Carlo 시뮬레이션을 통해 최적화된 프로젝트 일정이 생성되었습니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              기본 일정
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'risk'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              리스크 분석
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'optimization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              최적화 제안
            </button>
          </nav>
        </div>

        {/* 프로젝트 요약 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{project.name}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">프로젝트 타입</p>
              <p className="font-medium text-gray-900">
                {project.type === 'residential' ? '주거공간' :
                 project.type === 'bathroom' ? '욕실' :
                 project.type === 'kitchen' ? '주방' : '상업공간'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">예산</p>
              <p className="font-medium text-gray-900">{formatBudget(project.budget)}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">공간 크기</p>
              <p className="font-medium text-gray-900">{project.area}평</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">총 공사 기간</p>
              <p className="font-medium text-gray-900">{project.schedule.totalDuration}일</p>
            </div>
          </div>

          {project.specificRequirements && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">특별 요구사항</p>
              <p className="mt-1 text-gray-900">{project.specificRequirements}</p>
            </div>
          )}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'schedule' && (
          <>
            {/* 크리티컬 패스 */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">
            크리티컬 패스 (Critical Path)
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            아래 작업들은 프로젝트 전체 일정에 직접적인 영향을 미치는 중요 작업입니다.
          </p>
          <div className="space-y-2">
            {criticalTasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.name}</p>
                  <p className="text-sm text-gray-600">
                    {task.startDate ? formatDate(task.startDate) : 'TBD'} - {task.endDate ? formatDate(task.endDate) : 'TBD'} ({task.duration}일)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 일정 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 작업 일정</h3>
          
          <div className="space-y-3">
            {project.schedule.schedule.map((task) => {
              const isCritical = project.schedule.criticalPath.includes(task.id)
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border ${
                    isCritical ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </span>
                        {isCritical && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            크리티컬
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.name} 작업</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{task.startDate ? formatDate(task.startDate) : 'TBD'} - {task.endDate ? formatDate(task.endDate) : 'TBD'}</span>
                        <span>{task.duration}일</span>
                        {task.dependencies.length > 0 && (
                          <span>선행: {task.dependencies.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

          </>
        )}

        {/* 리스크 분석 탭 */}
        {activeTab === 'risk' && simulationResult && (
          <div className="space-y-6">
            {/* Monte Carlo 시뮬레이션 결과 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                확률적 공기 산정 결과
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">낙관적 (10% 확률)</p>
                  <p className="text-2xl font-bold text-blue-900">{simulationResult.p10}일</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">현실적 (50% 확률)</p>
                  <p className="text-2xl font-bold text-green-900">{simulationResult.p50}일</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-amber-600 mb-1">보수적 (90% 확률)</p>
                  <p className="text-2xl font-bold text-amber-900">{simulationResult.p90}일</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">평균 공기:</span>
                    <span className="ml-2 font-medium">{simulationResult.mean}일</span>
                  </div>
                  <div>
                    <span className="text-gray-600">표준편차:</span>
                    <span className="ml-2 font-medium">±{simulationResult.stdDev}일</span>
                  </div>
                  <div>
                    <span className="text-gray-600">신뢰도:</span>
                    <span className="ml-2 font-medium">{simulationResult.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">시뮬레이션:</span>
                    <span className="ml-2 font-medium">1,000회</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 주요 리스크 요인 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                주요 리스크 요인
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-medium text-gray-900">날씨 영향</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      외부 작업이 많아 우천 시 지연 가능성 있음
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      대응: 실내 작업 우선 진행, 우천 대비 일정 버퍼 확보
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 최적화 제안 탭 */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                일정 최적화 제안
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h4 className="font-medium text-gray-900">병렬 작업 기회</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      전기 배선과 배관 공사를 동시 진행하면 3일 단축 가능
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h4 className="font-medium text-gray-900">비용 절감 방안</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      DIY 가능 작업을 직접 수행 시 예산 20% 절감 가능
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3 mt-6">
          <Link
            href="/gantt"
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium text-center hover:bg-blue-600 transition-colors"
          >
            간트 차트 보기
          </Link>
          <Link
            href="/"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ScheduleResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ScheduleResultsContent />
    </Suspense>
  )
}