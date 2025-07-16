"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Calendar,
  Activity
} from "lucide-react"
import { ProbabilisticPrediction } from "@/lib/ai/probabilisticScheduler"
import { useResponsive } from "@/hooks/use-responsive"
import { cn } from "@/lib/utils"

interface ProbabilisticPredictionViewProps {
  prediction: ProbabilisticPrediction
  baselineDuration: number
}

export default function ProbabilisticPredictionView({ 
  prediction, 
  baselineDuration 
}: ProbabilisticPredictionViewProps) {
  const { isMobile } = useResponsive()
  
  // 완료 확률 차트 데이터 준비
  const maxProbability = Math.max(...prediction.riskAnalysis.completionProbability.map(p => p.probability))
  
  return (
    <div className="space-y-6">
      {/* 핵심 예측 결과 */}
      <div className={cn(
        "gap-4",
        isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-3"
      )}>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              예상 완공 기간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "font-bold text-blue-700",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              {prediction.expectedDuration}일
            </div>
            <p className="text-sm text-gray-600 mt-1">
              기본 예상: {baselineDuration}일
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              90% 신뢰구간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "font-bold text-green-700",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              {prediction.confidence90.min} - {prediction.confidence90.max}일
            </div>
            <p className="text-sm text-gray-600 mt-1">
              90% 확률로 이 기간 내 완공
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              권장 버퍼 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "font-bold text-amber-700",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              +{prediction.riskAnalysis.bufferTime}일
            </div>
            <p className="text-sm text-gray-600 mt-1">
              예상치 못한 지연 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 완료 확률 분포 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            완공 확률 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.riskAnalysis.completionProbability.map((prob, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className={cn(
                  "text-sm font-medium text-right",
                  isMobile ? "w-12" : "w-16"
                )}>
                  {prob.days}일
                </span>
                <div className="flex-1">
                  <Progress 
                    value={prob.probability} 
                    max={100}
                    className="h-6"
                  />
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  isMobile ? "w-10" : "w-12"
                )}>
                  {prob.probability}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Monte Carlo 시뮬레이션 10,000회 실행 결과
          </p>
        </CardContent>
      </Card>

      {/* 고위험 작업 분석 */}
      {prediction.riskAnalysis.highRiskTasks.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              고위험 작업 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.riskAnalysis.highRiskTasks.map((task, index) => (
                <div 
                  key={task.taskId} 
                  className={cn(
                    "flex items-center justify-between rounded-lg bg-red-50 border border-red-200",
                    isMobile ? "p-2" : "p-3"
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.taskName}</p>
                    <p className="text-sm text-gray-600">
                      변동성: {task.variability}%
                    </p>
                  </div>
                  <Badge 
                    variant={task.riskLevel === 'high' ? 'destructive' : 'secondary'}
                    className="ml-3"
                  >
                    {task.riskLevel === 'high' ? '고위험' : task.riskLevel === 'medium' ? '중위험' : '저위험'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 권장사항 */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Zap className="h-5 w-5" />
            AI 최적화 권장사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.recommendations.map((recommendation, index) => (
              <Alert key={index} className="bg-purple-50 border-purple-200">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-gray-700">
                  {recommendation}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 시뮬레이션 메타 정보 */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>🤖 AI 확률적 예측 엔진 v2.0</p>
        <p>Monte Carlo 시뮬레이션 | PERT 분석 | 베타 분포 모델링</p>
      </div>
    </div>
  )
}