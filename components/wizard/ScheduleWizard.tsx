"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react"

// Step 컴포넌트들 import
import SpaceSelectionStep from "./steps/SpaceSelectionStep"
import BudgetSelectionStep from "./steps/BudgetSelectionStep"
import ScheduleInputStep from "./steps/ScheduleInputStep"
import ResultStep from "./steps/ResultStep"

// AI 어시스턴트 import (나중에 생성)
// import AIAssistant from "./AIAssistant"

interface WizardData {
  spaces: Array<{
    id: string
    name: string
    icon: string
    selected: boolean
    works: Array<{
      id: string
      name: string
      category: string
      selected: boolean
      recommended?: boolean
    }>
  }>
  budget: number
  budgetDetail: {
    materials: number
    labor: number
    additional: number
    total: number
  }
  scheduleData: {
    startDate: Date
    endDate: Date
    expertise: "beginner" | "intermediate" | "expert"
    environment: {
      season: "spring" | "summer" | "fall" | "winter"
      buildingAge: number
      weatherConsideration: boolean
    }
    probabilisticForecast?: {
      p10Duration: number
      p50Duration: number
      p90Duration: number
      expectedDuration: number
      confidence90Range: {
        min: number
        max: number
      }
    }
  }
}

const STEPS = [
  { id: 1, title: "공간 선택", description: "어떤 공간을 바꾸고 싶으세요?" },
  { id: 2, title: "예산 설정", description: "예산은 얼마나 되시나요?" },
  { id: 3, title: "일정 확인", description: "언제 시작하고 싶으세요?" },
  { id: 4, title: "완성!", description: "AI 공정표가 준비되었어요!" }
]

export default function ScheduleWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({
    spaces: [],
    budget: 0,
    budgetDetail: {
      materials: 0,
      labor: 0,
      additional: 0,
      total: 0
    },
    scheduleData: {
      startDate: new Date(),
      endDate: new Date(),
      expertise: "intermediate",
      environment: {
        season: "spring",
        buildingAge: 10,
        weatherConsideration: true
      }
    }
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const progressValue = ((currentStep - 1) / (STEPS.length - 1)) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateSchedule = async () => {
    setIsGenerating(true)
    // TODO: AI 공정표 생성 로직
    setTimeout(() => {
      setIsGenerating(false)
      handleNext()
    }, 3000)
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* 프로그레스 바 */}
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200 mb-8 shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="relative">
                  <motion.div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${currentStep > step.id 
                        ? "bg-green-500 text-white" 
                        : currentStep === step.id 
                          ? "bg-orange-500 text-white" 
                          : "bg-gray-200 text-gray-600"}
                    `}
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: currentStep === step.id ? 1.1 : 1,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
                  </motion.div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-24 h-1 bg-gray-200 mx-2">
                    <motion.div 
                      className="h-full bg-orange-500"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: currentStep > step.id ? "100%" : "0%",
                        transition: { duration: 0.5, ease: "easeInOut" }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2 bg-gray-200" />
        </div>
      </Card>

      {/* 메인 컨텐츠 영역 */}
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200 flex-1 shadow-xl">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              {/* Step 1: 공간 선택 */}
              {currentStep === 1 && (
                <SpaceSelectionStep
                  onNext={(spaces) => {
                    setWizardData(prev => ({ ...prev, spaces }))
                    handleNext()
                  }}
                  defaultSpaces={wizardData.spaces}
                />
              )}

              {/* Step 2: 예산 설정 */}
              {currentStep === 2 && (
                <BudgetSelectionStep
                  onNext={(budget, budgetDetail) => {
                    setWizardData(prev => ({ ...prev, budget, budgetDetail }))
                    handleNext()
                  }}
                  onPrev={handlePrev}
                  selectedSpaces={wizardData.spaces}
                />
              )}

              {/* Step 3: 일정 확인 */}
              {currentStep === 3 && (
                <ScheduleInputStep
                  onNext={(scheduleData) => {
                    setWizardData(prev => ({ ...prev, scheduleData }))
                    generateSchedule()
                  }}
                  onPrev={handlePrev}
                  selectedSpaces={wizardData.spaces}
                  budget={wizardData.budget}
                />
              )}

              {/* Step 4: 결과 */}
              {currentStep === 4 && (
                <ResultStep
                  wizardData={wizardData}
                  onEdit={() => setCurrentStep(1)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* AI 어시스턴트는 나중에 추가 */}
      {/* <AIAssistant currentStep={currentStep} wizardData={wizardData} /> */}
    </div>
  )
}