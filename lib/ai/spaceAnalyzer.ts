import { ProjectBasicInfo } from '@/lib/types'

export interface SpaceRecommendation {
  spaceId: string
  spaceName: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  estimatedDuration: number
  estimatedCost: number
  suggestedOptions: string[]
  aiScore: number // 0-100
}

export interface SpaceAnalysis {
  recommendations: SpaceRecommendation[]
  insights: {
    totalEstimatedDuration: number
    totalEstimatedCost: number
    criticalSpaces: string[]
    costSavingTips: string[]
    sequenceOptimization: string[]
  }
}

export class SmartSpaceAnalyzer {
  constructor(private projectInfo: ProjectBasicInfo) {}

  analyzeSpaces(): SpaceAnalysis {
    const recommendations = this.generateRecommendations()
    const insights = this.generateInsights(recommendations)
    
    return { recommendations, insights }
  }

  private generateRecommendations(): SpaceRecommendation[] {
    const { totalArea, priority, residenceStatus, designStatus, totalBudget } = this.projectInfo
    const recommendations: SpaceRecommendation[] = []
    
    // 거실 분석
    if (totalArea >= 20) {
      recommendations.push({
        spaceId: 'livingroom',
        spaceName: '거실',
        priority: 'high',
        reason: '가족 생활의 중심 공간으로 전체 인테리어의 분위기를 결정합니다',
        estimatedDuration: this.calculateDuration('livingroom', totalArea),
        estimatedCost: this.calculateCost('livingroom', totalArea, totalBudget),
        suggestedOptions: this.getSuggestedOptions('livingroom', priority),
        aiScore: this.calculateAIScore('livingroom', { totalArea, priority, designStatus })
      })
    }

    // 주방 분석
    recommendations.push({
      spaceId: 'kitchen',
      spaceName: '주방',
      priority: residenceStatus === 'occupied' ? 'high' : 'medium',
      reason: residenceStatus === 'occupied' 
        ? '거주 중에는 주방 사용이 필수적이므로 우선 순위가 높습니다'
        : '빈집에서는 전체 공사와 함께 진행 가능합니다',
      estimatedDuration: this.calculateDuration('kitchen', totalArea),
      estimatedCost: this.calculateCost('kitchen', totalArea, totalBudget),
      suggestedOptions: this.getSuggestedOptions('kitchen', priority),
      aiScore: this.calculateAIScore('kitchen', { totalArea, priority, residenceStatus })
    })

    // 침실 분석 (평수에 따라)
    const bedroomCount = this.estimateBedroomCount(totalArea)
    for (let i = 1; i <= bedroomCount; i++) {
      const isMainBedroom = i === 1
      recommendations.push({
        spaceId: `bedroom${i}`,
        spaceName: isMainBedroom ? '안방' : `침실${i}`,
        priority: isMainBedroom ? 'high' : 'medium',
        reason: isMainBedroom 
          ? '주요 휴식 공간으로 숙면 환경 조성이 중요합니다'
          : '가족 구성원의 개인 공간으로 기능성이 중요합니다',
        estimatedDuration: this.calculateDuration('bedroom', totalArea / bedroomCount),
        estimatedCost: this.calculateCost('bedroom', totalArea / bedroomCount, totalBudget),
        suggestedOptions: this.getSuggestedOptions('bedroom', priority),
        aiScore: this.calculateAIScore('bedroom', { 
          totalArea: totalArea / bedroomCount, 
          priority, 
          isMain: isMainBedroom 
        })
      })
    }

    // 욕실 분석
    const bathroomCount = this.estimateBathroomCount(totalArea)
    for (let i = 1; i <= bathroomCount; i++) {
      recommendations.push({
        spaceId: `bathroom${i}`,
        spaceName: i === 1 ? '화장실' : `욕실${i}`,
        priority: 'high',
        reason: '방수와 배관 작업이 필요한 핵심 공간입니다',
        estimatedDuration: this.calculateDuration('bathroom', 5),
        estimatedCost: this.calculateCost('bathroom', 5, totalBudget),
        suggestedOptions: this.getSuggestedOptions('bathroom', priority),
        aiScore: this.calculateAIScore('bathroom', { priority, waterproofing: true })
      })
    }

    // 현관/복도
    if (totalArea >= 25) {
      recommendations.push({
        spaceId: 'entrance',
        spaceName: '현관/복도',
        priority: 'low',
        reason: '첫인상을 결정하는 공간이지만 공사 규모는 작습니다',
        estimatedDuration: this.calculateDuration('entrance', 3),
        estimatedCost: this.calculateCost('entrance', 3, totalBudget),
        suggestedOptions: this.getSuggestedOptions('entrance', priority),
        aiScore: this.calculateAIScore('entrance', { totalArea, priority })
      })
    }

    // 베란다/발코니
    if (totalArea >= 30) {
      recommendations.push({
        spaceId: 'balcony',
        spaceName: '베란다/발코니',
        priority: 'medium',
        reason: '확장 여부에 따라 공간 활용도가 크게 달라집니다',
        estimatedDuration: this.calculateDuration('balcony', 5),
        estimatedCost: this.calculateCost('balcony', 5, totalBudget),
        suggestedOptions: this.getSuggestedOptions('balcony', priority),
        aiScore: this.calculateAIScore('balcony', { totalArea, priority })
      })
    }

    // AI 점수 기준으로 정렬
    return recommendations.sort((a, b) => b.aiScore - a.aiScore)
  }

