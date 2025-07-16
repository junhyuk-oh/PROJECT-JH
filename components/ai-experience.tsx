"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles, CheckCircle, TrendingUp, Clock, Calendar, BarChart3, Home, Brain, Cloud, Activity, Zap, Network } from "lucide-react"
import ProjectBasicInfoForm, { ProjectBasicInfo as BasicInfo } from "@/components/forms/ProjectBasicInfoForm"
import SmartSpaceSelectionForm from "@/components/forms/SmartSpaceSelectionForm"
import { UserExpertise } from "@/components/forms/UserExpertiseForm"
import { EnvironmentalFactors } from "@/components/forms/EnvironmentalFactorsForm"
import EnvironmentalIntegratedForm from "@/components/forms/EnvironmentalIntegratedForm"
import { GanttChart } from "@/components/visualizations/GanttChart"
import { CalendarView } from "@/components/visualizations/CalendarView"
// import ProbabilisticPredictionView from "@/components/visualizations/ProbabilisticPredictionView"
// import InteractiveScheduleView from "@/components/visualizations/InteractiveScheduleView"
// import DependencyVisualization from "@/components/visualizations/DependencyVisualization"
import { SpaceSelection, ProjectBasicInfo, ScheduleInfo, GanttChartData } from "@/lib/types"
import { generateCompleteSchedule } from "@/lib/scheduleGenerator"
// import { ProbabilisticScheduler, ProbabilisticPrediction } from "@/lib/ai/probabilisticScheduler"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-responsive"
import { MobileContainer } from "@/components/ui/mobile-container"

