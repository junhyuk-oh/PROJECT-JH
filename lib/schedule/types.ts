export interface TaskDependency {
  taskId: string
  dependsOn: string[]
}

export interface CriticalPathNode {
  taskId: string
  earlyStart: number
  earlyFinish: number
  lateStart: number
  lateFinish: number
  slack: number
  isCritical: boolean
}

export interface ScheduleOptimizationResult {
  tasks: any[]
  criticalPath: string[]
  totalDays: number
  insights: {
    complexity: number
    warnings: string[]
    suggestions: string[]
    optimizations: string[]
    budgetImpact: number
  }
}