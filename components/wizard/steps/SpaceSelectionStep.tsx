"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react"

interface Space {
  id: string
  name: string
  icon: string
  selected: boolean
  actualArea?: number
  works: {
    id: string
    name: string
    category: string
    selected: boolean
    recommended?: boolean
    dependsOn?: string[]
  }[]
}

interface SpaceSelectionStepProps {
  onNext: (spaces: Space[]) => void
  onPrev?: () => void
  defaultSpaces?: Space[]
}

const SPACE_OPTIONS: Space[] = [
  {
    id: "living",
    name: "거실",
    icon: "🛋️",
    selected: false,
    works: [
      { id: "living_demo", name: "기존 마감재 철거", category: "demolition", selected: false },
      { id: "living_floor", name: "바닥재 교체", category: "flooring", selected: false },
      { id: "living_wall", name: "벽지/페인트", category: "painting", selected: false },
      { id: "living_lighting", name: "조명 교체", category: "lighting", selected: false },
      { id: "living_tv_wall", name: "TV 벽면 조성", category: "carpentry", selected: false }
    ]
  },
  {
    id: "kitchen",
    name: "주방",
    icon: "🍳",
    selected: false,
    works: [
      { id: "kitchen_demo", name: "기존 주방 철거", category: "demolition", selected: false },
      { id: "kitchen_sink", name: "싱크대 교체", category: "carpentry", selected: false },
      { id: "kitchen_tile", name: "벽 타일 시공", category: "tile", selected: false },
      { id: "kitchen_cabinet", name: "수납장 설치", category: "carpentry", selected: false },
      { id: "kitchen_appliance", name: "빌트인 가전 설치", category: "electrical", selected: false }
    ]
  },
  {
    id: "bathroom",
    name: "욕실",
    icon: "🚿",
    selected: false,
    works: [
      { id: "bath_demo", name: "기존 욕실 철거", category: "demolition", selected: false },
      { id: "bath_waterproof", name: "방수 작업", category: "plumbing", selected: false, recommended: true },
      { id: "bath_tile", name: "벽/바닥 타일", category: "tile", selected: false },
      { id: "bath_toilet", name: "양변기 교체", category: "plumbing", selected: false },
      { id: "bath_basin", name: "세면대 교체", category: "plumbing", selected: false }
    ]
  },
  {
    id: "bedroom",
    name: "안방",
    icon: "🛏️",
    selected: false,
    works: [
      { id: "bed_demo", name: "기존 마감재 철거", category: "demolition", selected: false },
      { id: "bed_floor", name: "바닥재 교체", category: "flooring", selected: false },
      { id: "bed_wall", name: "벽지/페인트", category: "painting", selected: false },
      { id: "bed_closet", name: "붙박이장 설치", category: "carpentry", selected: false },
      { id: "bed_window", name: "창호 교체", category: "installation", selected: false }
    ]
  },
  {
    id: "room",
    name: "작은방",
    icon: "🚪",
    selected: false,
    works: [
      { id: "room_demo", name: "기존 마감재 철거", category: "demolition", selected: false },
      { id: "room_floor", name: "바닥재 교체", category: "flooring", selected: false },
      { id: "room_wall", name: "벽지/페인트", category: "painting", selected: false },
      { id: "room_closet", name: "수납장 설치", category: "carpentry", selected: false }
    ]
  },
  {
    id: "entrance",
    name: "현관",
    icon: "🏠",
    selected: false,
    works: [
      { id: "ent_demo", name: "기존 마감재 철거", category: "demolition", selected: false },
      { id: "ent_floor", name: "바닥 타일 교체", category: "tile", selected: false },
      { id: "ent_shoe", name: "신발장 설치", category: "carpentry", selected: false },
      { id: "ent_door", name: "현관문 교체", category: "installation", selected: false }
    ]
  },
  {
    id: "balcony",
    name: "베란다",
    icon: "🌿",
    selected: false,
    works: [
      { id: "bal_demo", name: "기존 마감재 철거", category: "demolition", selected: false },
      { id: "bal_expand", name: "확장 공사", category: "construction", selected: false },
      { id: "bal_window", name: "샷시 교체", category: "installation", selected: false },
      { id: "bal_tile", name: "타일 시공", category: "tile", selected: false }
    ]
  }
]

