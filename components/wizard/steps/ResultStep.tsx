"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, BarChart3, Clock, TrendingUp, CheckCircle, 
  AlertTriangle, Sparkles, Download, Share2, Eye,
  DollarSign, Users, CloudRain, Layers
} from "lucide-react"
import { extractTasksFromSpaces, calculateOptimalSchedule, generateGanttChartData } from "@/lib/scheduleGenerator"
import { SpaceSelection, ScheduleInfo, ProjectBasicInfo, GanttChartData } from "@/lib/types"
import GanttChart from "@/components/visualizations/GanttChart"
import DraggableGanttChart from "@/components/visualizations/DraggableGanttChart"
import CalendarView from "@/components/visualizations/CalendarView"

interface ResultStepProps {
  wizardData: {
    spaces: any[]
    budget: number
    scheduleData: {
      startDate: Date
      endDate: Date
      expertise: "beginner" | "intermediate" | "expert"
      environment: {
        season: "spring" | "summer" | "fall" | "winter"
        buildingAge: number
        weatherConsideration: boolean
      }
      probabilisticForecast?: any
    }
  }
  onEdit: () => void
}

export default function ResultStep({ wizardData, onEdit }: ResultStepProps) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedSchedule, setGeneratedSchedule] = useState<GanttChartData | null>(null)
  const [activeTab, setActiveTab] = useState("gantt")
  const [showDraggableHint, setShowDraggableHint] = useState(false)
  const [useDraggableGantt, setUseDraggableGantt] = useState(true)

  useEffect(() => {
    generateSchedule()
  }, [])

  const generateSchedule = async () => {
    setIsGenerating(true)
    
    try {
      // SpaceSelection 형식으로 변환
      const spaces: SpaceSelection[] = wizardData.spaces.map(space => ({
        id: space.id,
        name: space.name,
        selected: true,
        actualArea: 10, // 기본값
        scope: space.works.length > 2 ? 'full' : 'partial',
        tasks: {
          electrical: space.works.some((w: any) => w.category === 'electrical'),
          plumbing: space.works.some((w: any) => w.category === 'plumbing'),
          flooring: space.works.filter((w: any) => w.category === 'flooring').map(() => 'tile'),
          walls: space.works.filter((w: any) => w.category === 'painting').map(() => 'paint'),
          ...(space.id === 'kitchen' && {
            sink: space.works.some((w: any) => w.id.includes('sink')) ? 'full_replace' : undefined
          }),
          ...(space.id === 'bathroom' && {
            renovation: space.works.some((w: any) => w.id.includes('waterproof')) ? 'waterproof' : 'tile_only'
          })
        }
      }))

      // 프로젝트 기본 정보
      const projectInfo: ProjectBasicInfo = {
        totalArea: spaces.length * 10,
        housingType: 'apartment',
        residenceStatus: 'occupied',
        preferredStyle: 'modern',
        projectDuration: `${Math.ceil((wizardData.scheduleData.endDate.getTime() - wizardData.scheduleData.startDate.getTime()) / (1000 * 60 * 60 * 24))}일`
      }

      // 스케줄 정보
      const scheduleInfo: ScheduleInfo = {
        startDate: wizardData.scheduleData.startDate,
        workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        dailyWorkHours: { start: '09:00', end: '18:00' },
        unavailablePeriods: [],
        noiseRestrictions: 'weekdays_only',
        residenceStatus: 'live_in'
      }

      // 1. 작업 추출
      const tasks = extractTasksFromSpaces(spaces)
      
      // 2. 최적 일정 계산
      const { tasks: scheduledTasks, criticalPath, totalDays } = calculateOptimalSchedule(
        tasks,
        projectInfo,
        scheduleInfo
      )
      
      // 3. 간트차트 데이터 생성
      const ganttData = generateGanttChartData(scheduledTasks, scheduleInfo, totalDays)
      
      console.log('Generated Gantt Data:', ganttData)
      console.log('Tasks count:', ganttData?.tasks?.length)
      console.log('Total days:', ganttData?.totalDays)
      
      if (!ganttData || !ganttData.tasks || ganttData.tasks.length === 0) {
        throw new Error('간트차트 데이터가 비어있습니다. 선택된 작업을 확인해주세요.')
      }
      
      setGeneratedSchedule(ganttData)
    } catch (error) {
      console.error('공정표 생성 오류:', error)
      console.error('Error details:', error.stack)
      alert('공정표 생성 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'))
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
      }, 2000)
    }
  }

  const getTotalCost = () => {
    if (!generatedSchedule) return 0
    return generatedSchedule.tasks.reduce((sum, task) => sum + task.estimatedCost, 0)
  }

  const getCriticalTaskCount = () => {
    if (!generatedSchedule) return 0
    return generatedSchedule.tasks.filter(t => t.isCritical).length
  }

  const getRiskLevel = () => {
    if (!wizardData.scheduleData.probabilisticForecast) return "medium"
    const variance = wizardData.scheduleData.probabilisticForecast.p90Duration - 
                    wizardData.scheduleData.probabilisticForecast.p10Duration
    if (variance > 15) return "high"
    if (variance < 10) return "low"
    return "medium"
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-white rounded-lg p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Sparkles className="w-16 h-16 text-orange-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI가 최적의 공정표를 생성 중입니다...</h3>
        <p className="text-gray-600">선택하신 조건을 바탕으로 맞춤형 일정을 계산하고 있어요</p>
        <div className="mt-6 flex space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-3 h-3 bg-orange-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-3 h-3 bg-amber-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-3 h-3 bg-yellow-500 rounded-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 성공 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white">
            <CheckCircle className="w-12 h-12" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          🎉 AI 공정표가 완성되었어요!
        </h2>
        <p className="text-lg text-gray-600">맞춤형 인테리어 계획이 준비되었습니다</p>
      </motion.div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">총 기간</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {generatedSchedule?.timeline.totalDays || 0}일
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">예상 비용</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(getTotalCost() / 10000).toLocaleString()}만원
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">작업 수</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {generatedSchedule?.tasks.length || 0}개
                  </p>
                </div>
                <Layers className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`bg-gradient-to-br border-200 ${
            getRiskLevel() === "high" ? "from-red-50 to-red-100 border-red-200" :
            getRiskLevel() === "low" ? "from-green-50 to-green-100 border-green-200" :
            "from-yellow-50 to-yellow-100 border-yellow-200"
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    getRiskLevel() === "high" ? "text-red-700" :
                    getRiskLevel() === "low" ? "text-green-700" :
                    "text-yellow-700"
                  }`}>리스크</p>
                  <p className={`text-2xl font-bold ${
                    getRiskLevel() === "high" ? "text-red-900" :
                    getRiskLevel() === "low" ? "text-green-900" :
                    "text-yellow-900"
                  }`}>
                    {getRiskLevel() === "high" ? "높음" :
                     getRiskLevel() === "low" ? "낮음" : "보통"}
                  </p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${
                  getRiskLevel() === "high" ? "text-red-500" :
                  getRiskLevel() === "low" ? "text-green-500" :
                  "text-yellow-500"
                }`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 메인 결과 탭 */}
      <Card className="mb-8 bg-white border-orange-200">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b bg-orange-50 p-0">
              <TabsTrigger 
                value="gantt" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white text-gray-700 data-[state=active]:text-orange-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                간트차트
              </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white text-gray-700 data-[state=active]:text-orange-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                캘린더
              </TabsTrigger>
              <TabsTrigger 
                value="summary"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white text-gray-700 data-[state=active]:text-orange-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                요약 분석
              </TabsTrigger>
            </TabsList>

            <div className="p-6 bg-white">
              <TabsContent value="gantt" className="mt-0 bg-white">
                {generatedSchedule ? (
                  useDraggableGantt ? (
                    <DraggableGanttChart 
                      data={generatedSchedule}
                      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                      onTaskUpdate={(taskId, updates) => {
                        console.log('Task updated:', taskId, updates)
                      }}
                      onScheduleUpdate={(updatedData) => {
                        setGeneratedSchedule(updatedData)
                        console.log('Schedule updated:', updatedData)
                      }}
                    />
                  ) : (
                    <GanttChart 
                      data={generatedSchedule}
                      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">간트차트를 생성하는 중입니다...</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                {generatedSchedule && (
                  <CalendarView 
                    data={generatedSchedule}
                    onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
                  />
                )}
              </TabsContent>

              <TabsContent value="summary" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 공간별 작업 분포 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🏠 공간별 작업 분포</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {wizardData.spaces.map(space => {
                        const spaceTasks = generatedSchedule?.tasks.filter(t => t.space === space.name) || []
                        const spaceCost = spaceTasks.reduce((sum, task) => sum + task.estimatedCost, 0)
                        
                        return (
                          <div key={space.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{space.icon}</span>
                              <span className="font-medium">{space.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{spaceTasks.length}개 작업</div>
                              <div className="text-sm text-gray-600">
                                {Math.round(spaceCost / 10000).toLocaleString()}만원
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {/* AI 인사이트 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🤖 AI 분석 인사이트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatedSchedule?.insights.warnings.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="font-medium text-red-900 mb-1">⚠️ 주의사항</p>
                          <ul className="space-y-1">
                            {generatedSchedule.insights.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm text-red-700">• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {generatedSchedule?.insights.suggestions.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-900 mb-1">💡 개선 제안</p>
                          <ul className="space-y-1">
                            {generatedSchedule.insights.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-blue-700">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 중요 경로 정보 */}
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-900 mb-1">🎯 중요 경로</p>
                        <p className="text-sm text-purple-700">
                          {getCriticalTaskCount()}개의 작업이 전체 공기를 좌우합니다
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={onEdit}
          className="border-orange-300 text-orange-700 hover:bg-orange-50 bg-white"
        >
          <Eye className="w-5 h-5 mr-2" />
          수정하기
        </Button>
        <Button
          size="lg"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          <Download className="w-5 h-5 mr-2" />
          공정표 다운로드
        </Button>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        >
          <Share2 className="w-5 h-5 mr-2" />
          공유하기
        </Button>
      </div>
    </div>
  )
}