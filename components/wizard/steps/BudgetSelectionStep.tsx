"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, TrendingUp, AlertCircle, Sparkles } from "lucide-react"

interface BudgetOption {
  id: string
  value: number
  label: string
  description: string
  recommended?: boolean
}

interface BudgetSelectionStepProps {
  onNext: (budget: number, budgetDetail: BudgetBreakdown) => void
  onPrev: () => void
  selectedSpaces?: Array<{ id: string; name: string; works: any[] }>
}

interface BudgetBreakdown {
  materials: number
  labor: number
  additional: number
  total: number
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { id: "budget_1000", value: 1000, label: "~1,000만원", description: "부분 리모델링" },
  { id: "budget_2000", value: 2000, label: "1,000~2,000만원", description: "중간 규모 리모델링" },
  { id: "budget_3000", value: 3000, label: "2,000~3,000만원", description: "전체 리모델링" },
  { id: "budget_5000", value: 5000, label: "3,000~5,000만원", description: "고급 리모델링" },
  { id: "budget_5001", value: 7000, label: "5,000만원~", description: "프리미엄 리모델링" },
  { id: "budget_custom", value: 0, label: "직접 입력", description: "원하는 예산을 입력하세요" }
]

export default function BudgetSelectionStep({ onNext, onPrev, selectedSpaces = [] }: BudgetSelectionStepProps) {
  const [selectedBudget, setSelectedBudget] = useState<string>("")
  const [customBudget, setCustomBudget] = useState<string>("")
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown>({
    materials: 0,
    labor: 0,
    additional: 0,
    total: 0
  })
  const [recommendedBudget, setRecommendedBudget] = useState<number>(0)
  const [showBudgetAnalysis, setShowBudgetAnalysis] = useState(false)

  // AI 기반 예산 추천 계산
  useEffect(() => {
    if (selectedSpaces.length > 0) {
      let totalEstimate = 0
      
      selectedSpaces.forEach(space => {
        const workCount = space.works?.filter(w => w.selected).length || 0
        
        // 공간별 기본 비용 추정
        const baseCosts = {
          kitchen: 800,
          bathroom: 600,
          living: 400,
          bedroom: 300,
          room: 250,
          entrance: 200,
          balcony: 350
        }
        
        const baseCost = baseCosts[space.id as keyof typeof baseCosts] || 300
        totalEstimate += baseCost * (workCount > 0 ? workCount * 0.8 : 1)
      })
      
      setRecommendedBudget(Math.ceil(totalEstimate / 100) * 100)
      
      // 추천 예산에 가장 가까운 옵션 표시
      BUDGET_OPTIONS.forEach(option => {
        if (option.value > 0 && Math.abs(option.value - totalEstimate) < 500) {
          option.recommended = true
        } else {
          option.recommended = false
        }
      })
    }
  }, [selectedSpaces])

  // 예산 선택 시 자동 분석
  useEffect(() => {
    const budget = selectedBudget === "budget_custom" 
      ? parseInt(customBudget) 
      : BUDGET_OPTIONS.find(o => o.id === selectedBudget)?.value || 0
    
    if (budget > 0) {
      // 일반적인 비용 분배 비율
      const materialRatio = 0.45 // 자재비 45%
      const laborRatio = 0.40    // 인건비 40%
      const additionalRatio = 0.15 // 부대비용 15%
      
      setBudgetBreakdown({
        materials: Math.round(budget * materialRatio),
        labor: Math.round(budget * laborRatio),
        additional: Math.round(budget * additionalRatio),
        total: budget
      })
      
      setShowBudgetAnalysis(true)
    }
  }, [selectedBudget, customBudget])

  const handleBudgetSelect = (budgetId: string) => {
    setSelectedBudget(budgetId)
    if (budgetId !== "budget_custom") {
      setCustomBudget("")
    }
  }

  const handleCustomBudgetChange = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, "")
    setCustomBudget(numericValue)
    if (numericValue) {
      setSelectedBudget("budget_custom")
    }
  }

  const getBudgetValue = () => {
    if (selectedBudget === "budget_custom") {
      return parseInt(customBudget) || 0
    }
    return BUDGET_OPTIONS.find(o => o.id === selectedBudget)?.value || 0
  }

  const canProceed = () => {
    return getBudgetValue() > 0 || selectedBudget === "budget_0"
  }

  const handleNext = () => {
    const budget = getBudgetValue()
    onNext(budget, budgetBreakdown)
  }

  // 예산별 작업 가능 범위 계산
  const getWorkScope = (budget: number) => {
    if (budget < 1000) return "부분 보수 및 마감재 교체"
    if (budget < 2000) return "주요 공간 2-3곳 리모델링"
    if (budget < 3000) return "전체 공간 표준 리모델링"
    if (budget < 5000) return "고급 자재 사용 및 구조 변경 가능"
    return "프리미엄 자재 및 맞춤형 설계"
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-3 text-gray-900">
        💰 예산은 얼마나 되시나요?
      </h2>
      <p className="text-lg text-gray-600 mb-2">대략적인 예산을 선택해주세요</p>
      
      {/* AI 예산 추천 */}
      {recommendedBudget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="flex items-start gap-3 p-4">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  💡 AI 예산 추천
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  선택하신 {selectedSpaces.length}개 공간의 작업 규모를 고려하면, 
                  약 <span className="font-bold">{recommendedBudget.toLocaleString()}만원</span>의 예산이 적절해 보입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 예산 선택 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {BUDGET_OPTIONS.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all relative ${
                selectedBudget === option.id 
                  ? "border-orange-400 bg-orange-50" 
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => handleBudgetSelect(option.id)}
            >
              {option.recommended && (
                <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  추천
                </Badge>
              )}
              <CardContent className="p-6">
                <p className="text-2xl font-bold text-gray-900 mb-1">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
                {option.value > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {getWorkScope(option.value)}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 직접 입력 필드 */}
      {selectedBudget === "budget_custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-budget" className="text-sm font-medium text-gray-700">
                    예산 직접 입력 (만원 단위)
                  </Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="custom-budget"
                      type="text"
                      value={customBudget}
                      onChange={(e) => handleCustomBudgetChange(e.target.value)}
                      placeholder="예: 3500"
                      className="text-lg"
                    />
                    <span className="text-lg font-medium text-gray-700">만원</span>
                  </div>
                </div>
                
                {customBudget && parseInt(customBudget) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calculator className="w-4 h-4" />
                    <span>{parseInt(customBudget).toLocaleString()}만원 = {(parseInt(customBudget) * 10000).toLocaleString()}원</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 예산 분석 */}
      {showBudgetAnalysis && budgetBreakdown.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">예산 구성 분석</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">자재비</span>
                    <span className="text-sm font-medium">{budgetBreakdown.materials.toLocaleString()}만원</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(budgetBreakdown.materials / budgetBreakdown.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">인건비</span>
                    <span className="text-sm font-medium">{budgetBreakdown.labor.toLocaleString()}만원</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(budgetBreakdown.labor / budgetBreakdown.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">부대비용</span>
                    <span className="text-sm font-medium">{budgetBreakdown.additional.toLocaleString()}만원</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(budgetBreakdown.additional / budgetBreakdown.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>실제 비용은 선택한 자재와 시공 난이도에 따라 달라질 수 있습니다</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 예산 조정 슬라이더 (선택 사항) */}
      {selectedBudget && selectedBudget !== "budget_custom" && selectedBudget !== "budget_0" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                예산 미세 조정
              </Label>
              <Slider
                value={[getBudgetValue()]}
                onValueChange={(value) => {
                  setCustomBudget(value[0].toString())
                  setSelectedBudget("budget_custom")
                }}
                max={10000}
                min={500}
                step={100}
                className="mb-3"
              />
              <p className="text-xs text-gray-500 text-center">
                슬라이더를 움직여 예산을 조정하세요
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-8 flex justify-between">
        <Button 
          size="lg"
          variant="outline"
          onClick={onPrev}
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          이전
        </Button>
        <Button 
          size="lg"
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
        >
          다음 단계
        </Button>
      </div>
    </div>
  )
}