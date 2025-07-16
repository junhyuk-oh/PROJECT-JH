import { Task } from '@/lib/types'

export interface DependencyConflict {
  id: string
  type: 'circular' | 'resource' | 'sequence' | 'parallel'
  severity: 'critical' | 'warning' | 'info'
  tasks: string[]
  description: string
  resolution: string[]
}

export interface DependencyAnalysis {
  conflicts: DependencyConflict[]
  criticalPath: string[]
  parallelizableGroups: string[][]
  bottlenecks: Array<{
    taskId: string
    reason: string
    impact: number // 일정에 미치는 영향 (일)
  }>
  optimizations: Array<{
    type: 'merge' | 'parallel' | 'reorder' | 'split'
    tasks: string[]
    benefit: string
    savingDays: number
  }>
}

export class DependencyAnalyzer {
  private taskMap: Map<string, Task>
  private dependencyGraph: Map<string, Set<string>>
  private reverseDependencyGraph: Map<string, Set<string>>

  constructor(private tasks: Task[]) {
    this.taskMap = new Map(tasks.map(t => [t.id, t]))
    this.buildDependencyGraphs()
  }

  private buildDependencyGraphs() {
    this.dependencyGraph = new Map()
    this.reverseDependencyGraph = new Map()

    this.tasks.forEach(task => {
      this.dependencyGraph.set(task.id, new Set(task.dependencies))
      
      task.dependencies.forEach(depId => {
        if (!this.reverseDependencyGraph.has(depId)) {
          this.reverseDependencyGraph.set(depId, new Set())
        }
        this.reverseDependencyGraph.get(depId)!.add(task.id)
      })
    })
  }

  analyzeDependencies(): DependencyAnalysis {
    const conflicts = [
      ...this.detectCircularDependencies(),
      ...this.detectResourceConflicts(),
      ...this.detectSequenceConflicts(),
      ...this.detectParallelConflicts()
    ]

    const criticalPath = this.findCriticalPath()
    const parallelizableGroups = this.findParallelizableGroups()
    const bottlenecks = this.identifyBottlenecks()
    const optimizations = this.suggestOptimizations()

    return {
      conflicts,
      criticalPath,
      parallelizableGroups,
      bottlenecks,
      optimizations
    }
  }

  private detectCircularDependencies(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const detectCycle = (taskId: string, path: string[] = []): string[] | null => {
      if (recursionStack.has(taskId)) {
        const cycleStart = path.indexOf(taskId)
        return path.slice(cycleStart)
      }

      if (visited.has(taskId)) {
        return null
      }

      visited.add(taskId)
      recursionStack.add(taskId)
      path.push(taskId)

      const dependencies = this.dependencyGraph.get(taskId) || new Set()
      for (const depId of dependencies) {
        const cycle = detectCycle(depId, [...path])
        if (cycle) {
          return cycle
        }
      }

      recursionStack.delete(taskId)
      return null
    }

    this.tasks.forEach(task => {
      if (!visited.has(task.id)) {
        const cycle = detectCycle(task.id)
        if (cycle) {
          conflicts.push({
            id: `circular-${cycle.join('-')}`,
            type: 'circular',
            severity: 'critical',
            tasks: cycle,
            description: `순환 의존성 발견: ${cycle.map(id => this.taskMap.get(id)?.title).join(' → ')} → ${this.taskMap.get(cycle[0])?.title}`,
            resolution: [
              '의존성 관계를 재검토하세요',
              '일부 작업을 병합하거나 분리하세요',
              '작업 순서를 재배치하세요'
            ]
          })
        }
      }
    })

    return conflicts
  }

  private detectResourceConflicts(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []
    const spaceGroups = new Map<string, Task[]>()

    // 공간별로 작업 그룹화
    this.tasks.forEach(task => {
      if (!spaceGroups.has(task.space)) {
        spaceGroups.set(task.space, [])
      }
      spaceGroups.get(task.space)!.push(task)
    })

    // 같은 공간에서 동시에 진행되는 작업 찾기
    spaceGroups.forEach((tasks, space) => {
      for (let i = 0; i < tasks.length; i++) {
        for (let j = i + 1; j < tasks.length; j++) {
          const task1 = tasks[i]
          const task2 = tasks[j]

          // 겹치는 기간이 있는지 확인
          if (this.tasksOverlap(task1, task2) && !this.areDependentTasks(task1.id, task2.id)) {
            // 특정 카테고리는 동시 진행 불가
            const conflictingCategories = ['demolition', 'plumbing', 'electrical']
            if (conflictingCategories.includes(task1.category) || 
                conflictingCategories.includes(task2.category)) {
              conflicts.push({
                id: `resource-${task1.id}-${task2.id}`,
                type: 'resource',
                severity: 'warning',
                tasks: [task1.id, task2.id],
                description: `${space}에서 "${task1.title}"와 "${task2.title}" 작업이 동시 진행 예정입니다.`,
                resolution: [
                  '작업 일정을 조정하여 순차적으로 진행하세요',
                  '다른 공간의 작업과 일정을 교환하세요',
                  '작업 인력을 추가 투입하세요'
                ]
              })
            }
          }
        }
      }
    })

    return conflicts
  }

