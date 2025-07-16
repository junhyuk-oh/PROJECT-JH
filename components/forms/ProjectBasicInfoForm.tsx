"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Calendar as CalendarIcon, 
  Home, 
  Banknote, 
  Clock, 
  Users,
  AlertCircle,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useResponsive } from "@/hooks/use-responsive"

export interface ProjectBasicInfo {
  startDate: Date
  totalBudget: number
  totalArea: number
  residenceStatus: 'vacant' | 'occupied'
  priority: 'cost' | 'time' | 'quality'
  designStatus: 'completed' | 'in_progress' | 'need_help'
}

interface ProjectBasicInfoFormProps {
  onComplete: (info: ProjectBasicInfo) => void
}

export default function ProjectBasicInfoForm({ onComplete }: ProjectBasicInfoFormProps) {
  const { isMobile } = useResponsive()
  const [formData, setFormData] = useState<Partial<ProjectBasicInfo>>({
    startDate: new Date(),
    totalBudget: 3000,
    totalArea: 25,
    residenceStatus: 'occupied',
    priority: 'quality',
    designStatus: 'completed'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.startDate && formData.totalBudget && formData.totalArea) {
      onComplete(formData as ProjectBasicInfo)
    }
  }

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h2 className={cn(
          "font-bold text-gray-900",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          프로젝트 기본 정보
        </h2>
        <p className={cn(
          "text-gray-600",
          isMobile && "text-sm"
        )}>
          AI가 최적의 공정표를 생성하기 위한 필수 정보를 입력해주세요
        </p>
      </div>

      {/* 시작 예정일 */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            공사 시작 예정일
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  format(formData.startDate, "PPP", { locale: ko })
                ) : (
                  <span>날짜를 선택하세요</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-sm text-gray-500 mt-2">
            최소 2주 후부터 선택 가능합니다
          </p>
        </CardContent>
      </Card>

      {/* 예산 */}
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-500" />
            총 예산
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label>예산 규모</Label>
              <span className="text-lg font-bold text-green-600">
                {formatBudget(formData.totalBudget || 0)}만원
              </span>
            </div>
            <Slider
              value={[formData.totalBudget || 3000]}
              onValueChange={(value) => setFormData({ ...formData, totalBudget: value[0] })}
              max={10000}
              min={1000}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1,000만원</span>
              <span>10,000만원</span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700 flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
              AI가 예산에 맞춰 최적의 공정과 자재를 추천해드립니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 평수 및 거주 상태 */}
      <div className={cn(
        "gap-4",
        isMobile ? "grid grid-cols-1" : "grid md:grid-cols-2"
      )}>
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-500" />
              공간 크기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={formData.totalArea}
                onChange={(e) => setFormData({ ...formData, totalArea: parseInt(e.target.value) || 0 })}
                className="w-24"
                min={10}
                max={100}
              />
              <span className="text-gray-600">평</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              약 {Math.round((formData.totalArea || 0) * 3.3)}㎡
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              거주 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.residenceStatus}
              onValueChange={(value: 'vacant' | 'occupied') => 
                setFormData({ ...formData, residenceStatus: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vacant" id="vacant" />
                <Label htmlFor="vacant">빈집</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occupied" id="occupied" />
                <Label htmlFor="occupied">거주중</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* 우선순위 */}
      <Card className="border-indigo-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            최우선 고려사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.priority}
            onValueChange={(value: 'cost' | 'time' | 'quality') => 
              setFormData({ ...formData, priority: value })
            }
            className={cn(
              "gap-3",
              isMobile ? "grid grid-cols-1" : "grid grid-cols-3"
            )}
          >
            <div className={cn(
              "relative rounded-lg border-2 p-4 cursor-pointer transition-all",
              formData.priority === 'cost' 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-gray-200 hover:border-indigo-300"
            )}>
              <RadioGroupItem value="cost" id="cost" className="sr-only" />
              <Label htmlFor="cost" className="cursor-pointer">
                <div className="font-medium">비용 절감</div>
                <div className="text-sm text-gray-600 mt-1">
                  예산 내 최적화
                </div>
              </Label>
            </div>
            
            <div className={cn(
              "relative rounded-lg border-2 p-4 cursor-pointer transition-all",
              formData.priority === 'time' 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-gray-200 hover:border-indigo-300"
            )}>
              <RadioGroupItem value="time" id="time" className="sr-only" />
              <Label htmlFor="time" className="cursor-pointer">
                <div className="font-medium">빠른 완공</div>
                <div className="text-sm text-gray-600 mt-1">
                  최단 기간 완료
                </div>
              </Label>
            </div>
            
            <div className={cn(
              "relative rounded-lg border-2 p-4 cursor-pointer transition-all",
              formData.priority === 'quality' 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-gray-200 hover:border-indigo-300"
            )}>
              <RadioGroupItem value="quality" id="quality" className="sr-only" />
              <Label htmlFor="quality" className="cursor-pointer">
                <div className="font-medium">품질 우선</div>
                <div className="text-sm text-gray-600 mt-1">
                  최고급 마감
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 디자인 상태 */}
      <Card className="border-pink-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-pink-500" />
            디자인 준비 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.designStatus}
            onValueChange={(value: 'completed' | 'in_progress' | 'need_help') => 
              setFormData({ ...formData, designStatus: value })
            }
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed">디자인 완료 (도면 보유)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in_progress" id="in_progress" />
              <Label htmlFor="in_progress">디자인 진행 중</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="need_help" id="need_help" />
              <Label htmlFor="need_help">디자인 도움 필요</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={!formData.startDate || !formData.totalBudget || !formData.totalArea}
        className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
      >
        다음 단계로
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  )
}