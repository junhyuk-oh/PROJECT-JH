"use client"

import React, { useState } from 'react';
import { 
  Lightbulb, 
  DollarSign, 
  Clock, 
  Shield, 
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  Hammer,
  Users,
  Calendar,
  Zap,
  Target
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'cost' | 'time' | 'risk' | 'alternative';
  details?: string[];
  savings?: {
    cost?: number;
    time?: number;
  };
}

interface AIRecommendationsProps {
  recommendations: {
    costSaving: string[];
    timeSaving: string[];
    riskMitigation: string[];
    alternatives: string[];
  };
  projectInfo?: {
    totalCost: number;
    totalDays: number;
    diyPotential?: number;
    criticalTasks?: number;
  };
}

const categoryIcons = {
  cost: DollarSign,
  time: Clock,
  risk: Shield,
  alternative: TrendingUp
};

const categoryNames = {
  cost: '비용 절감',
  time: '일정 단축',
  risk: '리스크 관리',
  alternative: '대안 제시'
};

const categoryColors = {
  cost: 'bg-green-50 border-green-200 text-green-800',
  time: 'bg-blue-50 border-blue-200 text-blue-800',
  risk: 'bg-red-50 border-red-200 text-red-800',
  alternative: 'bg-purple-50 border-purple-200 text-purple-800'
};

const impactColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700'
};

const impactNames = {
  high: '높음',
  medium: '보통',
  low: '낮음'
};

export function AIRecommendations({ recommendations, projectInfo }: AIRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  
  // 추천사항을 구조화된 형태로 변환
  const structuredRecommendations: Recommendation[] = [
    ...recommendations.costSaving.map((rec, index) => {
      const savings = rec.match(/(\d+[\d,]*)\s*원/);
      const savingsAmount = savings ? parseInt(savings[1].replace(/,/g, '')) : 0;
      
      return {
        id: `cost-${index}`,
        title: rec.includes('DIY') ? 'DIY 작업으로 비용 절감' : '비용 절감 방안',
        description: rec,
        impact: savingsAmount > 5000000 ? 'high' : savingsAmount > 2000000 ? 'medium' : 'low',
        category: 'cost' as const,
        details: rec.includes('DIY') ? [
          '전문가 시공 대비 50% 이상 절감 가능',
          '작업 난이도를 고려한 선별적 DIY 추천',
          '필요한 도구 및 재료 리스트 제공'
        ] : undefined,
        savings: { cost: savingsAmount }
      };
    }),
    ...recommendations.timeSaving.map((rec, index) => ({
      id: `time-${index}`,
      title: rec.includes('병렬') ? '병렬 작업 최적화' : '일정 단축 방안',
      description: rec,
      impact: 'medium' as const,
      category: 'time' as const,
      details: rec.includes('병렬') ? [
        '독립적인 작업들의 동시 진행 가능',
        '전문가 팀 추가 투입으로 효율성 향상',
        '공간별 작업 분리로 간섭 최소화'
      ] : undefined
    })),
    ...recommendations.riskMitigation.map((rec, index) => ({
      id: `risk-${index}`,
      title: rec.includes('거주') ? '거주 중 공사 대책' : rec.includes('소음') ? '소음 관리 방안' : '리스크 완화',
      description: rec,
      impact: 'high' as const,
      category: 'risk' as const,
      details: rec.includes('거주') ? [
        '생활 공간과 공사 구역 완전 분리',
        '분진 차단막 및 환기 시스템 설치',
        '주말/야간 작업 최소화로 생활 영향 감소'
      ] : rec.includes('소음') ? [
        '법적 작업 가능 시간 준수',
        '이웃 사전 고지 및 양해 구하기',
        '저소음 공법 및 장비 사용'
      ] : undefined
    })),
    ...recommendations.alternatives.map((rec, index) => ({
      id: `alt-${index}`,
      title: '스마트한 대안',
      description: rec,
      impact: 'medium' as const,
      category: 'alternative' as const,
      details: [
        '최신 시공 기법 적용으로 품질 향상',
        '모듈형/조립식 자재로 시공 시간 단축',
        '친환경 자재 사용으로 장기적 이익'
      ]
    }))
  ];
  
  const filteredRecommendations = selectedCategory
    ? structuredRecommendations.filter(rec => rec.category === selectedCategory)
    : structuredRecommendations;
  
  // 카테고리별 통계
  const categoryStats = {
    cost: structuredRecommendations.filter(r => r.category === 'cost').length,
    time: structuredRecommendations.filter(r => r.category === 'time').length,
    risk: structuredRecommendations.filter(r => r.category === 'risk').length,
    alternative: structuredRecommendations.filter(r => r.category === 'alternative').length
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 헤더 */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI 추천사항</h3>
            <p className="text-sm text-gray-500">프로젝트 최적화를 위한 맞춤형 제안</p>
          </div>
        </div>
        
        {/* 요약 카드 */}
        {projectInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">예상 비용</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {(projectInfo.totalCost / 10000).toFixed(0)}만원
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">총 공사 기간</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {projectInfo.totalDays}일
              </div>
            </div>
            
            {projectInfo.diyPotential && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Hammer className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">DIY 가능</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {projectInfo.diyPotential}개
                </div>
              </div>
            )}
            
            {projectInfo.criticalTasks && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">중요 작업</span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {projectInfo.criticalTasks}개
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedCategory 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({structuredRecommendations.length})
          </button>
          {Object.entries(categoryStats).map(([category, count]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {categoryNames[category as keyof typeof categoryNames]} ({count})
              </button>
            );
          })}
        </div>
      </div>
      
      {/* 추천사항 목록 */}
      <div className="p-6 space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>해당 카테고리에 추천사항이 없습니다.</p>
          </div>
        ) : (
          filteredRecommendations.map(recommendation => {
            const Icon = categoryIcons[recommendation.category];
            const isExpanded = expandedRecommendation === recommendation.id;
            
            return (
              <div
                key={recommendation.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  categoryColors[recommendation.category]
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedRecommendation(
                    isExpanded ? null : recommendation.id
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            impactColors[recommendation.impact]
                          }`}>
                            영향도: {impactNames[recommendation.impact]}
                          </span>
                        </div>
                        <p className="text-sm opacity-90">{recommendation.description}</p>
                        
                        {recommendation.savings && (
                          <div className="flex gap-4 mt-2">
                            {recommendation.savings.cost && (
                              <div className="flex items-center gap-1 text-sm">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">
                                  {recommendation.savings.cost.toLocaleString()}원 절감
                                </span>
                              </div>
                            )}
                            {recommendation.savings.time && (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  {recommendation.savings.time}일 단축
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
                
                {isExpanded && recommendation.details && (
                  <div className="px-4 pb-4 border-t border-opacity-20">
                    <div className="pt-3 space-y-2">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        상세 실행 방안
                      </h5>
                      {recommendation.details.map((detail, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* 하단 액션 */}
      <div className="p-6 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            총 {structuredRecommendations.length}개의 추천사항이 있습니다.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" />
            전문가 상담 신청
          </button>
        </div>
      </div>
    </div>
  );
}