export default function SpaceSelectionStep({ onNext, onPrev, defaultSpaces }: SpaceSelectionStepProps) {
  const [spaces, setSpaces] = useState<Space[]>(defaultSpaces && defaultSpaces.length > 0 ? defaultSpaces : SPACE_OPTIONS)
  const [expandedSpaces, setExpandedSpaces] = useState<string[]>([])
  const [showDependencyWarning, setShowDependencyWarning] = useState(false)

  // 의존성 검사 및 자동 추천
  useEffect(() => {
    const updatedSpaces = spaces.map(space => {
      if (space.selected) {
        // 욕실 선택 시 방수 작업 추천
        if (space.id === "bathroom") {
          space.works = space.works.map(work => {
            if (work.id === "bath_waterproof") {
              work.recommended = true
            }
            return work
          })
        }
        
        // 주방과 거실이 함께 선택되면 동선 최적화 추천
        const hasKitchen = spaces.find(s => s.id === "kitchen" && s.selected)
        const hasLiving = spaces.find(s => s.id === "living" && s.selected)
        if (hasKitchen && hasLiving) {
          setShowDependencyWarning(true)
        }
      }
      return space
    })
    
    setSpaces(updatedSpaces)
  }, [spaces.map(s => s.selected).join(",")])

  const toggleSpace = (spaceId: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        const newSelected = !space.selected
        return { 
          ...space, 
          selected: newSelected,
          // 공간 선택 시 필수 작업 자동 선택
          works: space.works.map(work => ({
            ...work,
            selected: newSelected && (work.category === "demolition" || work.recommended)
          }))
        }
      }
      return space
    }))
    
    // 선택된 공간 자동 확장
    if (!expandedSpaces.includes(spaceId)) {
      setExpandedSpaces(prev => [...prev, spaceId])
    }
  }

  const toggleSelectAll = () => {
    const allSelected = spaces.every(s => s.selected)
    setSpaces(prev => prev.map(space => ({
      ...space,
      selected: !allSelected,
      works: space.works.map(work => ({
        ...work,
        selected: !allSelected && (work.category === "demolition" || work.recommended)
      }))
    })))
  }

  const toggleWork = (spaceId: string, workId: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          works: space.works.map(work => {
            if (work.id === workId) {
              return { ...work, selected: !work.selected }
            }
            return work
          })
        }
      }
      return space
    }))
  }

  const toggleExpanded = (spaceId: string) => {
    setExpandedSpaces(prev => 
      prev.includes(spaceId) 
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    )
  }

  const getSelectedCount = () => {
    return spaces.filter(s => s.selected).length
  }

  const getTotalWorkCount = () => {
    return spaces.reduce((acc, space) => {
      if (space.selected) {
        return acc + space.works.filter(w => w.selected).length
      }
      return acc
    }, 0)
  }

  const canProceed = () => {
    return spaces.some(s => s.selected && s.works.some(w => w.selected))
  }

  const handleNext = () => {
    const selectedSpaces = spaces.filter(s => s.selected && s.works.some(w => w.selected))
    onNext(selectedSpaces)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-3 text-gray-900">
        🏠 어떤 공간을 바꾸고 싶으세요?
      </h2>
      <p className="text-lg text-gray-600 mb-2">여러 공간을 선택할 수 있어요</p>
      
      {/* 선택 상태 요약 */}
      <div className="flex items-center gap-4 mb-6">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {getSelectedCount()}개 공간 선택됨
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {getTotalWorkCount()}개 작업 예정
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSelectAll}
          className="ml-auto"
        >
          {spaces.every(s => s.selected) ? "전체 해제" : "전체 선택"}
        </Button>
      </div>

      {/* AI 추천 알림 */}
      <AnimatePresence>
        {showDependencyWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-blue-50 border-blue-200 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    💡 AI 추천: 주방과 거실을 함께 하시는군요!
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    동선 최적화를 위해 현관 쪽 작업도 함께 진행하시면 효율적입니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 공간 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {spaces.map((space) => (
          <motion.div
            key={space.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${
                space.selected 
                  ? "border-orange-400 bg-orange-50" 
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => toggleSpace(space.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{space.icon}</div>
                <p className="font-medium text-gray-900">{space.name}</p>
                {space.selected && (
                  <Badge className="mt-2 bg-orange-500 text-white">선택됨</Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {/* 전체 선택 카드 */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Card 
            className={`cursor-pointer transition-all ${
              spaces.every(s => s.selected)
                ? "border-orange-400 bg-orange-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={toggleSelectAll}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏡</div>
              <p className="font-medium text-gray-900">전체</p>
              {spaces.every(s => s.selected) && (
                <Badge className="mt-2 bg-orange-500 text-white">선택됨</Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 선택된 공간별 상세 작업 */}
      <AnimatePresence>
        {spaces.filter(s => s.selected).map((space) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4 border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpanded(space.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{space.icon}</span>
                    <h3 className="font-semibold text-lg text-gray-900">{space.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {space.works.filter(w => w.selected).length}개 작업
                    </Badge>
                  </div>
                  {expandedSpaces.includes(space.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                
                <AnimatePresence>
                  {expandedSpaces.includes(space.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {space.works.map((work) => (
                        <label
                          key={work.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            work.selected 
                              ? "bg-white border border-orange-300" 
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <Checkbox
                            checked={work.selected}
                            onCheckedChange={() => toggleWork(space.id, work.id)}
                          />
                          <span className="flex-1 text-gray-900">{work.name}</span>
                          {work.recommended && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              <Sparkles className="w-3 h-3 mr-1" />
                              추천
                            </Badge>
                          )}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 하단 버튼 */}
      <div className="mt-8 flex justify-between">
        {onPrev && (
          <Button 
            size="lg"
            variant="outline"
            onClick={onPrev}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            이전
          </Button>
        )}
        <Button 
          size="lg"
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 ml-auto"
        >
          다음 단계
        </Button>
      </div>
    </div>
  )
}