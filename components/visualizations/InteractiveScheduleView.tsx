"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar,
  Clock,
  Banknote,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GanttChartData } from "@/lib/types"
import { ProbabilisticPrediction } from "@/lib/ai/probabilisticScheduler"
import { ScenarioGenerator, Scenario } from "@/lib/ai/scenarioGenerator"
import { useResponsive } from "@/hooks/use-responsive"
import { GanttChart } from "./GanttChart"
import { CalendarView } from "./CalendarView"
import ProbabilisticPredictionView from "./ProbabilisticPredictionView"

interface InteractiveScheduleViewProps {
  baseGanttData: GanttChartData
  probabilisticPrediction: ProbabilisticPrediction
  baselineDuration: number
}

export default function InteractiveScheduleView({
  baseGanttData,
  probabilisticPrediction,
  baselineDuration
}: InteractiveScheduleViewProps) {
  const { isMobile } = useResponsive()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [activeView, setActiveView] = useState<'gantt' | 'calendar' | 'comparison'>('comparison')
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    // 시나리오 생성
    setTimeout(() => {
      const generator = new ScenarioGenerator(baseGanttData, probabilisticPrediction)
      const generatedScenarios = generator.generateScenarios()
      setScenarios(generatedScenarios)
      setSelectedScenario(generatedScenarios[1]) // 기본적으로 현실적 시나리오 선택
      setIsGenerating(false)
    }, 1000)
  }, [baseGanttData, probabilisticPrediction])

  if (isGenerating || scenarios.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h3 className={cn(
              "font-bold text-gray-800",
              isMobile ? "text-lg" : "text-xl"
            )}>
              시나리오를 생성하고 있습니다...
            </h3>
            <Progress value={75} className="w-64 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'optimistic':
        return 'from-green-500 to-emerald-500'
      case 'realistic':
        return 'from-blue-500 to-cyan-500'
      case 'conservative':
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getScenarioBorder = (type: string) => {
    switch (type) {
      case 'optimistic':
        return 'border-green-200 bg-green-50'
      case 'realistic':
        return 'border-blue-200 bg-blue-50'
      case 'conservative':
        return 'border-amber-200 bg-amber-50'
      default:
        return 'border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* 시나리오 선택 카드 */}
      <div className={cn(
        "gap-4",
        isMobile ? "grid grid-cols-1" : "grid md:grid-cols-3"
      )}>
        {scenarios.map((scenario) => (
          <Card
            key={scenario.type}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedScenario?.type === scenario.type
                ? getScenarioBorder(scenario.type)
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setSelectedScenario(scenario)}
          >
            <CardHeader className={cn(
              isMobile ? "pb-2" : "pb-3"
            )}>
              <CardTitle className={cn(
                "flex items-center justify-between",
                isMobile ? "text-base" : "text-lg"
              )}>
                <span className="flex items-center gap-2">
                  <span className={cn(
                    isMobile ? "text-xl" : "text-2xl"
                  )}>{scenario.emoji}</span>
                  {scenario.title}
                </span>
                {selectedScenario?.type === scenario.type && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {scenario.description}
              </p>
            </CardHeader>
            <CardContent className={cn(
              "space-y-3",
              isMobile && "pt-2"
            )}>
              {/* 주요 지표 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    기간
                  </span>
                  <span className="font-semibold">{scenario.metrics.duration}일</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Banknote className="h-4 w-4" />
                    비용
                  </span>
                  <span className="font-semibold">
                    {(scenario.metrics.cost / 10000).toLocaleString()}만원
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Shield className="h-4 w-4" />
                    신뢰도
                  </span>
                  <span className="font-semibold">{scenario.metrics.reliability}%</span>
                </div>
              </div>

              {/* 리스크 레벨 */}
              <div className="pt-2">
                <Badge 
                  variant={
                    scenario.metrics.riskLevel === 'low' ? 'default' :
                    scenario.metrics.riskLevel === 'medium' ? 'secondary' :
                    'destructive'
                  }
                  className="w-full justify-center"
                >
                  리스크: {
                    scenario.metrics.riskLevel === 'low' ? '낮음' :
                    scenario.metrics.riskLevel === 'medium' ? '보통' :
                    '높음'
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 시나리오 상세 정보 */}
      {selectedScenario && (
        <>
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {selectedScenario.emoji} {selectedScenario.title} 주요 특징
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedScenario.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 뷰 전환 탭 */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                시나리오 비교
              </TabsTrigger>
              <TabsTrigger value="gantt" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                간트차트
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                캘린더
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="mt-6">
              <ComparisonView 
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                baselineDuration={baselineDuration}
              />
            </TabsContent>

            <TabsContent value="gantt" className="mt-6">
              <GanttChart 
                data={selectedScenario.ganttData}
                onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
              />
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <CalendarView 
                data={selectedScenario.ganttData}
                onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
              />
            </TabsContent>
          </Tabs>

          {/* 경고 및 제안사항 */}
          <div className="grid md:grid-cols-2 gap-4">
            {selectedScenario.ganttData.insights.warnings.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <p className="font-semibold text-red-800 mb-2">주의사항</p>
                  <ul className="space-y-1">
                    {selectedScenario.ganttData.insights.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {selectedScenario.ganttData.insights.suggestions.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <p className="font-semibold text-blue-800 mb-2">최적화 제안</p>
                  <ul className="space-y-1">
                    {selectedScenario.ganttData.insights.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-blue-700">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// 시나리오 비교 뷰 컴포넌트
function ComparisonView({ 
  scenarios, 
  selectedScenario,
  baselineDuration 
}: { 
  scenarios: Scenario[]
  selectedScenario: Scenario
  baselineDuration: number
}) {
  const maxDuration = Math.max(...scenarios.map(s => s.metrics.duration))
  const maxCost = Math.max(...scenarios.map(s => s.metrics.cost))

  return (
    <div className="space-y-6">
      {/* 기간 비교 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5" />
            공사 기간 비교
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-xl">{scenario.emoji}</span>
                  {scenario.title}
                </span>
                <span className="font-bold text-lg">
                  {scenario.metrics.duration}일
                </span>
              </div>
              <Progress 
                value={(scenario.metrics.duration / maxDuration) * 100}
                className={cn(
                  "h-3",
                  selectedScenario.type === scenario.type && "ring-2 ring-offset-2 ring-purple-500"
                )}
              />
              <p className="text-xs text-gray-600">
                기본 예상 대비: {scenario.metrics.duration > baselineDuration ? '+' : ''}{scenario.metrics.duration - baselineDuration}일
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 비용 비교 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            예상 비용 비교
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-xl">{scenario.emoji}</span>
                  {scenario.title}
                </span>
                <span className="font-bold text-lg">
                  {(scenario.metrics.cost / 10000).toLocaleString()}만원
                </span>
              </div>
              <Progress 
                value={(scenario.metrics.cost / maxCost) * 100}
                className={cn(
                  "h-3",
                  selectedScenario.type === scenario.type && "ring-2 ring-offset-2 ring-purple-500"
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 신뢰도 및 리스크 매트릭스 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5" />
            신뢰도 vs 리스크 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 rounded-lg">
            {scenarios.map((scenario) => {
              const x = scenario.metrics.reliability
              const y = scenario.metrics.riskLevel === 'low' ? 20 : 
                       scenario.metrics.riskLevel === 'medium' ? 50 : 80
              
              return (
                <div
                  key={scenario.type}
                  className={cn(
                    "absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-2xl bg-white shadow-lg border-2 transition-all",
                    selectedScenario.type === scenario.type 
                      ? "ring-4 ring-purple-500 ring-offset-2 scale-110" 
                      : "hover:scale-105"
                  )}
                  style={{
                    left: `${x}%`,
                    bottom: `${y}%`
                  }}
                >
                  {scenario.emoji}
                </div>
              )
            })}
            
            {/* 축 레이블 */}
            <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-gray-600 -mb-6">
              신뢰도 →
            </div>
            <div className="absolute top-0 bottom-0 left-0 text-center text-sm text-gray-600 -ml-12 flex items-center">
              <span className="-rotate-90">리스크 →</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}