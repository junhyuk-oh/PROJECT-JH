import { GanttChartData, Task } from '@/lib/types'
import { ProbabilisticPrediction } from './probabilisticScheduler'

export interface Scenario {
  type: 'optimistic' | 'realistic' | 'conservative'
  title: string
  description: string
  emoji: string
  ganttData: GanttChartData
  metrics: {
    duration: number
    cost: number
    reliability: number // 신뢰도 %
    riskLevel: 'low' | 'medium' | 'high'
  }
  highlights: string[]
}

export class ScenarioGenerator {
  constructor(
    private baseGanttData: GanttChartData,
    private probabilisticPrediction: ProbabilisticPrediction
  ) {}

  generateScenarios(): Scenario[] {
    return [
      this.generateOptimisticScenario(),
      this.generateRealisticScenario(),
      this.generateConservativeScenario()
    ]
  }

  private generateOptimisticScenario(): Scenario {
    // 90% 신뢰구간의 최소값 사용
    const duration = this.probabilisticPrediction.confidence90.min
    const tasks = this.adjustTasksForScenario(this.baseGanttData.tasks, 0.85) // 15% 단축
    
    const ganttData: GanttChartData = {
      ...this.baseGanttData,
      tasks,
      timeline: {
        ...this.baseGanttData.timeline,
        totalDays: duration,
        endDate: this.addBusinessDays(this.baseGanttData.timeline.startDate, duration)
      },
      insights: {
        ...this.baseGanttData.insights,
        warnings: [
          '⚡ 모든 작업이 순조롭게 진행된다는 가정',
          '🌤️ 날씨 및 외부 요인 영향 최소화 가정'
        ],
        suggestions: [
          '✨ 병렬 작업 최대 활용으로 공기 단축',
          '🚀 숙련된 작업팀 배치로 효율성 극대화'
        ]
      }
    }

    return {
      type: 'optimistic',
      title: '최적 시나리오',
      description: '모든 조건이 이상적일 때의 일정',
      emoji: '🚀',
      ganttData,
      metrics: {
        duration,
        cost: this.calculateScenarioCost(tasks, 0.9), // 10% 절감
        reliability: 60,
        riskLevel: 'high'
      },
      highlights: [
        `공사 기간 ${Math.round((1 - duration / this.baseGanttData.timeline.totalDays) * 100)}% 단축`,
        '병렬 작업으로 효율성 극대화',
        '예상치 못한 지연 없음 가정',
        '최고 숙련도 작업팀 투입'
      ]
    }
  }

  private generateRealisticScenario(): Scenario {
    // 예상 기간 사용
    const duration = this.probabilisticPrediction.expectedDuration
    const tasks = this.baseGanttData.tasks // 기본값 그대로
    
    const ganttData: GanttChartData = {
      ...this.baseGanttData,
      timeline: {
        ...this.baseGanttData.timeline,
        totalDays: duration
      },
      insights: {
        ...this.baseGanttData.insights,
        warnings: this.probabilisticPrediction.recommendations
          .filter(r => r.includes('⚠️'))
          .map(r => r.replace('⚠️ ', '')),
        suggestions: this.probabilisticPrediction.recommendations
          .filter(r => !r.includes('⚠️'))
      }
    }

    return {
      type: 'realistic',
      title: '현실적 시나리오',
      description: 'AI가 예측한 가장 가능성 높은 일정',
      emoji: '📊',
      ganttData,
      metrics: {
        duration,
        cost: this.calculateScenarioCost(tasks, 1.0),
        reliability: 85,
        riskLevel: 'medium'
      },
      highlights: [
        'Monte Carlo 시뮬레이션 기반 예측',
        `${this.probabilisticPrediction.riskAnalysis.bufferTime}일 버퍼 포함`,
        '일반적인 지연 요인 반영',
        '검증된 통계 모델 활용'
      ]
    }
  }

  private generateConservativeScenario(): Scenario {
    // 90% 신뢰구간의 최대값 사용
    const duration = this.probabilisticPrediction.confidence90.max
    const tasks = this.adjustTasksForScenario(this.baseGanttData.tasks, 1.2) // 20% 연장
    
    // 고위험 작업에 추가 버퍼 적용
    const adjustedTasks = tasks.map(task => {
      const isHighRisk = this.probabilisticPrediction.riskAnalysis.highRiskTasks
        .some(riskTask => riskTask.taskName === task.title)
      
      if (isHighRisk) {
        return {
          ...task,
          duration: Math.ceil(task.duration * 1.1), // 고위험 작업 10% 추가
          estimatedCost: Math.round(task.estimatedCost * 1.15) // 비용도 15% 증가
        }
      }
      return task
    })
    
    const ganttData: GanttChartData = {
      ...this.baseGanttData,
      tasks: adjustedTasks,
      timeline: {
        ...this.baseGanttData.timeline,
        totalDays: duration,
        endDate: this.addBusinessDays(this.baseGanttData.timeline.startDate, duration)
      },
      insights: {
        ...this.baseGanttData.insights,
        warnings: [
          '🛡️ 모든 리스크 요인을 보수적으로 반영',
          '⏰ 예상치 못한 지연에 대한 충분한 버퍼 확보',
          ...this.probabilisticPrediction.riskAnalysis.highRiskTasks
            .map(task => `⚠️ ${task.taskName}: 변동성 ${task.variability}%`)
        ],
        suggestions: [
          '💰 예비 예산 20% 확보 권장',
          '📋 주간 진행상황 점검 필수',
          '🔧 대체 시공 방안 사전 준비'
        ]
      }
    }

    return {
      type: 'conservative',
      title: '안전 시나리오',
      description: '리스크를 최대한 고려한 보수적 일정',
      emoji: '🛡️',
      ganttData,
      metrics: {
        duration,
        cost: this.calculateScenarioCost(adjustedTasks, 1.15), // 15% 증가
        reliability: 95,
        riskLevel: 'low'
      },
      highlights: [
        '90% 확률로 기간 내 완공 가능',
        `총 ${duration - this.baseGanttData.timeline.totalDays}일 추가 버퍼`,
        '모든 리스크 요인 반영',
        '안정적인 공사 진행 보장'
      ]
    }
  }

  private adjustTasksForScenario(tasks: Task[], factor: number): Task[] {
    return tasks.map(task => ({
      ...task,
      duration: Math.round(task.duration * factor),
      endDate: this.addBusinessDays(task.startDate, Math.round(task.duration * factor))
    }))
  }

  private calculateScenarioCost(tasks: Task[], factor: number): number {
    return tasks.reduce((sum, task) => sum + Math.round(task.estimatedCost * factor), 0)
  }

  private addBusinessDays(startDate: Date, days: number): Date {
    const result = new Date(startDate)
    let addedDays = 0
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      const dayOfWeek = result.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++
      }
    }
    
    return result
  }
}