"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Home, ChefHat, Bed, Bath, Sofa, DoorOpen, Calculator, CheckCircle } from 'lucide-react'
import { SpaceSelection, ROOM_AREA_RATIOS } from '@/lib/types'

interface SpaceSelectionFormProps {
  totalArea: number
  onComplete: (spaces: SpaceSelection[]) => void
  initialSpaces?: SpaceSelection[]
}

const AVAILABLE_SPACES = [
  { id: 'living_room', name: '거실', icon: Sofa, color: 'bg-blue-500' },
  { id: 'kitchen', name: '주방', icon: ChefHat, color: 'bg-green-500' },
  { id: 'master_bedroom', name: '안방', icon: Bed, color: 'bg-purple-500' },
  { id: 'small_bedroom', name: '작은방', icon: Bed, color: 'bg-pink-500' },
  { id: 'bathroom', name: '욕실', icon: Bath, color: 'bg-cyan-500' },
  { id: 'entrance', name: '현관', icon: DoorOpen, color: 'bg-orange-500' }
]

const FLOORING_OPTIONS = [
  { value: 'laminate', label: '강화마루', cost: '저' },
  { value: 'hardwood', label: '원목마루', cost: '고' },
  { value: 'tile', label: '타일', cost: '중' },
  { value: 'carpet', label: '카펫', cost: '저' }
]

const WALL_OPTIONS = [
  { value: 'wallpaper', label: '도배', cost: '저' },
  { value: 'paint', label: '페인트', cost: '저' },
  { value: 'tile', label: '타일', cost: '중' },
  { value: 'paneling', label: '패널링', cost: '고' }
]