  private calculateDuration(spaceType: string, area: number): number {
    const baseDuration = {
      livingroom: 5,
      kitchen: 7,
      bedroom: 4,
      bathroom: 6,
      entrance: 2,
      balcony: 3
    }

    const base = baseDuration[spaceType] || 4
    const areaFactor = Math.sqrt(area / 10) // 면적에 따른 보정
    
    return Math.round(base * areaFactor)
  }

  private calculateCost(spaceType: string, area: number, totalBudget: number): number {
    const costRatio = {
      livingroom: 0.25,
      kitchen: 0.30,
      bedroom: 0.15,
      bathroom: 0.20,
      entrance: 0.05,
      balcony: 0.05
    }

    const ratio = costRatio[spaceType] || 0.15
    const baseCost = totalBudget * ratio * 10000 // 만원 단위를 원으로 변환
    const areaFactor = area / 10

    return Math.round(baseCost * areaFactor)
  }

  private getSuggestedOptions(spaceType: string, priority: string): string[] {
    const options: Record<string, Record<string, string[]>> = {
      livingroom: {
        cost: ['벽지 교체', '조명 교체', '바닥 부분 보수'],
        time: ['아트월 시공', 'TV장 설치', '천장 몰딩'],
        quality: ['대리석 아트월', '간접조명 시공', '고급 바닥재']
      },
      kitchen: {
        cost: ['싱크대 도어 교체', '타일 부분 교체', '수전 교체'],
        time: ['상부장 추가', '아일랜드 설치', '수납장 정리'],
        quality: ['빌트인 가전', '천연석 상판', '고급 수납 시스템']
      },
      bedroom: {
        cost: ['벽지 교체', '조명 교체', '커튼 설치'],
        time: ['붙박이장 설치', '침대 헤드 제작', '블라인드 설치'],
        quality: ['드레스룸 구성', '호텔식 조명', '방음 시공']
      },
      bathroom: {
        cost: ['타일 부분 교체', '양변기 교체', '수전 교체'],
        time: ['욕조 설치', '샤워부스 교체', '수납장 추가'],
        quality: ['전체 타일 교체', '고급 위생도기', '습식/건식 분리']
      },
      entrance: {
        cost: ['신발장 정리', '벽지 교체', '조명 교체'],
        time: ['중문 설치', '신발장 교체', '거울 설치'],
        quality: ['대리석 바닥', '고급 중문', '센서 조명']
      },
      balcony: {
        cost: ['바닥 시트 교체', '빨래건조대 설치', '방충망 교체'],
        time: ['시스템 선반 설치', '확장 공사', '전동 빨래건조대'],
        quality: ['단열 시공', '폴딩도어 설치', '테라스 조성']
      }
    }

    return options[spaceType]?.[priority] || options[spaceType]?.['quality'] || []
  }

