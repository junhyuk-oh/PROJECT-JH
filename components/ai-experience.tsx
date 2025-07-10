"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, CheckCircle, TrendingUp, Clock } from "lucide-react"

export default function AIExperience() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [formData, setFormData] = useState({
    area: "",
    budget: "",
    period: "",
    style: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    // 3초 후 결과 표시
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResult(true)
    }, 3000)
  }

  const resetForm = () => {
    setShowResult(false)
    setFormData({
      area: "",
      budget: "",
      period: "",
      style: "",
      description: "",
    })
  }

  return (
    <section id="experience" className="py-16 md:py-20 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              🤖 AI 맞춤 분석 체험
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            간단한 정보 입력만으로 AI가 맞춤형 인테리어 계획을 즉시 생성해드립니다
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!showResult ? (
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-800">내 집 맞춤 AI 공정표 무료로 받기</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📏 평수</label>
                      <select
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="15평 이하">15평 이하</option>
                        <option value="16-25평">16-25평</option>
                        <option value="26-35평">26-35평</option>
                        <option value="36평 이상">36평 이상</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">💰 예산</label>
                      <select
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="1000만원 이하">1000만원 이하</option>
                        <option value="1000-2000만원">1000-2000만원</option>
                        <option value="2000-3000만원">2000-3000만원</option>
                        <option value="3000-5000만원">3000-5000만원</option>
                        <option value="5000만원 이상">5000만원 이상</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">⏰ 희망 기간</label>
                      <select
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="2주">2주</option>
                        <option value="3-4주">3-4주</option>
                        <option value="5-6주">5-6주</option>
                        <option value="7-8주">7-8주</option>
                        <option value="8주 이상">8주 이상</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🎨 희망 스타일</label>
                      <select
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="모던">모던</option>
                        <option value="미니멀">미니멀</option>
                        <option value="클래식">클래식</option>
                        <option value="빈티지">빈티지</option>
                        <option value="스칸디나비안">스칸디나비안</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 상세 설명 (선택사항)</label>
                    <textarea
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base h-24"
                      placeholder="특별한 요구사항이나 선호하는 스타일에 대해 자세히 알려주세요..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-8 md:px-12 py-3 md:py-4 text-base md:text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />🔄 AI가 분석 중입니다...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          AI 맞춤 분석 시작하기
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-green-700 flex items-center justify-center">
                  <CheckCircle className="mr-2 h-6 w-6" />
                  AI 분석 완료! 🎉
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-800">예상 기간</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">3-4주</p>
                    <p className="text-sm text-blue-700 mt-1">최적화된 공정 순서</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-purple-800">추천 스타일</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{formData.style}</p>
                    <p className="text-sm text-purple-700 mt-1">맞춤형 디자인</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-green-800">예산 최적화</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">-25%</p>
                    <p className="text-sm text-green-700 mt-1">비용 절약 가능</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3">🎯 AI 추천 사항</h3>
                  <ul className="space-y-2 text-orange-700">
                    <li>
                      • {formData.area} 공간에 최적화된 {formData.style} 스타일 적용
                    </li>
                    <li>• 예산 {formData.budget} 범위 내에서 최대 효과를 위한 우선순위 공정</li>
                    <li>• 검증된 지역 업체 3곳 자동 매칭 완료</li>
                    <li>• 실시간 진행률 체크를 위한 AI 카메라 분석 준비</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    📋 상세 공정표 받기
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={resetForm}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                  >
                    🔄 다시 분석하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