export default function SpaceSelectionForm({ totalArea, onComplete, initialSpaces = [] }: SpaceSelectionFormProps) {
  const [selectedSpaces, setSelectedSpaces] = useState<SpaceSelection[]>(initialSpaces)
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null)

  // 자동 면적 계산
  const estimateRoomArea = (spaceId: string): number => {
    const ratio = ROOM_AREA_RATIOS[spaceId as keyof typeof ROOM_AREA_RATIOS] || 0.1
    return Math.round(totalArea * ratio)
  }

  // 공간 추가
  const addSpace = (spaceInfo: typeof AVAILABLE_SPACES[0]) => {
    const estimatedArea = estimateRoomArea(spaceInfo.id)
    const newSpace: SpaceSelection = {
      id: spaceInfo.id,
      name: spaceInfo.name,
      estimatedArea,
      actualArea: estimatedArea,
      scope: 'full',
      tasks: {},
      priority: 3
    }
    setSelectedSpaces(prev => [...prev, newSpace])
    setCurrentSpaceId(spaceInfo.id)
  }

  // 공간 제거
  const removeSpace = (spaceId: string) => {
    setSelectedSpaces(prev => prev.filter(space => space.id !== spaceId))
    if (currentSpaceId === spaceId) {
      setCurrentSpaceId(null)
    }
  }

  // 공간 정보 업데이트
  const updateSpace = (spaceId: string, updates: Partial<SpaceSelection>) => {
    setSelectedSpaces(prev => prev.map(space => 
      space.id === spaceId ? { ...space, ...updates } : space
    ))
  }

  // 작업 선택 토글
  const toggleTask = (spaceId: string, category: string, value: string) => {
    const space = selectedSpaces.find(s => s.id === spaceId)
    if (!space) return

    const currentTasks = space.tasks[category as keyof typeof space.tasks] || []
    let newTasks: any
    
    if (Array.isArray(currentTasks)) {
      newTasks = (currentTasks as string[]).includes(value)
        ? (currentTasks as string[]).filter(t => t !== value)
        : [...(currentTasks as string[]), value]
    } else {
      newTasks = currentTasks
    }

    updateSpace(spaceId, {
      tasks: { ...space.tasks, [category]: newTasks }
    })
  }

  // 총 작업 기간 계산 (일정 중심)
  const calculateTotalDuration = (): number => {
    return selectedSpaces.reduce((total, space) => {
      const baseDays = space.actualArea * (space.scope === 'full' ? 2 : 1) // 평당 1-2일
      return total + baseDays
    }, 0)
  }

  const currentSpace = selectedSpaces.find(space => space.id === currentSpaceId)
  const availableToAdd = AVAILABLE_SPACES.filter(space => 
    !selectedSpaces.some(selected => selected.id === space.id)
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            🏠 공간별 상세 선택
          </span>
        </h2>
        <p className="text-lg text-gray-600">
          인테리어할 공간을 선택하고 각 공간의 세부 작업을 설정해주세요
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-700 font-medium">
          <span>총 면적: {totalArea}평</span>
          <Separator orientation="vertical" className="h-4" />
          <span>선택된 공간: {selectedSpaces.length}개</span>
          <Separator orientation="vertical" className="h-4" />
          <span>예상 작업기간: {calculateTotalDuration()}일</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 공간 선택 영역 */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                공간 추가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableToAdd.map(space => {
                const Icon = space.icon
                const estimatedArea = estimateRoomArea(space.id)
                return (
                  <Button
                    key={space.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => addSpace(space)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${space.color} flex items-center justify-center mr-3`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{space.name}</div>
                      <div className="text-sm text-gray-700 font-medium">예상 {estimatedArea}평</div>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* 선택된 공간 목록 */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 rounded-2xl">
            <CardHeader>
              <CardTitle>선택된 공간</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedSpaces.map(space => {
                const spaceInfo = AVAILABLE_SPACES.find(s => s.id === space.id)
                const Icon = spaceInfo?.icon || Home
                return (
                  <div
                    key={space.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentSpaceId === space.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentSpaceId(space.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded ${spaceInfo?.color} flex items-center justify-center mr-2`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{space.name}</div>
                        <div className="text-xs text-gray-700 font-medium">{space.actualArea}평</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {space.scope === 'full' ? '전체' : '부분'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSpace(space.id)
                        }}
                        className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* 상세 설정 영역 */}
        <div className="lg:col-span-2">
          {currentSpace ? (
            <Card className="bg-white/90 backdrop-blur-sm border-green-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {(() => {
                    const spaceInfo = AVAILABLE_SPACES.find(s => s.id === currentSpace.id)
                    const Icon = spaceInfo?.icon || Home
                    return (
                      <>
                        <div className={`w-6 h-6 rounded ${spaceInfo?.color} flex items-center justify-center mr-2`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        {currentSpace.name} 상세 설정
                      </>
                    )
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="area">실제 면적 (평)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={currentSpace.actualArea}
                      onChange={(e) => updateSpace(currentSpace.id, { 
                        actualArea: parseInt(e.target.value) || 0 
                      })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-700 font-medium mt-1">
                      예상: {currentSpace.estimatedArea}평
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="scope">작업 범위</Label>
                    <Select
                      value={currentSpace.scope}
                      onValueChange={(value: 'full' | 'partial') => 
                        updateSpace(currentSpace.id, { scope: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="작업 범위 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">전체 리모델링</SelectItem>
                        <SelectItem value="partial">부분 리모델링</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">우선순위</Label>
                    <Select
                      value={currentSpace.priority.toString()}
                      onValueChange={(value) => 
                        updateSpace(currentSpace.id, { priority: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="우선순위 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">매우 높음</SelectItem>
                        <SelectItem value="2">높음</SelectItem>
                        <SelectItem value="3">보통</SelectItem>
                        <SelectItem value="4">낮음</SelectItem>
                        <SelectItem value="5">매우 낮음</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* 바닥재 선택 */}
                <div>
                  <Label className="text-base font-semibold">바닥재</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {FLOORING_OPTIONS.map(option => (
                      <div
                        key={option.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          (currentSpace.tasks.flooring || []).includes(option.value as any)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleTask(currentSpace.id, 'flooring', option.value as any)}
                      >
                        <div className="font-medium text-sm text-gray-800">{option.label}</div>
                        <div className="text-xs text-gray-700 mt-1 font-medium">
                          {option.value === 'laminate' && '내구성 좋음, 관리 용이'}
                          {option.value === 'hardwood' && '고급스러움, 습기 주의'}
                          {option.value === 'tile' && '방수 우수, 차가움'}
                          {option.value === 'carpet' && '보온성 좋음, 청소 어려움'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 벽면 작업 */}
                <div>
                  <Label className="text-base font-semibold">벽면 작업</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {WALL_OPTIONS.map(option => (
                      <div
                        key={option.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          (currentSpace.tasks.walls || []).includes(option.value as any)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleTask(currentSpace.id, 'walls', option.value as any)}
                      >
                        <div className="font-medium text-sm text-gray-800">{option.label}</div>
                        <div className="text-xs text-gray-700 mt-1 font-medium">
                          {option.value === 'wallpaper' && '빠른 시공, 교체 용이'}
                          {option.value === 'paint' && '간편함, 색상 자유'}
                          {option.value === 'tile' && '내구성 우수, 청소 편함'}
                          {option.value === 'paneling' && '고급감, 단열 효과'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 추가 작업 */}
                <div>
                  <Label className="text-base font-semibold">추가 작업</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="electrical"
                        checked={currentSpace.tasks.electrical || false}
                        onCheckedChange={(checked) => 
                          updateSpace(currentSpace.id, {
                            tasks: { ...currentSpace.tasks, electrical: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="electrical">전기 공사</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="furniture"
                        checked={currentSpace.tasks.furniture || false}
                        onCheckedChange={(checked) => 
                          updateSpace(currentSpace.id, {
                            tasks: { ...currentSpace.tasks, furniture: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="furniture">가구 설치</Label>
                    </div>
                  </div>
                </div>

                {/* 주방 전용 옵션 */}
                {currentSpace.id === 'kitchen' && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-semibold">주방 전용 작업</Label>
                      <div className="space-y-4 mt-3">
                        <div>
                          <Label className="text-sm">싱크대</Label>
                          <Select
                            value={currentSpace.tasks.sink || ''}
                            onValueChange={(value) => 
                              updateSpace(currentSpace.id, {
                                tasks: { ...currentSpace.tasks, sink: value as any }
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="선택해주세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_replace">전체 교체</SelectItem>
                              <SelectItem value="countertop_only">상판만 교체</SelectItem>
                              <SelectItem value="door_only">도어만 교체</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 욕실 전용 옵션 */}
                {currentSpace.id === 'bathroom' && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-semibold">욕실 전용 작업</Label>
                      <div className="mt-3">
                        <Select
                          value={currentSpace.tasks.renovation || ''}
                          onValueChange={(value) => 
                            updateSpace(currentSpace.id, {
                              tasks: { ...currentSpace.tasks, renovation: value as any }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="리모델링 범위 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">전체 리모델링</SelectItem>
                            <SelectItem value="tile_only">타일만 교체</SelectItem>
                            <SelectItem value="fixtures_only">기구만 교체</SelectItem>
                            <SelectItem value="waterproof">방수만 보수</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {/* 작업 일정 & 주의사항 */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">🗓️ 이 공간 예상 작업기간</span>
                    <span className="text-lg font-bold text-blue-600">
                      {currentSpace.actualArea * (currentSpace.scope === 'full' ? 2 : 1)}일
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-700">💡 작업 주의사항:</p>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {currentSpace.scope === 'full' ? (
                        <>
                          <li>• 전체 리모델링: 2-3주 정도 사용 불가</li>
                          <li>• 먼지 차단: 다른 공간과 분리 필수</li>
                          <li>• 소음 시간: 평일 9시-6시 권장</li>
                        </>
                      ) : (
                        <>
                          <li>• 부분 리모델링: 생활하며 진행 가능</li>
                          <li>• 최소 불편: 하루 3-4시간 작업</li>
                          <li>• 순서 중요: 바닥재 → 벽면 → 마감</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calculator className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  공간을 선택해주세요
                </h3>
                <p className="text-gray-600 text-center font-medium">
                  왼쪽에서 인테리어할 공간을 선택하면<br />
                  상세 설정을 할 수 있습니다
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={() => onComplete(selectedSpaces)}
          disabled={selectedSpaces.length === 0}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-8"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          공간 선택 완료 ({selectedSpaces.length}개 공간)
        </Button>
      </div>
    </div>
  )
}