"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  GitBranch,
  Zap,
  Clock,
  Users,
  Shuffle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Network
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/types"
import { DependencyAnalyzer, DependencyAnalysis, DependencyConflict } from "@/lib/ai/dependencyAnalyzer"
import { useResponsive } from "@/hooks/use-responsive"

interface DependencyVisualizationProps {
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
  onOptimizationApply?: (optimization: any) => void
}

export default function DependencyVisualization({
  tasks,
  onTaskClick,
  onOptimizationApply
}: DependencyVisualizationProps) {
  const { isMobile } = useResponsive()
  const [analysis, setAnalysis] = useState<DependencyAnalysis | null>(null)
  const [selectedConflict, setSelectedConflict] = useState<DependencyConflict | null>(null)
  const [activeView, setActiveView] = useState<'conflicts' | 'network' | 'optimizations'>('conflicts')
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    // 의존성 분석 실행
    setTimeout(() => {
      const analyzer = new DependencyAnalyzer(tasks)
      const result = analyzer.analyzeDependencies()
      setAnalysis(result)
      setIsAnalyzing(false)
    }, 500)
  }, [tasks])

  if (isAnalyzing || !analysis) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
              <Network className="h-6 w-6 text-white" />
            </div>
            <h3 className={cn(
              "font-bold text-gray-800",
              isMobile ? "text-base" : "text-lg"
            )}>
              의존성을 분석하고 있습니다...
            </h3>
            <Progress value={66} className="w-48 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'circular':
        return <Shuffle className="h-4 w-4" />
      case 'resource':
        return <Users className="h-4 w-4" />
      case 'sequence':
        return <GitBranch className="h-4 w-4" />
      case 'parallel':
        return <Zap className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const conflictStats = {
    critical: analysis.conflicts.filter(c => c.severity === 'critical').length,
    warning: analysis.conflicts.filter(c => c.severity === 'warning').length,
    info: analysis.conflicts.filter(c => c.severity === 'info').length
  }

  const totalSavings = analysis.optimizations.reduce((sum, opt) => sum + opt.savingDays, 0)

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className={cn(
        "gap-4",
        isMobile ? "grid grid-cols-2" : "grid md:grid-cols-4"
      )}>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className={cn(
            isMobile ? "pb-1" : "pb-2"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-xs" : "text-sm"
            )}>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              심각한 충돌
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "font-bold text-red-700",
              isMobile ? "text-xl" : "text-2xl"
            )}>{conflictStats.critical}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className={cn(
            isMobile ? "pb-1" : "pb-2"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-xs" : "text-sm"
            )}>
              <AlertCircle className="h-4 w-4 text-amber-600" />
              경고
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "font-bold text-amber-700",
              isMobile ? "text-xl" : "text-2xl"
            )}>{conflictStats.warning}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className={cn(
            isMobile ? "pb-1" : "pb-2"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-xs" : "text-sm"
            )}>
              <Info className="h-4 w-4 text-blue-600" />
              개선 가능
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "font-bold text-blue-700",
              isMobile ? "text-xl" : "text-2xl"
            )}>{conflictStats.info}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              절감 가능 일수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{totalSavings}일</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            충돌 분석
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            의존성 네트워크
          </TabsTrigger>
          <TabsTrigger value="optimizations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            최적화 제안
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conflicts" className="mt-4 space-y-4">
          {analysis.conflicts.length === 0 ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                의존성 충돌이 발견되지 않았습니다. 잘 계획된 일정입니다!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {analysis.conflicts.map((conflict) => (
                <Card
                  key={conflict.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    getSeverityColor(conflict.severity),
                    selectedConflict?.id === conflict.id && "ring-2 ring-purple-500"
                  )}
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getConflictIcon(conflict.type)}
                        {conflict.type === 'circular' && '순환 의존성'}
                        {conflict.type === 'resource' && '리소스 충돌'}
                        {conflict.type === 'sequence' && '순서 오류'}
                        {conflict.type === 'parallel' && '병렬화 가능'}
                      </span>
                      <Badge 
                        variant={
                          conflict.severity === 'critical' ? 'destructive' :
                          conflict.severity === 'warning' ? 'secondary' :
                          'default'
                        }
                      >
                        {conflict.severity === 'critical' && '심각'}
                        {conflict.severity === 'warning' && '경고'}
                        {conflict.severity === 'info' && '정보'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{conflict.description}</p>
                    
                    {selectedConflict?.id === conflict.id && (
                      <div className="space-y-3 pt-3 border-t">
                        <div>
                          <p className="font-medium text-sm mb-2">관련 작업:</p>
                          <div className="flex flex-wrap gap-2">
                            {conflict.tasks.map(taskId => {
                              const task = tasks.find(t => t.id === taskId)
                              return (
                                <Badge
                                  key={taskId}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onTaskClick?.(taskId)
                                  }}
                                >
                                  {task?.title || taskId}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm mb-2">해결 방안:</p>
                          <ul className="space-y-1">
                            {conflict.resolution.map((solution, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{solution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="network" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                의존성 네트워크 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Critical Path */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-red-600" />
                  중요 경로 (Critical Path)
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {analysis.criticalPath.map((taskId, idx) => {
                    const task = tasks.find(t => t.id === taskId)
                    return (
                      <div key={taskId} className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => onTaskClick?.(taskId)}
                        >
                          {task?.title || taskId}
                        </Badge>
                        {idx < analysis.criticalPath.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  이 경로의 작업들이 전체 프로젝트 기간을 결정합니다.
                </p>
              </div>

              {/* Parallelizable Groups */}
              {analysis.parallelizableGroups.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    병렬 처리 가능 그룹
                  </h4>
                  <div className="space-y-2">
                    {analysis.parallelizableGroups.map((group, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          그룹 {idx + 1} (동시 진행 가능)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.map(taskId => {
                            const task = tasks.find(t => t.id === taskId)
                            return (
                              <Badge
                                key={taskId}
                                variant="outline"
                                className="bg-white cursor-pointer hover:bg-green-100"
                                onClick={() => onTaskClick?.(taskId)}
                              >
                                {task?.title || taskId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottlenecks */}
              {analysis.bottlenecks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    병목 현상 작업
                  </h4>
                  <div className="space-y-2">
                    {analysis.bottlenecks.slice(0, 3).map((bottleneck) => {
                      const task = tasks.find(t => t.id === bottleneck.taskId)
                      return (
                        <div
                          key={bottleneck.taskId}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{task?.title}</p>
                            <p className="text-xs text-gray-600">{bottleneck.reason}</p>
                          </div>
                          <Badge variant="secondary">
                            영향: {bottleneck.impact}일
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations" className="mt-4 space-y-4">
          {analysis.optimizations.length === 0 ? (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                현재 일정이 이미 최적화되어 있습니다.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {analysis.optimizations.map((optimization, idx) => (
                <Card
                  key={idx}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {optimization.type === 'parallel' && <Zap className="h-4 w-4 text-green-600" />}
                        {optimization.type === 'merge' && <Users className="h-4 w-4 text-green-600" />}
                        {optimization.type === 'reorder' && <Shuffle className="h-4 w-4 text-green-600" />}
                        {optimization.type === 'split' && <GitBranch className="h-4 w-4 text-green-600" />}
                        {optimization.benefit}
                      </span>
                      <Badge className="bg-green-600">
                        {optimization.savingDays}일 절감
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {optimization.tasks.map(taskId => {
                        const task = tasks.find(t => t.id === taskId)
                        return (
                          <Badge
                            key={taskId}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => onTaskClick?.(taskId)}
                          >
                            {task?.title || taskId}
                          </Badge>
                        )
                      })}
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      onClick={() => onOptimizationApply?.(optimization)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      이 최적화 적용하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="py-6 text-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-purple-800">
                    총 {totalSavings}일 단축 가능
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    모든 최적화를 적용하면 공사 기간을 크게 단축할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}