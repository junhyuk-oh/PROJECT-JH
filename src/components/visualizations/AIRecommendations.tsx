"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  DollarSign,
  Lightbulb,
  Target,
  Shield,
  CheckCircle
} from 'lucide-react'

interface Recommendation {
  id: string
  type: 'optimization' | 'cost' | 'risk' | 'tip'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  priority: number
  actions?: string[]
}

interface AIRecommendationsProps {
  projectData?: any
  scheduleData?: any
}

export function AIRecommendations({ projectData, scheduleData }: AIRecommendationsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')

  // 더미 추천 데이터 (실제로는 AI 서비스에서 가져옴)
  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'optimization',
      title: '병렬 작업 최적화 가능',
      description: '기초 공사와 자재 발주를 동시에 진행하면 전체 공기를 5일 단축할 수 있습니다.',
      impact: 'high',
      priority: 1,
      actions: [
        '자재 발주팀과 시공팀 간 사전 조율 회의 진행',
        '병렬 작업 가능한 공정 리스트 작성',
        '일일 진행 상황 공유 시스템 구축'
      ]
    },
    {
      id: '2',
      type: 'cost',
      title: '비용 절감 기회 발견',
      description: '대량 구매 시 자재비를 15% 절감할 수 있습니다. 예상 절감액: 1,500만원',
      impact: 'high',
      priority: 2,
      actions: [
        '주요 자재 업체와 대량 구매 협상',
        '타 현장과 공동 구매 검토',
        '장기 계약을 통한 추가 할인 협의'
      ]
    },
    {
      id: '3',
      type: 'risk',
      title: '우기 대비 필요',
      description: '6-7월 집중 호우 기간에 외부 작업이 예정되어 있습니다. 대체 일정 수립이 필요합니다.',
      impact: 'medium',
      priority: 3,
      actions: [
        '우천 시 대체 작업 계획 수립',
        '방수 자재 사전 확보',
        '실내 작업 우선 배치 검토'
      ]
    },
    {
      id: '4',
      type: 'tip',
      title: '품질 검사 일정 최적화',
      description: '주요 공정 완료 후 즉시 검사를 진행하면 재작업 비용을 줄일 수 있습니다.',
      impact: 'medium',
      priority: 4,
      actions: [
        '단계별 품질 검사 체크리스트 작성',
        '검사 인력 사전 배치',
        '즉각적인 피드백 시스템 구축'
      ]
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Target className="w-5 h-5" />
      case 'cost': return <DollarSign className="w-5 h-5" />
      case 'risk': return <AlertCircle className="w-5 h-5" />
      case 'tip': return <Lightbulb className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cost': return 'bg-green-100 text-green-700 border-green-200'
      case 'risk': return 'bg-red-100 text-red-700 border-red-200'
      case 'tip': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    }
    const labels = {
      high: '높음',
      medium: '보통',
      low: '낮음'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[impact as keyof typeof colors]}`}>
        영향도: {labels[impact as keyof typeof labels]}
      </span>
    )
  }

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === selectedType)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI 추천사항</h2>
            <p className="text-sm text-gray-500">프로젝트 분석 기반 맞춤 제안</p>
          </div>
        </div>
        
        {/* 필터 탭 */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: '전체' },
            { value: 'optimization', label: '최적화' },
            { value: 'cost', label: '비용' },
            { value: 'risk', label: '리스크' },
            { value: 'tip', label: '팁' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedType === tab.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 추천 카드 리스트 */}
      <div className="grid gap-4">
        {filteredRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => setExpandedCard(
                expandedCard === recommendation.id ? null : recommendation.id
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg border ${getTypeColor(recommendation.type)}`}>
                    {getIcon(recommendation.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {recommendation.title}
                      </h3>
                      {getImpactBadge(recommendation.impact)}
                    </div>
                    <p className="text-gray-600">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    우선순위 {recommendation.priority}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedCard === recommendation.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* 확장된 내용 */}
            <motion.div
              initial={false}
              animate={{
                height: expandedCard === recommendation.id ? 'auto' : 0,
                opacity: expandedCard === recommendation.id ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    실행 계획
                  </h4>
                  <div className="space-y-2">
                    {recommendation.actions?.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{action}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                      실행하기
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">예상 공기 단축</p>
              <p className="text-2xl font-bold text-blue-900">12일</p>
            </div>
            <Clock className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">예상 비용 절감</p>
              <p className="text-2xl font-bold text-green-900">2,500만원</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-300" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">리스크 감소율</p>
              <p className="text-2xl font-bold text-purple-900">35%</p>
            </div>
            <Shield className="w-8 h-8 text-purple-300" />
          </div>
        </div>
      </div>
    </div>
  )
}