"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, CheckCircle, TrendingUp, Clock, Calendar, BarChart3, Home } from "lucide-react"
import SpaceSelectionForm from "@/components/project/forms/SpaceSelectionForm"
import GanttChart from "@/components/project/visualizations/GanttChart"
import { SpaceSelection, ProjectBasicInfo, ScheduleInfo, GanttChartData } from "@/lib/types"
import { extractTasksFromSpaces, calculateOptimalSchedule, generateGanttChartData } from "@/lib/scheduleGenerator"

export default function AIExperience() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [projectData, setProjectData] = useState({
    basicInfo: null as ProjectBasicInfo | null,
    spaces: [] as SpaceSelection[],
    scheduleInfo: null as ScheduleInfo | null
  })
  const [generatedSchedule, setGeneratedSchedule] = useState<GanttChartData | null>(null)
  const [formData, setFormData] = useState({
    area: "",
    period: "",
    style: "",
    description: "",
    customArea: "",
    customPeriod: "",
    customStyle: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    // 기본 정보 추출 (일정 중심)
    const basicInfo: ProjectBasicInfo = {
      totalArea: parseInt(formData.customArea || formData.area.replace(/[^0-9]/g, '')) || 25,
      housingType: 'apartment',
      residenceStatus: 'occupied',
      preferredStyle: formData.customStyle || formData.style || 'modern',
      projectDuration: formData.customPeriod || formData.period || '4-6주'
    }

    setProjectData(prev => ({ ...prev, basicInfo }))
    setCurrentStep(2)
    setIsAnalyzing(false)
  }

  const handleSpaceSelection = async (spaces: SpaceSelection[]) => {
    setProjectData(prev => ({ ...prev, spaces }))
    setIsAnalyzing(true)

    // AI 공정표 생성 시뮬레이션 (3초 후)
    setTimeout(() => {
      generateSchedule(spaces)
    }, 3000)
  }

  const generateSchedule = (spaces: SpaceSelection[]) => {
    try {
      // 스케줄 정보 기본값
      const scheduleInfo: ScheduleInfo = {
        startDate: new Date(),
        workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        dailyWorkHours: { start: '09:00', end: '18:00' },
        unavailablePeriods: [],
        noiseRestrictions: 'weekdays_only',
        residenceStatus: 'live_in'
      }

      // 1. 공간에서 작업 추출
      const tasks = extractTasksFromSpaces(spaces)

      // 2. 최적 일정 계산
      const { tasks: scheduledTasks, criticalPath, totalDays } = calculateOptimalSchedule(
        tasks,
        projectData.basicInfo!,
        scheduleInfo
      )

      // 3. 간트차트 데이터 생성
      const ganttData = generateGanttChartData(scheduledTasks, scheduleInfo, totalDays)

      setGeneratedSchedule(ganttData)
      setIsAnalyzing(false)
      setShowResult(true)
    } catch (error) {
      console.error('공정표 생성 오류:', error)
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setShowResult(false)
    setCurrentStep(1)
    setGeneratedSchedule(null)
    setProjectData({
      basicInfo: null,
      spaces: [],
      scheduleInfo: null
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
    <section id="experience" className="py-16 md:py-20 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-20 h-[400px] w-[400px] bg-orange-300/20 blur-[100px] rounded-full" />
        <div className="absolute left-0 bottom-20 h-[300px] w-[300px] bg-amber-300/20 blur-[80px] rounded-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
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
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📏 평수</label>
                      <select
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base text-gray-800 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="15평 이하">15평 이하</option>
                        <option value="16-25평">16-25평</option>
                        <option value="26-35평">26-35평</option>
                        <option value="36평 이상">36평 이상</option>
                        <option value="직접입력">직접 입력하기</option>
                      </select>
                      {formData.area === "직접입력" && (
                        <input
                          type="text"
                          className="w-full mt-2 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base text-gray-800 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                          placeholder="평수를 직접 입력해주세요 (예: 42평)"
                          value={formData.customArea}
                          onChange={(e) => setFormData({ ...formData, customArea: e.target.value })}
                          required
                        />
                      )}
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">⏰ 희망 기간</label>
                      <select
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base text-gray-800 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="2주">2주</option>
                        <option value="3-4주">3-4주</option>
                        <option value="5-6주">5-6주</option>
                        <option value="7-8주">7-8주</option>
                        <option value="8주 이상">8주 이상</option>
                        <option value="직접입력">직접 입력하기</option>
                      </select>
                      {formData.period === "직접입력" && (
                        <input
                          type="text"
                          className="w-full mt-2 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base text-gray-800 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                          placeholder="희망 기간을 직접 입력해주세요 (예: 10주)"
                          value={formData.customPeriod}
                          onChange={(e) => setFormData({ ...formData, customPeriod: e.target.value })}
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🎨 희망 스타일</label>
                      <select
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base text-gray-800 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="모던">모던</option>
                        <option value="미니멀">미니멀</option>
                        <option value="클래식">클래식</option>
                        <option value="빈티지">빈티지</option>
                        <option value="스칸디나비안">스칸디나비안</option>
                        <option value="직접입력">직접 입력하기</option>
                      </select>
                      {formData.style === "직접입력" && (
                        <input
                          type="text"
                          className="w-full mt-2 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base text-gray-800 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                          placeholder="희망 스타일을 직접 입력해주세요 (예: 인더스트리얼)"
                          value={formData.customStyle}
                          onChange={(e) => setFormData({ ...formData, customStyle: e.target.value })}
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 상세 설명 (선택사항)</label>
                    <textarea
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 text-sm md:text-base h-24 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                      placeholder="특별한 요구사항이나 선호하는 스타일에 대해 자세히 알려주세요..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-8 md:px-12 py-3 md:py-4 text-base md:text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />🔄 AI가 분석 중입니다...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          AI 맞춤 분석 시작하기
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: 공간 선택 */}
              {currentStep === 2 && (
                <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-4 mx-auto">
                      <Home className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-gray-800 mb-2">
                      🏠 공간별 상세 설정
                    </CardTitle>
                    <p className="text-sm md:text-base text-gray-600">
                      어떤 공간을 리모델링하실지 선택하고 상세 옵션을 설정해주세요
                    </p>
                  </CardHeader>
                  <CardContent>
                    {isAnalyzing ? (
                      <div className="text-center py-16">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full inline-flex mb-6">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">🤖 AI가 최적 공정표를 생성 중입니다...</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          선택하신 공간과 요구사항을 바탕으로 최적화된 공정 순서를 계산하고 있습니다. 잠시만 기다려주세요!
                        </p>
                        <div className="mt-6 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <SpaceSelectionForm 
                          totalArea={projectData.basicInfo?.totalArea || 25}
                          onComplete={handleSpaceSelection}
                        />
                        <div className="flex justify-center pt-6">
                          <Button
                            onClick={() => setCurrentStep(1)}
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50 px-6"
                          >
                            ← 이전 단계로
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {/* 킬러 기능 강조 스타일 적용 */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 md:p-8 lg:p-12 text-white text-center">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* 탭으로 공정표 및 분석 결과 표시 */}
              {generatedSchedule && (
                <Tabs defaultValue="gantt" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="gantt" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      간트차트
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      요약 정보
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI 인사이트
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="gantt" className="mt-6">
                    <GanttChart 
                      data={generatedSchedule}
                      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                    />
                  </TabsContent>

                  <TabsContent value="summary" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>📊 프로젝트 요약</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span>총 작업 수:</span>
                            <span className="font-semibold">{generatedSchedule.tasks.length}개</span>
                          </div>
                          <div className="flex justify-between">
                            <span>예상 기간:</span>
                            <span className="font-semibold text-blue-600">{generatedSchedule.timeline.totalDays}일</span>
                          </div>
                          <div className="flex justify-between">
                            <span>중요 경로 작업:</span>
                            <span className="font-semibold text-red-600">
                              {generatedSchedule.tasks.filter(t => t.isCritical).length}개
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>예상 총 비용:</span>
                            <span className="font-semibold text-green-600">
                              {generatedSchedule.tasks.reduce((sum, task) => sum + task.estimatedCost, 0).toLocaleString()}원
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>🏠 공간별 작업 분포</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {projectData.spaces.map(space => {
                            const spaceTasks = generatedSchedule.tasks.filter(t => t.space === space.name)
                            const spaceCost = spaceTasks.reduce((sum, task) => sum + task.estimatedCost, 0)
                            return (
                              <div key={space.id} className="flex justify-between items-center">
                                <span>{space.name}</span>
                                <div className="text-right">
                                  <div className="font-semibold">{spaceTasks.length}개 작업</div>
                                  <div className="text-sm text-gray-500">
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
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-red-600">⚠️ 주의사항</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {generatedSchedule.insights.warnings.map((warning, index) => (
                                <li key={index} className="text-red-600">• {warning}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {generatedSchedule.insights.suggestions.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-blue-600">💡 개선 제안</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {generatedSchedule.insights.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-blue-600">• {suggestion}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {generatedSchedule.insights.optimizations.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-green-600">✨ 최적화 결과</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {generatedSchedule.insights.optimizations.map((optimization, index) => (
                                <li key={index} className="text-green-600">• {optimization}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