  private detectSequenceConflicts(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []

    // 잘못된 작업 순서 감지
    const sequenceRules = [
      { before: 'demolition', after: 'finishing', space: 'same' },
      { before: 'plumbing', after: 'flooring', space: 'same' },
      { before: 'electrical', after: 'painting', space: 'same' },
      { before: 'flooring', after: 'furniture', space: 'same' }
    ]

    sequenceRules.forEach(rule => {
      const beforeTasks = this.tasks.filter(t => t.category === rule.before)
      const afterTasks = this.tasks.filter(t => t.category === rule.after)

      beforeTasks.forEach(beforeTask => {
        afterTasks.forEach(afterTask => {
          if (rule.space === 'same' && beforeTask.space !== afterTask.space) {
            return
          }

          // after 작업이 before 작업보다 먼저 시작하는지 확인
          if (afterTask.startDate < beforeTask.endDate && 
              !this.isDependent(afterTask.id, beforeTask.id)) {
            conflicts.push({
              id: `sequence-${beforeTask.id}-${afterTask.id}`,
              type: 'sequence',
              severity: 'critical',
              tasks: [beforeTask.id, afterTask.id],
              description: `${afterTask.space}의 "${afterTask.title}"이 "${beforeTask.title}"보다 먼저 시작됩니다.`,
              resolution: [
                `"${afterTask.title}"을 "${beforeTask.title}" 완료 후로 이동하세요`,
                '의존성 관계를 명시적으로 설정하세요',
                '작업 카테고리가 올바른지 확인하세요'
              ]
            })
          }
        })
      })
    })

    return conflicts
  }

  private detectParallelConflicts(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []

    // 불필요하게 순차적으로 진행되는 작업 찾기
    const independentSpaces = this.findIndependentSpaceGroups()

    independentSpaces.forEach(group => {
      if (group.length > 1) {
        // 모든 작업이 순차적으로 진행되는지 확인
        let allSequential = true
        for (let i = 0; i < group.length - 1; i++) {
          if (!this.tasksOverlap(group[i], group[i + 1])) {
            allSequential = false
            break
          }
        }

        if (allSequential) {
          conflicts.push({
            id: `parallel-${group.map(t => t.id).join('-')}`,
            type: 'parallel',
            severity: 'info',
            tasks: group.map(t => t.id),
            description: `독립적인 공간의 작업들이 순차적으로 진행됩니다: ${group.map(t => `${t.space} ${t.title}`).join(', ')}`,
            resolution: [
              '독립적인 공간의 작업은 동시에 진행하여 공기를 단축하세요',
              '충분한 작업 인력이 있다면 병렬 처리를 고려하세요',
              '작업 일정을 재배치하여 효율성을 높이세요'
            ]
          })
        }
      }
    })

    return conflicts
  }

