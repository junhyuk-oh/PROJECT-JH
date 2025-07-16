"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Cloud, Sun, Droplets, Wind, Thermometer, Home, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EnvironmentalFactors {
  startDate: Date
  season: 'spring' | 'summer' | 'fall' | 'winter'
  weatherConditions: {
    rainyDays: number // 예상 우천일수 비율 (%)
    temperature: 'cold' | 'moderate' | 'hot'
    humidity: 'low' | 'moderate' | 'high'
  }
  buildingFactors: {
    floor: number
    hasElevator: boolean
    parkingDistance: number // 미터 단위
    neighborSensitivity: 'low' | 'moderate' | 'high'
  }
  specialConditions: {
    hasChildren: boolean
    hasPets: boolean
    workFromHome: boolean
    flexibleSchedule: boolean
  }
}

interface EnvironmentalFactorsFormProps {
  onComplete: (factors: EnvironmentalFactors) => void
  onBack?: () => void
}

export default function EnvironmentalFactorsForm({ onComplete, onBack }: EnvironmentalFactorsFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [factors, setFactors] = useState<Partial<EnvironmentalFactors>>({
    weatherConditions: {
      rainyDays: 20,
      temperature: 'moderate',
      humidity: 'moderate'
    },
    buildingFactors: {
      floor: 1,
      hasElevator: false,
      parkingDistance: 50,
      neighborSensitivity: 'moderate'
    },
    specialConditions: {
      hasChildren: false,
      hasPets: false,
      workFromHome: false,
      flexibleSchedule: false
    }
  })

  const getSeason = (date: Date): 'spring' | 'summer' | 'fall' | 'winter' => {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  const handleSubmit = () => {
    if (!startDate) return
    
    onComplete({
      startDate,
      season: getSeason(startDate),
      ...factors
    } as EnvironmentalFactors)
  }

  const getWeatherIcon = () => {
    const temp = factors.weatherConditions?.temperature
    if (temp === 'cold') return <Thermometer className="h-5 w-5 text-blue-500" />
    if (temp === 'hot') return <Sun className="h-5 w-5 text-orange-500" />
    return <Cloud className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* 시작일 선택 */}
      <Card className="bg-white/95 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-500" />
            공사 시작 예정일
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
          {startDate && (
            <p className="mt-4 text-sm text-gray-600">
              선택된 날짜: {startDate.toLocaleDateString('ko-KR')} ({getSeason(startDate) === 'spring' ? '봄' : getSeason(startDate) === 'summer' ? '여름' : getSeason(startDate) === 'fall' ? '가을' : '겨울'})
            </p>
          )}
        </CardContent>
      </Card>

      {/* 날씨 조건 */}
      <Card className="bg-white/95 backdrop-blur-sm border-sky-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {getWeatherIcon()}
            날씨 및 기후 조건
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              예상 우천일 비율: {factors.weatherConditions?.rainyDays}%
            </Label>
            <Slider
              value={[factors.weatherConditions?.rainyDays || 20]}
              onValueChange={(value) => setFactors({
                ...factors,
                weatherConditions: {
                  ...factors.weatherConditions!,
                  rainyDays: value[0]
                }
              })}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <Label className="block mb-2">평균 기온</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['cold', 'moderate', 'hot'] as const).map((temp) => (
                <Button
                  key={temp}
                  variant={factors.weatherConditions?.temperature === temp ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFactors({
                    ...factors,
                    weatherConditions: {
                      ...factors.weatherConditions!,
                      temperature: temp
                    }
                  })}
                  className={cn(
                    "transition-all",
                    factors.weatherConditions?.temperature === temp && "bg-gradient-to-r from-blue-500 to-sky-500"
                  )}
                >
                  {temp === 'cold' ? '추움' : temp === 'moderate' ? '적당' : '더움'}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="block mb-2">습도</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as const).map((humidity) => (
                <Button
                  key={humidity}
                  variant={factors.weatherConditions?.humidity === humidity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFactors({
                    ...factors,
                    weatherConditions: {
                      ...factors.weatherConditions!,
                      humidity
                    }
                  })}
                  className={cn(
                    "transition-all",
                    factors.weatherConditions?.humidity === humidity && "bg-gradient-to-r from-cyan-500 to-blue-500"
                  )}
                >
                  {humidity === 'low' ? '낮음' : humidity === 'moderate' ? '보통' : '높음'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 건물 조건 */}
      <Card className="bg-white/95 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-amber-500" />
            건물 환경
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="block mb-2">거주 층수: {factors.buildingFactors?.floor}층</Label>
            <Slider
              value={[factors.buildingFactors?.floor || 1]}
              onValueChange={(value) => setFactors({
                ...factors,
                buildingFactors: {
                  ...factors.buildingFactors!,
                  floor: value[0]
                }
              })}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="elevator" className="flex items-center gap-2">
              엘리베이터 유무
            </Label>
            <Switch
              id="elevator"
              checked={factors.buildingFactors?.hasElevator}
              onCheckedChange={(checked) => setFactors({
                ...factors,
                buildingFactors: {
                  ...factors.buildingFactors!,
                  hasElevator: checked
                }
              })}
            />
          </div>

          <div>
            <Label className="block mb-2">
              주차장 거리: {factors.buildingFactors?.parkingDistance}m
            </Label>
            <Slider
              value={[factors.buildingFactors?.parkingDistance || 50]}
              onValueChange={(value) => setFactors({
                ...factors,
                buildingFactors: {
                  ...factors.buildingFactors!,
                  parkingDistance: value[0]
                }
              })}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          <div>
            <Label className="block mb-2">이웃 소음 민감도</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as const).map((sensitivity) => (
                <Button
                  key={sensitivity}
                  variant={factors.buildingFactors?.neighborSensitivity === sensitivity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFactors({
                    ...factors,
                    buildingFactors: {
                      ...factors.buildingFactors!,
                      neighborSensitivity: sensitivity
                    }
                  })}
                  className={cn(
                    "transition-all",
                    factors.buildingFactors?.neighborSensitivity === sensitivity && "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                >
                  {sensitivity === 'low' ? '낮음' : sensitivity === 'moderate' ? '보통' : '높음'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 특수 조건 */}
      <Card className="bg-white/95 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            특수 고려사항
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="children" className="flex items-center gap-2">
                어린이 거주
                <Info className="h-4 w-4 text-gray-400" />
              </Label>
              <Switch
                id="children"
                checked={factors.specialConditions?.hasChildren}
                onCheckedChange={(checked) => setFactors({
                  ...factors,
                  specialConditions: {
                    ...factors.specialConditions!,
                    hasChildren: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pets" className="flex items-center gap-2">
                반려동물 거주
                <Info className="h-4 w-4 text-gray-400" />
              </Label>
              <Switch
                id="pets"
                checked={factors.specialConditions?.hasPets}
                onCheckedChange={(checked) => setFactors({
                  ...factors,
                  specialConditions: {
                    ...factors.specialConditions!,
                    hasPets: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="wfh" className="flex items-center gap-2">
                재택근무
                <Info className="h-4 w-4 text-gray-400" />
              </Label>
              <Switch
                id="wfh"
                checked={factors.specialConditions?.workFromHome}
                onCheckedChange={(checked) => setFactors({
                  ...factors,
                  specialConditions: {
                    ...factors.specialConditions!,
                    workFromHome: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="flexible" className="flex items-center gap-2">
                유연한 일정
                <Info className="h-4 w-4 text-gray-400" />
              </Label>
              <Switch
                id="flexible"
                checked={factors.specialConditions?.flexibleSchedule}
                onCheckedChange={(checked) => setFactors({
                  ...factors,
                  specialConditions: {
                    ...factors.specialConditions!,
                    flexibleSchedule: checked
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 버튼 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-gray-300"
        >
          이전 단계
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!startDate}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <Wind className="mr-2 h-4 w-4" />
          환경 분석 완료
        </Button>
      </div>
    </div>
  )
}