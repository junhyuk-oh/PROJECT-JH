"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, TrendingUp, AlertTriangle, Sparkles, Users, CloudRain, Building } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"
import { ko } from "date-fns/locale"

interface ScheduleInputStepProps {
  onNext: (scheduleData: ScheduleData) => void
  onPrev: () => void
  selectedSpaces?: Array<{ id: string; name: string; works: any[] }>
  budget?: number
}

interface ScheduleData {
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

export default function ScheduleInputStep({ onNext, onPrev, selectedSpaces = [], budget = 0 }: ScheduleInputStepProps) {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [expertise, setExpertise] = useState<"beginner" | "intermediate" | "expert">("intermediate")
  const [buildingAge, setBuildingAge] = useState<string>("10")
  const [weatherConsideration, setWeatherConsideration] = useState(true)
  const [showProbabilistic, setShowProbabilistic] = useState(false)
  const [probabilisticForecast, setProbabilisticForecast] = useState<ScheduleData["probabilisticForecast"]>()
  
  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
  }, [])

  // 시작일 변경 시 AI 기반 예상 종료일 계산
  useEffect(() => {
    if (startDate && selectedSpaces.length > 0) {
      // 기본 공기 계산
      let baseDuration = 0
      selectedSpaces.forEach(space => {
        const workCount = space.works?.filter(w => w.selected).length || 0
        
        // 공간별 기본 소요일수
        const spaceDurations = {
          kitchen: 7,
          bathroom: 5,
          living: 4,
          bedroom: 3,
          room: 2,
          entrance: 2,
          balcony: 3
        }
        
        const spaceDuration = spaceDurations[space.id as keyof typeof spaceDurations] || 3
        baseDuration += spaceDuration * (workCount > 0 ? workCount * 0.5 : 1)
      })
      
      // 숙련도 조정
      const expertiseMultiplier = {
        beginner: 1.3,
        intermediate: 1.0,
        expert: 0.85
      }
      
      baseDuration *= expertiseMultiplier[expertise]
      
      // 확률적 예측 생성
      const p50 = Math.ceil(baseDuration)
      const p10 = Math.ceil(baseDuration * 0.8)
      const p90 = Math.ceil(baseDuration * 1.3)
      
      setProbabilisticForecast({
        p10Duration: p10,
        p50Duration: p50,
        p90Duration: p90,
        expectedDuration: Math.ceil((p10 + 4 * p50 + p90) / 6),
        confidence90Range: {
          min: p10,
          max: p90
        }
      })
      
      // 예상 종료일 설정
      const estimatedEnd = addDays(new Date(startDate), p50)
      setEndDate(estimatedEnd.toISOString().split('T')[0])
      setShowProbabilistic(true)
    }
  }, [startDate, selectedSpaces, expertise])

  const getDuration = () => {
    if (startDate && endDate) {
      return differenceInDays(new Date(endDate), new Date(startDate)) + 1
    }
    return 0
  }

  const getSeason = (date: Date): "spring" | "summer" | "fall" | "winter" => {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return "spring"
    if (month >= 5 && month <= 7) return "summer"
    if (month >= 8 && month <= 10) return "fall"
    return "winter"
  }

  const canProceed = () => {
    return startDate && endDate && new Date(endDate) >= new Date(startDate)
  }

  const handleNext = () => {
    const scheduleData: ScheduleData = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      expertise,
      environment: {
        season: getSeason(new Date(startDate)),
        buildingAge: parseInt(buildingAge),
        weatherConsideration
      },
      probabilisticForecast
    }
    onNext(scheduleData)
  }

  // 리스크 레벨 계산
  const getRiskLevel = () => {
    if (!probabilisticForecast) return "low"
    const variance = probabilisticForecast.p90Duration - probabilisticForecast.p10Duration
    if (variance > 15) return "high"
    if (variance > 10) return "medium"
    return "low"
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-3 text-gray-900">
        📅 언제 시작하고 싶으세요?
      </h2>
      <p className="text-lg text-gray-600 mb-8">공사 시작일과 희망 완료일을 선택해주세요</p>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* 날짜 입력 섹션 */}
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start-date" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  시작 희망일
                </Label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-white text-gray-900"
                />
              </div>
              
              <div>
                <Label htmlFor="end-date" className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  완료 희망일
                </Label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-white text-gray-900"
                />
              </div>
            </div>
            
            {startDate && endDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  총 {getDuration()}일간 진행
                </Badge>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* 확률적 예측 결과 */}
        <AnimatePresence>
          {showProbabilistic && probabilisticForecast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">🤖 AI 확률적 공기 예측</h3>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {probabilisticForecast.expectedDuration}일
                    </div>
                    <p className="text-gray-600">AI 예상 소요 기간</p>
                  </div>
                  
                  {/* 확률 분포 시각화 */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">빠른 완공 (10% 확률)</span>
                      <span className="font-medium">{probabilisticForecast.p10Duration}일</span>
                    </div>
                    <div className="relative">
                      <div className="w-full h-8 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-full">
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-600"
                          style={{ left: '10%' }}
                        />
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-2 h-8 bg-blue-600"
                          style={{ left: '50%', marginLeft: '-4px' }}
                        />
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-1 h-6 bg-red-600"
                          style={{ left: '90%' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">일반적 완공 (50% 확률)</span>
                      <span className="font-medium text-blue-600">{probabilisticForecast.p50Duration}일</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">지연 고려 (90% 확률)</span>
                      <span className="font-medium">{probabilisticForecast.p90Duration}일</span>
                    </div>
                  </div>
                  
                  {/* 리스크 레벨 표시 */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-700">리스크 수준</span>
                    <Badge 
                      variant={getRiskLevel() === "high" ? "destructive" : getRiskLevel() === "medium" ? "secondary" : "default"}
                      className="capitalize"
                    >
                      {getRiskLevel() === "high" ? "높음" : getRiskLevel() === "medium" ? "중간" : "낮음"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 추가 정보 입력 */}
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">🔧 추가 정보 (선택사항)</h3>
            
            <div>
              <Label htmlFor="expertise" className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-600" />
                시공 경험
              </Label>
              <Select value={expertise} onValueChange={(value: any) => setExpertise(value)}>
                <SelectTrigger id="expertise">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">처음이에요 (공기 +30%)</SelectItem>
                  <SelectItem value="intermediate">1-2회 경험 (표준)</SelectItem>
                  <SelectItem value="expert">여러 번 경험 (공기 -15%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="building-age" className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-gray-600" />
                건물 연식
              </Label>
              <Select value={buildingAge} onValueChange={setBuildingAge}>
                <SelectTrigger id="building-age">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5년 이하</SelectItem>
                  <SelectItem value="10">5-10년</SelectItem>
                  <SelectItem value="20">10-20년</SelectItem>
                  <SelectItem value="30">20년 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label htmlFor="weather" className="flex items-center gap-2 cursor-pointer">
                <CloudRain className="w-4 h-4 text-gray-600" />
                날씨 영향 고려
              </Label>
              <input
                id="weather"
                type="checkbox"
                checked={weatherConsideration}
                onChange={(e) => setWeatherConsideration(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* 주의사항 */}
        {getDuration() > 0 && getDuration() < 14 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  ⚠️ 촉박한 일정입니다
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {getDuration()}일은 선택하신 작업량에 비해 짧을 수 있습니다. 
                  일부 작업의 병렬 진행이나 야간 작업이 필요할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
          공정표 생성하기
          <Sparkles className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}