  private findCriticalPath(): string[] {
    // 간단한 Critical Path Method 구현
    const taskDurations = new Map<string, number>()
    const earliestStart = new Map<string, number>()
    const latestStart = new Map<string, number>()
    
    // Forward pass: 최소 시작 시간 계산
    const topologicalOrder = this.topologicalSort()
    topologicalOrder.forEach(taskId => {
      const task = this.taskMap.get(taskId)!
      const dependencies = task.dependencies

      let maxDependencyEnd = 0
      dependencies.forEach(depId => {
        const depEnd = (earliestStart.get(depId) || 0) + (taskDurations.get(depId) || 0)
        maxDependencyEnd = Math.max(maxDependencyEnd, depEnd)
      })

      earliestStart.set(taskId, maxDependencyEnd)
      taskDurations.set(taskId, task.duration)
    })

    // Backward pass: 최대 시작 시간 계산
    const projectDuration = Math.max(...Array.from(earliestStart.entries()).map(
      ([id, start]) => start + (taskDurations.get(id) || 0)
    ))

    topologicalOrder.reverse().forEach(taskId => {
      const task = this.taskMap.get(taskId)!
      const dependents = this.reverseDependencyGraph.get(taskId) || new Set()

      let minDependentStart = projectDuration
      if (dependents.size === 0) {
        minDependentStart = projectDuration - task.duration
      } else {
        dependents.forEach(depId => {
          minDependentStart = Math.min(minDependentStart, latestStart.get(depId) || projectDuration)
        })
      }

      latestStart.set(taskId, minDependentStart - task.duration)
    })

    // Critical path = 여유 시간이 0인 작업들
    const criticalPath: string[] = []
    this.tasks.forEach(task => {
      const slack = (latestStart.get(task.id) || 0) - (earliestStart.get(task.id) || 0)
      if (Math.abs(slack) < 0.001) {
        criticalPath.push(task.id)
      }
    })

    return criticalPath
  }

  private findParallelizableGroups(): string[][] {
    const groups: string[][] = []
    const visited = new Set<string>()

    // 의존성이 없는 작업들을 그룹화
    const independentTasks = this.tasks.filter(task => {
      const hasDependents = Array.from(this.reverseDependencyGraph.get(task.id) || []).length > 0
      const hasDependencies = task.dependencies.length > 0
      return !hasDependents && !hasDependencies
    })

    // 같은 레벨의 작업들을 그룹화
    const levelMap = this.calculateTaskLevels()
    const levelGroups = new Map<number, string[]>()

    levelMap.forEach((level, taskId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(taskId)
    })

    levelGroups.forEach(taskIds => {
      if (taskIds.length > 1) {
        // 서로 의존성이 없는 작업들만 그룹화
        const independentGroup: string[] = []
        taskIds.forEach(taskId => {
          let isIndependent = true
          independentGroup.forEach(groupTaskId => {
            if (this.areDependentTasks(taskId, groupTaskId)) {
              isIndependent = false
            }
          })
          if (isIndependent) {
            independentGroup.push(taskId)
          }
        })
        
        if (independentGroup.length > 1) {
          groups.push(independentGroup)
        }
      }
    })

    return groups
  }

  private identifyBottlenecks(): Array<{taskId: string; reason: string; impact: number}> {
    const bottlenecks: Array<{taskId: string; reason: string; impact: number}> = []
    const criticalPath = new Set(this.findCriticalPath())

    this.tasks.forEach(task => {
      // Critical path에 있는 긴 작업
      if (criticalPath.has(task.id) && task.duration > 5) {
        bottlenecks.push({
          taskId: task.id,
          reason: `중요 경로상의 장기 작업 (${task.duration}일)`,
          impact: Math.max(0, task.duration - 5)
        })
      }

      // 많은 작업이 의존하는 작업
      const dependents = this.reverseDependencyGraph.get(task.id) || new Set()
      if (dependents.size >= 3) {
        bottlenecks.push({
          taskId: task.id,
          reason: `${dependents.size}개 작업이 대기 중`,
          impact: task.duration * 0.5
        })
      }

      // 높은 변동성을 가진 작업
      if (task.category === 'demolition' || task.category === 'plumbing') {
        bottlenecks.push({
          taskId: task.id,
          reason: '높은 불확실성을 가진 작업 카테고리',
          impact: task.duration * 0.3
        })
      }
    })

    return bottlenecks.sort((a, b) => b.impact - a.impact)
  }

  private suggestOptimizations(): Array<{type: string; tasks: string[]; benefit: string; savingDays: number}> {
    const optimizations: Array<{type: 'merge' | 'parallel' | 'reorder' | 'split'; tasks: string[]; benefit: string; savingDays: number}> = []

    // 병렬 처리 가능한 작업 찾기
    const parallelizableGroups = this.findParallelizableGroups()
    parallelizableGroups.forEach(group => {
      if (group.length >= 2) {
        const tasks = group.map(id => this.taskMap.get(id)!)
        const maxDuration = Math.max(...tasks.map(t => t.duration))
        const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0)
        const saving = totalDuration - maxDuration

        if (saving > 0) {
          optimizations.push({
            type: 'parallel',
            tasks: group,
            benefit: `${tasks.map(t => t.title).join(', ')} 동시 진행`,
            savingDays: saving
          })
        }
      }
    })