  private calculateAIScore(spaceType: string, factors: any): number {
    let score = 50 // 기본 점수

    // 공간별 가중치
    const spaceWeight = {
      livingroom: 20,
      kitchen: 25,
      bedroom: 15,
      bathroom: 20,
      entrance: 10,
      balcony: 10
    }

    score += spaceWeight[spaceType] || 10

    // 우선순위에 따른 보정
    if (factors.priority === 'quality') score += 10
    if (factors.priority === 'time') score += 5
    
    // 거주 상태에 따른 보정
    if (factors.residenceStatus === 'occupied') {
      if (spaceType === 'kitchen' || spaceType === 'bathroom') score += 15
    }

    // 면적에 따른 보정
    if (factors.totalArea) {
      if (factors.totalArea > 30 && spaceType === 'livingroom') score += 10
      if (factors.totalArea < 20 && spaceType === 'balcony') score -= 10
    }

    // 특수 요인
    if (factors.waterproofing) score += 10
    if (factors.isMain) score += 5

    return Math.min(100, Math.max(0, score))
  }

  private estimateBedroomCount(totalArea: number): number {
    if (totalArea <= 20) return 1
    if (totalArea <= 30) return 2
    if (totalArea <= 40) return 3
    return 4
  }

  private estimateBathroomCount(totalArea: number): number {
    if (totalArea <= 25) return 1
    if (totalArea <= 40) return 2
    return 3
  }

  private generateInsights(recommendations: SpaceRecommendation[]): SpaceAnalysis['insights'] {
    const totalEstimatedDuration = recommendations.reduce((sum, r) => sum + r.estimatedDuration, 0)
    const totalEstimatedCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0)
    const criticalSpaces = recommendations
      .filter(r => r.priority === 'high')
      .map(r => r.spaceName)

    const costSavingTips = this.generateCostSavingTips(recommendations)
    const sequenceOptimization = this.generateSequenceOptimization(recommendations)

    return {
      totalEstimatedDuration,
      totalEstimatedCost,
      criticalSpaces,
      costSavingTips,
      sequenceOptimization
    }
  }

  private generateCostSavingTips(recommendations: SpaceRecommendation[]): string[] {
    const tips: string[] = []
    const totalCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0)

    if (totalCost > this.projectInfo.totalBudget * 10000) {
      tips.push('💰 예산 초과 예상: 우선순위가 낮은 공간은 다음 단계로 미루는 것을 추천합니다')
    }

    if (recommendations.some(r => r.spaceId === 'kitchen' && r.aiScore > 70)) {
      tips.push('🍳 주방: 싱크대 교체 대신 도어만 교체하면 50% 비용 절감 가능')
    }

    if (recommendations.some(r => r.spaceId.includes('bathroom'))) {
      tips.push('🚿 욕실: 타일 전체 교체 대신 포인트 타일만 사용하면 30% 절감')
    }

    if (this.projectInfo.residenceStatus === 'vacant') {
      tips.push('🏠 빈집 공사의 장점을 활용해 동시 진행으로 공사 기간을 단축하세요')
    }

    return tips
  }

  private generateSequenceOptimization(recommendations: SpaceRecommendation[]): string[] {
    const sequence: string[] = []

    // 철거가 필요한 공간 우선
    sequence.push('1️⃣ 철거 작업이 필요한 모든 공간 동시 진행')

    // 방수/배관 작업
    if (recommendations.some(r => r.spaceId.includes('bathroom') || r.spaceId === 'kitchen')) {
      sequence.push('2️⃣ 욕실/주방 방수 및 배관 작업')
    }

    // 전기/통신 작업
    sequence.push('3️⃣ 전체 전기/통신 배선 작업 일괄 진행')

    // 바닥 작업
    sequence.push('4️⃣ 전체 바닥 작업 (거실 → 침실 → 주방 순)')

    // 마감 작업
    sequence.push('5️⃣ 도배/페인트 등 마감 작업')

    // 거주 중인 경우 특별 고려사항
    if (this.projectInfo.residenceStatus === 'occupied') {
      sequence.push('⚠️ 거주 중: 침실 → 거실 → 주방 순으로 생활 영향 최소화')
    }

    return sequence
  }
}