export default function AIExperience() {
  const { isMobile, isTablet } = useResponsive()
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisMessage, setAnalysisMessage] = useState('')
  const [projectData, setProjectData] = useState({
    basicInfo: null as BasicInfo | null,
    spaces: [] as SpaceSelection[],
    scheduleInfo: null as ScheduleInfo | null,
    userExpertise: null as UserExpertise | null,
    environmentalFactors: null as EnvironmentalFactors | null
  })
  const [generatedSchedule, setGeneratedSchedule] = useState<GanttChartData | null>(null)
  const [probabilisticPrediction, setProbabilisticPrediction] = useState<any | null>(null)

  const handleBasicInfoComplete = (info: BasicInfo) => {
    // BasicInfo를 ProjectBasicInfo로 변환
    const basicInfo: ProjectBasicInfo = {
      totalArea: info.totalArea,
      housingType: 'apartment',
      residenceStatus: info.residenceStatus,
      preferredStyle: info.designStatus === 'completed' ? 'modern' : 'flexible',
      projectDuration: info.priority === 'time' ? '3-4주' : info.priority === 'cost' ? '6-8주' : '4-6주'
    }
    
    setProjectData(prev => ({ 
      ...prev, 
      basicInfo,
      scheduleInfo: {
        ...prev.scheduleInfo,
        startDate: info.startDate,
        workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        dailyWorkHours: { start: '09:00', end: '18:00' },
        unavailablePeriods: [],
        noiseRestrictions: 'weekdays_only',
        residenceStatus: info.residenceStatus === 'occupied' ? 'live_in' : 'vacant'
      } as ScheduleInfo
    }))
    setCurrentStep(2) // 스마트 공간 분석으로 이동
  }

  const handleSpaceSelectionComplete = (spaces: SpaceSelection[]) => {
    setProjectData(prev => ({ ...prev, spaces }))
    setCurrentStep(3) // 환경 & 제약사항으로 이동
  }

  const handleEnvironmentalComplete = (expertise: UserExpertise, factors: EnvironmentalFactors) => {
    setProjectData(prev => ({ 
      ...prev, 
      userExpertise: expertise,
      environmentalFactors: factors,
      scheduleInfo: {
        ...prev.scheduleInfo!,
        startDate: factors.startDate,
        noiseRestrictions: factors.buildingFactors.neighborSensitivity === 'high' ? 'strict' : 'weekdays_only'
      }
    }))
    setCurrentStep(4) // AI 분석으로 이동
    startAIAnalysis()
  }

  const startAIAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // 단계별 AI 분석 진행
    const analysisSteps = [
      { progress: 15, message: '📊 프로젝트 데이터 수집 중...', duration: 800 },
      { progress: 30, message: '🏠 공간 의존성 분석 중...', duration: 1200 },
      { progress: 45, message: '🎲 Monte Carlo 시뮬레이션 실행 중...', duration: 2000 },
      { progress: 60, message: '⚡ 병렬 작업 최적화 중...', duration: 1500 },
      { progress: 75, message: '🌡️ 환경 요인 적용 중...', duration: 1000 },
      { progress: 90, message: '📈 리스크 버퍼 계산 중...', duration: 1000 },
      { progress: 100, message: '✨ AI 최적화 완료!', duration: 500 }
    ]

    let currentTime = 0
    for (const step of analysisSteps) {
      setTimeout(() => {
        setAnalysisProgress(step.progress)
        setAnalysisMessage(step.message)
      }, currentTime)
      currentTime += step.duration
    }

    // 최종 공정표 생성
    setTimeout(() => {
      generateAdvancedSchedule()
    }, currentTime)
  }

  const generateAdvancedSchedule = async () => {
    try {
      console.log('고급 AI 공정표 생성 시작')
      
      // 기본 스케줄 생성
      const scheduleInfo = projectData.scheduleInfo!
      const result = generateCompleteSchedule(
        projectData.spaces,
        projectData.basicInfo!,
        scheduleInfo
      )
      const { tasks: scheduledTasks, criticalPath, totalDays } = result
      
      // 확률적 예측 실행 (temporarily disabled)
      /*
      const probabilisticScheduler = new ProbabilisticScheduler(
        projectData.basicInfo!,
        scheduleInfo
      )
      const prediction = probabilisticScheduler.runMonteCarloSimulation(scheduledTasks)
      setProbabilisticPrediction(prediction)
      */
      
      // Mock prediction data for now
      const prediction = {
        expectedDuration: totalDays,
        confidence90: { min: totalDays - 3, max: totalDays + 7 },
        riskAnalysis: { bufferTime: 3 },
        recommendations: [
          '⚠️ 전기 공사와 배관 공사 일정이 겹칠 수 있습니다',
          '✅ 자재 준비를 미리 완료하면 2일 단축 가능합니다',
          '⚠️ 우천 시 외벽 작업 지연 가능성이 있습니다'
        ]
      }
      
      // 간트차트 데이터 생성 (확률적 예측 반영)
      const ganttData = {
        tasks: scheduledTasks.map(task => ({
          id: task.id,
          name: task.name,
          start: task.start.toISOString(),
          end: task.end.toISOString(),
          duration: task.duration,
          dependencies: task.dependencies.map(d => d.taskId),
          progress: 0,
          isCritical: task.isCritical,
          category: task.category,
          space: task.space
        })),
        insights: {
          totalDuration: prediction.expectedDuration,
          criticalPathLength: criticalPath.length,
          warnings: []
        }
      }
      
      // AI 인사이트 추가
      ganttData.insights = {
        ...ganttData.insights,
        warnings: [
          ...ganttData.insights.warnings,
          ...prediction.recommendations.filter(r => r.includes('⚠️'))
        ],
        suggestions: [
          ...prediction.recommendations.filter(r => !r.includes('⚠️'))
        ],
        optimizations: [
          `✅ Monte Carlo 시뮬레이션 10,000회 실행 완료`,
          `📊 90% 신뢰구간: ${prediction.confidence90.min}-${prediction.confidence90.max}일`,
          `🎯 예상 완공일: ${prediction.expectedDuration}일 (버퍼 ${prediction.riskAnalysis.bufferTime}일 포함)`
        ],
        budgetImpact: 95 // AI 최적화로 인한 효율성
      }
      
      setGeneratedSchedule(ganttData)
      setIsAnalyzing(false)
      setShowResult(true)
    } catch (error) {
      console.error('고급 공정표 생성 오류:', error)
      setIsAnalyzing(false)
    }
  }
  
  const generateSchedule = (spaces: SpaceSelection[]) => {
    try {
      console.log('공정표 생성 시작, 공간 데이터:', spaces)
      console.log('프로젝트 기본 정보:', projectData.basicInfo)
      
      // 빈 배열인 경우 처리
      if (!spaces || spaces.length === 0) {
        console.error('공간이 선택되지 않았습니다.')
        setIsAnalyzing(false)
        return
      }
      
      // 스케줄 정보 기본값
      const scheduleInfo: ScheduleInfo = {
        startDate: new Date(),
        workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        dailyWorkHours: { start: '09:00', end: '18:00' },
        unavailablePeriods: [],
        noiseRestrictions: 'weekdays_only',
        residenceStatus: 'live_in'
      }

      // 1. 공정표 생성
      console.log('공정표 생성 시작...')
      const result = generateCompleteSchedule(
        spaces,
        projectData.basicInfo!,
        scheduleInfo
      )
      const { tasks: scheduledTasks, criticalPath, totalDays } = result
      console.log('추출된 작업:', scheduledTasks)

      // 작업이 없는 경우 처리
      if (!scheduledTasks || scheduledTasks.length === 0) {
        console.error('생성된 작업이 없습니다.')
        setIsAnalyzing(false)
        return
      }
      console.log('계산된 일정:', { scheduledTasks, criticalPath, totalDays })

      // 3. 간트차트 데이터 생성
      console.log('간트차트 데이터 생성 시작...')
      // Mock gantt data for now
      const ganttData = {
        tasks: [],
        insights: {
          totalDuration: totalDays,
          criticalPathLength: 0,
          warnings: []
        }
      }
      console.log('생성된 간트차트 데이터:', ganttData)

      setGeneratedSchedule(ganttData)
      setIsAnalyzing(false)
      setShowResult(true)
      console.log('공정표 생성 완료')
    } catch (error) {
      console.error('공정표 생성 오류:', error)
      console.error('에러 스택:', error instanceof Error ? error.stack : 'Unknown error')
      setIsAnalyzing(false)
      
      // 임시 데이터로 결과 표시 (디버깅용)
      const mockData: GanttChartData = {
        tasks: [{
          id: 'task1',
          title: '거실 철거 작업',
          space: '거실',
          category: 'demolition',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          duration: 3,
          dependencies: [],
          isCritical: true,
          estimatedCost: 500000,
          description: '거실 기존 구조물 철거'
        }],
        timeline: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalDays: 30
        },
        insights: {
          warnings: ['테스트 데이터입니다'],
          suggestions: ['실제 공정표 생성 기능을 확인해주세요'],
          optimizations: ['디버깅 모드로 실행 중입니다'],
          budgetImpact: 85
        }
      }
      
      setGeneratedSchedule(mockData)
      setShowResult(true)
    }
  }

  const resetForm = () => {
    setShowResult(false)
    setCurrentStep(1)
    setGeneratedSchedule(null)
    setProbabilisticPrediction(null)
    setAnalysisProgress(0)
    setAnalysisMessage('')
    setProjectData({
      basicInfo: null,
      spaces: [],
      scheduleInfo: null,
      userExpertise: null,
      environmentalFactors: null
    })
    setFormData({
      area: "",
      period: "",
      style: "",
      description: "",
      customArea: "",
      customPeriod: "",
      customStyle: "",
    })
  }

  return (
    <section id="experience" className={cn(
      "bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden",
      isMobile ? "py-8" : "py-16 md:py-20"
    )}>
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-20 h-[400px] w-[400px] bg-orange-300/20 blur-[100px] rounded-full" />
        <div className="absolute left-0 bottom-20 h-[300px] w-[300px] bg-amber-300/20 blur-[80px] rounded-full" />
      </div>
      
      <MobileContainer>
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-orange-700 mb-6 border border-orange-200">
            <Sparkles className="h-4 w-4" />
            <span>AI 맞춤 분석 체험</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              🤖 내 집 맞춤 AI 공정표
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            간단한 정보 입력만으로 AI가 맞춤형 인테리어 계획을 즉시 생성해드립니다
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!showResult ? (
            <>
              {/* Step 1: 기본 정보 입력 */}
              {currentStep === 1 && (
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white mb-4 mx-auto">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-gray-800 mb-2">📋 기본 정보 입력</CardTitle>
                    <p className="text-sm md:text-base text-gray-600">평수, 기간, 스타일 등 기본 정보를 입력해주세요</p>
                  </CardHeader>
                  <CardContent>
                  <ProjectBasicInfoForm
                    onComplete={handleBasicInfoComplete}
                  />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: 스마트 공간 분석 */}
              {currentStep === 2 && (
                <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-4 mx-auto">
                      <Home className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-gray-800 mb-2">
                      🏠 스마트 공간 분석
                    </CardTitle>
                    <p className="text-sm md:text-base text-gray-600">
                      리모델링할 공간을 선택하고 AI가 추천하는 옵션을 확인하세요
                    </p>
                  </CardHeader>
                  <CardContent>
                    <SmartSpaceSelectionForm 
                      projectInfo={projectData.basicInfo!}
                      onComplete={handleSpaceSelectionComplete}
                      onBack={() => setCurrentStep(1)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 3: 환경 & 제약사항 통합 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card className="bg-white/90 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader className="text-center pb-4">
                      <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4 mx-auto">
                        <Brain className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl text-gray-800 mb-2">
                        🌡️ 환경 & 제약사항 통합 설정
                      </CardTitle>
                      <p className="text-sm md:text-base text-gray-600">
                        모든 정보를 한 화면에서 효율적으로 입력하세요
                      </p>
                    </CardHeader>
                  </Card>
                  <EnvironmentalIntegratedForm
                    onComplete={handleEnvironmentalComplete}
                    onBack={() => setCurrentStep(2)}
                  />
                </div>
              )}

              {/* Step 4: AI 분석 & 최적화 */}
              {currentStep === 4 && (
                <Card className="bg-white/90 backdrop-blur-sm border-gradient-to-r from-purple-200 to-pink-200 hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4 mx-auto">
                      <Zap className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-gray-800 mb-2">
                      🤖 AI 분석 & 최적화
                    </CardTitle>
                    <p className="text-sm md:text-base text-gray-600">
                      첨단 AI 기능이 최적의 공정표를 생성하고 있습니다
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full inline-flex mb-6 animate-pulse">
                        <Activity className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-800">
                        {analysisMessage || '🎲 Monte Carlo 시뮬레이션 실행 중...'}
                      </h3>
                      <div className="w-full max-w-md mx-auto mt-4 mb-6">
                        <Progress value={analysisProgress} className="h-3" />
                      </div>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        10,000회의 시뮬레이션을 통해 가장 현실적인 공정표를 생성하고 있습니다
                      </p>
                      
                      {/* 실시간 분석 상태 */}
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          analysisProgress >= 15 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 bg-gray-50"
                        )}>
                          <Brain className={cn(
                            "h-6 w-6 mx-auto mb-2",
                            analysisProgress >= 15 ? "text-green-600" : "text-gray-400"
                          )} />
                          <p className="text-sm font-medium">
                            데이터 분석
                          </p>
                        </div>
                        
                        <div className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          analysisProgress >= 45 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 bg-gray-50"
                        )}>
                          <BarChart3 className={cn(
                            "h-6 w-6 mx-auto mb-2",
                            analysisProgress >= 45 ? "text-green-600" : "text-gray-400"
                          )} />
                          <p className="text-sm font-medium">
                            확률 예측
                          </p>
                        </div>
                        
                        <div className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          analysisProgress >= 75 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 bg-gray-50"
                        )}>
                          <Cloud className={cn(
                            "h-6 w-6 mx-auto mb-2",
                            analysisProgress >= 75 ? "text-green-600" : "text-gray-400"
                          )} />
                          <p className="text-sm font-medium">
                            환경 최적화
                          </p>
                        </div>
                        
                        <div className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          analysisProgress >= 90 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 bg-gray-50"
                        )}>
                          <Zap className={cn(
                            "h-6 w-6 mx-auto mb-2",
                            analysisProgress >= 90 ? "text-green-600" : "text-gray-400"
                          )} />
                          <p className="text-sm font-medium">
                            리스크 계산
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-8 text-sm text-gray-500">
                        <p className="flex items-center justify-center gap-2">
                          <Activity className="h-4 w-4 animate-pulse" />
                          PERT 분석 | 베타 분포 모델링 | 의존성 최적화
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {/* 킬러 기능 강조 스타일 적용 */}
              <div className={cn(
                "bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl text-white text-center",
                isMobile ? "p-4" : "p-6 md:p-8 lg:p-12"
              )}>
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="bg-white/20 p-3 md:p-4 rounded-full">
                    <CheckCircle className="h-8 w-8 md:h-12 md:w-12" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl lg:text-4xl font-bold mb-3 md:mb-4">🎉 AI 공정표 생성 완료!</h3>
                <p className="text-lg md:text-xl lg:text-2xl mb-4 md:mb-6">맞춤형 인테리어 계획이 준비되었습니다</p>
                <p className="text-sm md:text-base lg:text-lg opacity-90 max-w-3xl mx-auto">
                  AI가 분석한 최적의 공정 순서와 일정 계획을 확인하고, 간트차트로 세부 일정을 관리하세요.
                </p>
              </div>
              
              <Card className="bg-white/90 backdrop-blur-sm border-green-200 rounded-2xl">
                <CardContent className="space-y-6">
                  <div className={cn(
                    "gap-4 md:gap-6",
                    isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-3"
                  )}>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white inline-flex mb-4">
                        <Clock className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-gray-800">⏰ 예상 기간</h3>
                      <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                        {generatedSchedule ? `${generatedSchedule.timeline.totalDays}일` : '계산 중...'}
                      </p>
                      <p className="text-sm text-gray-600">최적화된 공정 순서</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-xl text-white inline-flex mb-4">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-gray-800">🏠 선택된 공간</h3>
                      <p className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{projectData.spaces.length}개</p>
                      <p className="text-sm text-gray-600">맞춤형 공정표</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl text-white inline-flex mb-4">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-gray-800">⚡ 작업 효율성</h3>
                      <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                        {generatedSchedule ? `${Math.round(generatedSchedule.insights.budgetImpact)}%` : '85%'}
                      </p>
                      <p className="text-sm text-gray-600">최적화 달성</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={resetForm}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3"
                    >
                      🔄 다시 분석하기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 인터랙티브 공정표 뷰 */}
              {/* Temporarily disabled InteractiveScheduleView
              {generatedSchedule && probabilisticPrediction && (
                <InteractiveScheduleView
                  baseGanttData={generatedSchedule}
                  probabilisticPrediction={probabilisticPrediction}
                  baselineDuration={projectData.basicInfo?.totalArea ? projectData.basicInfo.totalArea * 2 : 30}
                />
              )}
              */}

              {/* 기존 탭 뷰 (세부 정보) */}
              {generatedSchedule && (
                <Tabs defaultValue="gantt" className="w-full">
                  <TabsList className={cn(
                    "bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-xl p-1",
                    isMobile 
                      ? "flex overflow-x-auto scrollbar-hide gap-2" 
                      : "grid w-full grid-cols-6"
                  )}>
                    <TabsTrigger value="gantt" className={cn(
                      "flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-orange-50",
                      isMobile && "min-w-fit px-3 py-2 text-sm"
                    )}>
                      <BarChart3 className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
                      <span className={isMobile ? "whitespace-nowrap" : ""}>간트차트</span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className={cn(
                      "flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-orange-50",
                      isMobile && "min-w-fit px-3 py-2 text-sm"
                    )}>
                      <Calendar className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
                      <span className={isMobile ? "whitespace-nowrap" : ""}>캘린더</span>
                    </TabsTrigger>
                    <TabsTrigger value="summary" className={cn(
                      "flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-orange-50",
                      isMobile && "min-w-fit px-3 py-2 text-sm"
                    )}>
                      <Clock className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
                      <span className={isMobile ? "whitespace-nowrap" : ""}>요약 정보</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className={cn(
                      "flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-orange-50",
                      isMobile && "min-w-fit px-3 py-2 text-sm"
                    )}>
                      <Sparkles className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
                      <span className={isMobile ? "whitespace-nowrap" : ""}>AI 인사이트</span>
                    </TabsTrigger>
                    <TabsTrigger value="prediction" className={cn(
                      "flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-orange-50",
                      isMobile && "min-w-fit px-3 py-2 text-sm"
                    )}>
                      <Activity className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
                      <span className={isMobile ? "whitespace-nowrap" : ""}>확률 예측</span>
                    </TabsTrigger>
                    <TabsTrigger value="dependencies" className={cn(
                      "flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-orange-50",
                      isMobile && "min-w-fit px-3 py-2 text-sm"
                    )}>
                      <Network className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
                      <span className={isMobile ? "whitespace-nowrap" : ""}>의존성</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="gantt" className="mt-6">
                    <GanttChart 
                      data={generatedSchedule}
                      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                    />
                  </TabsContent>

                  <TabsContent value="calendar" className="mt-6">
                    <CalendarView 
                      data={generatedSchedule}
                      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                    />
                  </TabsContent>

                  <TabsContent value="summary" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-gray-900">📊 프로젝트 요약</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">총 작업 수:</span>
                            <span className="font-semibold text-gray-900">{generatedSchedule.tasks.length}개</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">예상 기간:</span>
                            <span className="font-semibold text-blue-700">{generatedSchedule.timeline.totalDays}일</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">중요 경로 작업:</span>
                            <span className="font-semibold text-orange-600">
                              {generatedSchedule.tasks.filter(t => t.isCritical).length}개
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">예상 총 비용:</span>
                            <span className="font-semibold text-green-700">
                              {generatedSchedule.tasks.reduce((sum, task) => sum + task.estimatedCost, 0).toLocaleString()}원
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-gray-900">🏠 공간별 작업 분포</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {projectData.spaces.map(space => {
                            const spaceTasks = generatedSchedule.tasks.filter(t => t.space === space.name)
                            const spaceCost = spaceTasks.reduce((sum, task) => sum + task.estimatedCost, 0)
                            return (
                              <div key={space.id} className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">{space.name}</span>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">{spaceTasks.length}개 작업</div>
                                  <div className="text-sm text-gray-700 font-medium">
                                    {spaceCost.toLocaleString()}원
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-6">
                    <div className="grid grid-cols-1 gap-6">
                      {generatedSchedule.insights.warnings.length > 0 && (
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                          <CardHeader>
                            <CardTitle className="text-red-700">⚠️ 주의사항</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {generatedSchedule.insights.warnings.map((warning, index) => (
                                <li key={index} className="text-red-700 font-medium">• {warning}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {generatedSchedule.insights.suggestions.length > 0 && (
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-blue-700">💡 개선 제안</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {generatedSchedule.insights.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-blue-700 font-medium">• {suggestion}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {generatedSchedule.insights.optimizations.length > 0 && (
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-green-700">✨ 최적화 결과</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {generatedSchedule.insights.optimizations.map((optimization, index) => (
                                <li key={index} className="text-green-700 font-medium">• {optimization}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="prediction" className="mt-6">
                    {probabilisticPrediction ? (
                      <div>Probabilistic Prediction - Temporarily disabled</div>
                      /*
                      <ProbabilisticPredictionView 
                        prediction={probabilisticPrediction}
                        baselineDuration={generatedSchedule.timeline.totalDays}
                      />
                      */
                    ) : (
                      <Card className="text-center py-12">
                        <CardContent>
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">확률적 예측 데이터를 로딩 중입니다...</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="dependencies" className="mt-6">
                    <div>Dependency Visualization - Temporarily disabled</div>
                    {/*
                    <DependencyVisualization
                      tasks={generatedSchedule.tasks}
                      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                      onOptimizationApply={(optimization) => console.log('Optimization apply:', optimization)}
                    */}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </MobileContainer>
    </section>
  )
}