    // 작은 작업들 병합 제안
    const smallTasks = this.tasks.filter(t => t.duration <= 2)
    const spaceGroupedSmallTasks = new Map<string, Task[]>()
    
    smallTasks.forEach(task => {
      if (!spaceGroupedSmallTasks.has(task.space)) {
        spaceGroupedSmallTasks.set(task.space, [])
      }
      spaceGroupedSmallTasks.get(task.space)!.push(task)
    })

    spaceGroupedSmallTasks.forEach((tasks, space) => {
      if (tasks.length >= 2) {
        const sameCategoryTasks = tasks.filter(t => t.category === tasks[0].category)
        if (sameCategoryTasks.length >= 2) {
          optimizations.push({
            type: 'merge',
            tasks: sameCategoryTasks.map(t => t.id),
            benefit: `${space}의 ${sameCategoryTasks[0].category} 작업 통합`,
            savingDays: 1
          })
        }
      }
    })

    // 작업 순서 재배치 제안
    const criticalPath = new Set(this.findCriticalPath())
    this.tasks.forEach(task => {
      if (!criticalPath.has(task.id) && task.duration >= 3) {
        const dependents = Array.from(this.reverseDependencyGraph.get(task.id) || [])
        if (dependents.some(id => criticalPath.has(id))) {
          optimizations.push({
            type: 'reorder',
            tasks: [task.id],
            benefit: `"${task.title}"을 비중요 경로로 이동`,
            savingDays: Math.floor(task.duration * 0.2)
          })
        }
      }
    })

    return optimizations.sort((a, b) => b.savingDays - a.savingDays)
  }

  // Helper methods
  private tasksOverlap(task1: Task, task2: Task): boolean {
    return task1.startDate < task2.endDate && task2.startDate < task1.endDate
  }

  private areDependentTasks(task1Id: string, task2Id: string): boolean {
    return this.isDependent(task1Id, task2Id) || this.isDependent(task2Id, task1Id)
  }

  private isDependent(taskId: string, potentialDependencyId: string): boolean {
    const visited = new Set<string>()
    const queue = [taskId]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === potentialDependencyId) {
        return true
      }

      if (!visited.has(current)) {
        visited.add(current)
        const dependencies = this.dependencyGraph.get(current) || new Set()
        queue.push(...Array.from(dependencies))
      }
    }

    return false
  }

  private topologicalSort(): string[] {
    const result: string[] = []
    const visited = new Set<string>()

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return
      visited.add(taskId)

      const dependencies = this.dependencyGraph.get(taskId) || new Set()
      dependencies.forEach(depId => visit(depId))
      
      result.push(taskId)
    }

    this.tasks.forEach(task => visit(task.id))
    return result.reverse()
  }

  private calculateTaskLevels(): Map<string, number> {
    const levels = new Map<string, number>()
    const visited = new Set<string>()

    const calculateLevel = (taskId: string): number => {
      if (levels.has(taskId)) {
        return levels.get(taskId)!
      }

      const dependencies = this.dependencyGraph.get(taskId) || new Set()
      if (dependencies.size === 0) {
        levels.set(taskId, 0)
        return 0
      }

      let maxLevel = 0
      dependencies.forEach(depId => {
        maxLevel = Math.max(maxLevel, calculateLevel(depId) + 1)
      })

      levels.set(taskId, maxLevel)
      return maxLevel
    }

    this.tasks.forEach(task => calculateLevel(task.id))
    return levels
  }

  private findIndependentSpaceGroups(): Task[][] {
    const spaceGroups = new Map<string, Task[]>()
    
    this.tasks.forEach(task => {
      if (!spaceGroups.has(task.space)) {
        spaceGroups.set(task.space, [])
      }
      spaceGroups.get(task.space)!.push(task)
    })

    const independentGroups: Task[][] = []
    const spaces = Array.from(spaceGroups.keys())

    for (let i = 0; i < spaces.length; i++) {
      for (let j = i + 1; j < spaces.length; j++) {
        const space1Tasks = spaceGroups.get(spaces[i])!
        const space2Tasks = spaceGroups.get(spaces[j])!

        let hasInterDependency = false
        space1Tasks.forEach(task1 => {
          space2Tasks.forEach(task2 => {
            if (this.areDependentTasks(task1.id, task2.id)) {
              hasInterDependency = true
            }
          })
        })

        if (!hasInterDependency) {
          independentGroups.push([...space1Tasks, ...space2Tasks])
        }
      }
    }

    return independentGroups
  }
}