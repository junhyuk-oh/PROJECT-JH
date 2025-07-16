"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Home, 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Clock, 
  Banknote,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SmartSpaceAnalyzer, SpaceRecommendation, SpaceAnalysis } from "@/lib/ai/spaceAnalyzer"
import { ProjectBasicInfo } from "@/lib/types"
import { SpaceSelection } from "@/lib/types"
import { useResponsive } from "@/hooks/use-responsive"

interface SmartSpaceSelectionFormProps {
  projectInfo: ProjectBasicInfo
  onComplete: (spaces: SpaceSelection[]) => void
  onBack?: () => void
}

export default function SmartSpaceSelectionForm({ 
  projectInfo, 
  onComplete,
  onBack 
}: SmartSpaceSelectionFormProps) {
  const { isMobile, isTablet } = useResponsive()
  const [analysis, setAnalysis] = useState<SpaceAnalysis | null>(null)
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set())
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  useEffect(() => {
    // AI 분석 실행
    const analyzer = new SmartSpaceAnalyzer(projectInfo)
    setTimeout(() => {
      const result = analyzer.analyzeSpaces()
      setAnalysis(result)
      setIsAnalyzing(false)
      
      // 높은 우선순위 공간 자동 선택
      const autoSelect = result.recommendations
        .filter(r => r.priority === 'high' || r.aiScore >= 70)
        .map(r => r.spaceId)
      setSelectedSpaces(new Set(autoSelect))
    }, 1500)
  }, [projectInfo])

  const handleSpaceToggle = (spaceId: string) => {
    const newSelected = new Set(selectedSpaces)
    if (newSelected.has(spaceId)) {
      newSelected.delete(spaceId)
    } else {
      newSelected.add(spaceId)
    }
    setSelectedSpaces(newSelected)
  }

  const handleComplete = () => {
    if (!analysis) return

    const spaces: SpaceSelection[] = Array.from(selectedSpaces).map(spaceId => {
      const recommendation = analysis.recommendations.find(r => r.spaceId === spaceId)!
      return {
        id: spaceId,
        name: recommendation.spaceName,
        selectedOptions: recommendation.suggestedOptions.slice(0, 2).map((opt, idx) => ({
          id: `${spaceId}-opt-${idx}`,
          name: opt,
          category: 'finishing',
          estimatedDays: Math.ceil(recommendation.estimatedDuration / 3),
          estimatedCost: Math.round(recommendation.estimatedCost / 3)
        }))
      }
    })

    onComplete(spaces)
  }

  const getSelectedTotalCost = () => {
    if (!analysis) return 0
    return analysis.recommendations
      .filter(r => selectedSpaces.has(r.spaceId))
      .reduce((sum, r) => sum + r.estimatedCost, 0)
  }

  const getSelectedTotalDuration = () => {
    if (!analysis) return 0
    return analysis.recommendations
      .filter(r => selectedSpaces.has(r.spaceId))
      .reduce((sum, r) => sum + r.estimatedDuration, 0)
  }

  if (isAnalyzing || !analysis) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className={cn(
              "font-bold text-gray-800",
              isMobile ? "text-lg" : "text-xl"
            )}>
              AI가 공간을 분석하고 있습니다...
            </h3>
            <p className={cn(
              "text-gray-600",
              isMobile && "text-sm"
            )}>
              프로젝트 정보를 바탕으로 최적의 공간 구성을 추천해드립니다
            </p>
            <Progress value={66} className="w-64 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI 분석 요약 */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI 공간 분석 완료
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "gap-4",
            isMobile ? "grid grid-cols-1" : "grid md:grid-cols-3"
          )}>
            <div className={cn(
              "text-center",
              isMobile && "py-2"
            )}>
              <p className="text-sm text-gray-600 mb-1">추천 공간</p>
              <p className={cn(
                "font-bold text-blue-700",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {analysis.recommendations.filter(r => r.priority === 'high').length}개
              </p>
            </div>
            <div className={cn(
              "text-center",
              isMobile && "py-2"
            )}>
              <p className="text-sm text-gray-600 mb-1">예상 기간</p>
              <p className={cn(
                "font-bold text-green-700",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {analysis.insights.totalEstimatedDuration}일
              </p>
            </div>
            <div className={cn(
              "text-center",
              isMobile && "py-2"
            )}>
              <p className="text-sm text-gray-600 mb-1">예상 비용</p>
              <p className={cn(
                "font-bold text-amber-700",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {(analysis.insights.totalEstimatedCost / 10000).toLocaleString()}만원
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 공간 선택 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Home className="h-5 w-5" />
          공간별 AI 추천
        </h3>
        
        {analysis.recommendations.map((rec) => (
          <Card 
            key={rec.spaceId}
            className={cn(
              "transition-all cursor-pointer",
              selectedSpaces.has(rec.spaceId) 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-blue-300"
            )}
            onClick={() => handleSpaceToggle(rec.spaceId)}
          >
            <CardContent className={cn(
              isMobile ? "p-3" : "p-4"
            )}>
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedSpaces.has(rec.spaceId)}
                  onCheckedChange={() => handleSpaceToggle(rec.spaceId)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={cn(
                        "font-semibold text-gray-900 flex items-center gap-2",
                        isMobile && "text-sm"
                      )}>
                        {rec.spaceName}
                        {rec.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            필수
                          </Badge>
                        )}
                        {rec.aiScore >= 80 && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI 추천
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {rec.estimatedDuration}일
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Banknote className="h-4 w-4" />
                        {(rec.estimatedCost / 10000).toLocaleString()}만원
                      </div>
                    </div>
                  </div>

                  {/* AI 점수 표시 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">AI 적합도</span>
                    <Progress value={rec.aiScore} className="flex-1 h-2" />
                    <span className="text-xs font-semibold text-gray-700">
                      {rec.aiScore}%
                    </span>
                  </div>

                  {/* 추천 옵션 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">추천 작업</p>
                    <div className={cn(
                      "flex flex-wrap gap-1",
                      isMobile && "mt-1"
                    )}>
                      {rec.suggestedOptions.slice(0, 3).map((option, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 비용 절감 팁 */}
      {analysis.insights.costSavingTips.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              AI 비용 절감 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.insights.costSavingTips.map((tip, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 공사 순서 최적화 */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            AI 추천 공사 순서
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.insights.sequenceOptimization.map((step, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                {step}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 선택 요약 및 진행 버튼 */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className={cn(
          isMobile ? "p-4" : "p-6"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">선택된 공간</h4>
              <p className="text-sm text-gray-600">
                {selectedSpaces.size}개 공간 선택됨
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">예상 비용</p>
              <p className="text-xl font-bold text-green-700">
                {(getSelectedTotalCost() / 10000).toLocaleString()}만원
              </p>
            </div>
          </div>

          {/* 예산 대비 표시 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">예산 대비</span>
              <span className="font-medium">
                {Math.round((getSelectedTotalCost() / (projectInfo.totalBudget * 10000)) * 100)}%
              </span>
            </div>
            <Progress 
              value={(getSelectedTotalCost() / (projectInfo.totalBudget * 10000)) * 100} 
              className="h-2"
            />
          </div>

          <div className={cn(
            "gap-3",
            isMobile ? "flex flex-col" : "flex"
          )}>
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              이전 단계
            </Button>
            <Button
              onClick={handleComplete}
              disabled={selectedSpaces.size === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              다음 단계로
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}