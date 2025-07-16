"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Brain, Home, Wrench, Calendar, ChevronRight, Sparkles } from "lucide-react"

export interface UserExpertise {
  level: 'beginner' | 'intermediate' | 'expert'
  previousProjects: number
  decisionSpeed: 'fast' | 'moderate' | 'careful'
  budgetFlexibility: 'strict' | 'moderate' | 'flexible'
  designConfidence: 'low' | 'medium' | 'high'
}

interface UserExpertiseFormProps {
  onComplete: (expertise: UserExpertise) => void
  onBack?: () => void
}

export default function UserExpertiseForm({ onComplete, onBack }: UserExpertiseFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserExpertise>>({})
  
  const questions = [
    {
      id: 'level',
      icon: Brain,
      title: '인테리어 경험 수준',
      subtitle: 'AI가 맞춤형 안내를 제공합니다',
      options: [
        { value: 'beginner', label: '초보자', description: '처음 인테리어를 시작합니다' },
        { value: 'intermediate', label: '중급자', description: '몇 번의 경험이 있습니다' },
        { value: 'expert', label: '전문가', description: '많은 경험과 지식이 있습니다' }
      ]
    },
    {
      id: 'previousProjects',
      icon: Home,
      title: '이전 프로젝트 경험',
      subtitle: '경험에 따라 상세도를 조절합니다',
      options: [
        { value: '0', label: '없음', description: '첫 인테리어 프로젝트입니다' },
        { value: '1', label: '1-2회', description: '소규모 프로젝트 경험이 있습니다' },
        { value: '3', label: '3회 이상', description: '여러 프로젝트를 진행했습니다' }
      ]
    },
    {
      id: 'decisionSpeed',
      icon: Calendar,
      title: '의사결정 스타일',
      subtitle: '작업 진행 속도에 영향을 줍니다',
      options: [
        { value: 'fast', label: '빠른 결정', description: '신속하게 결정하고 진행합니다' },
        { value: 'moderate', label: '적절한 검토', description: '중요한 부분은 신중히 검토합니다' },
        { value: 'careful', label: '신중한 검토', description: '모든 옵션을 충분히 검토합니다' }
      ]
    },
    {
      id: 'budgetFlexibility',
      icon: Wrench,
      title: '예산 유연성',
      subtitle: '최적화 옵션을 제안합니다',
      options: [
        { value: 'strict', label: '엄격한 예산', description: '정해진 예산 내에서만 진행합니다' },
        { value: 'moderate', label: '적당한 유연성', description: '필요시 10-20% 조정 가능합니다' },
        { value: 'flexible', label: '유연한 예산', description: '품질을 위해 예산 조정이 가능합니다' }
      ]
    },
    {
      id: 'designConfidence',
      icon: Sparkles,
      title: '디자인 결정 자신감',
      subtitle: 'AI 추천 수준을 조절합니다',
      options: [
        { value: 'low', label: '도움 필요', description: 'AI의 적극적인 추천을 원합니다' },
        { value: 'medium', label: '부분적 도움', description: '중요한 결정에 AI 도움을 원합니다' },
        { value: 'high', label: '독립적 결정', description: '최소한의 가이드만 필요합니다' }
      ]
    }
  ]

  const handleAnswer = (value: string) => {
    const question = questions[currentQuestion]
    const updatedAnswers = {
      ...answers,
      [question.id]: question.id === 'previousProjects' ? parseInt(value) : value
    }
    setAnswers(updatedAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // 모든 질문에 답변 완료
      onComplete(updatedAnswers as UserExpertise)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]
  const Icon = question.icon

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-purple-200 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="mb-4 h-2" />
        <CardTitle className="text-2xl text-gray-900">{question.title}</CardTitle>
        <p className="text-gray-600 mt-2">{question.subtitle}</p>
      </CardHeader>
      <CardContent>
        <RadioGroup onValueChange={handleAnswer} className="space-y-4">
          {question.options.map((option) => (
            <div key={option.value} className="relative">
              <div className="flex items-start space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                </Label>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1)
              } else if (onBack) {
                onBack()
              }
            }}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            이전
          </Button>
          
          {currentQuestion === 0 && (
            <p className="text-sm text-gray-500 flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
              AI가 답변을 분석하여 맞춤형 경험을 제공합니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}