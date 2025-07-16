import { SpaceSelection, ProjectBasicInfo, ScheduleInfo, GeneratedTask } from '../types'
import { CONSTRUCTION_PHASES, TASK_CONFIGS, REALISTIC_COSTS, TaskConfig } from './phases'

interface ScheduleConstraints {
  maxElectricians: number
  maxPlumbers: number
  maxCarpenter: number
  workingHoursPerDay: number
  noiseRestrictions: boolean
  inspectionDelays: number
}

interface ResourceSchedule {
  electricians: { [date: string]: number }
  plumbers: { [date: string]: number }
  carpenters: { [date: string]: number }
}

export class RealisticConstructionScheduler {
  private constraints: ScheduleConstraints
  private resources: ResourceSchedule
  
  constructor() {
    // 실제 현장 제약사항 설정
    this.constraints = {
      maxElectricians: 1,      // 대부분 현장에 전기기사 1명
      maxPlumbers: 1,          // 배관기사 1명
      maxCarpenter: 2,         // 목공기사 최대 2명
      workingHoursPerDay: 8,   // 하루 8시간 작업
      noiseRestrictions: true, // 거주중일 때 소음 제한
      inspectionDelays: 1      // 검사 대기 시간
    }
    
    this.resources = {
      electricians: {},
      plumbers: {},
      carpenters: {}
    }
  }

  generateRealisticSchedule(
    spaces: SpaceSelection[], 
    projectInfo: ProjectBasicInfo,
    scheduleInfo: ScheduleInfo
  ): GeneratedTask[] {
    const tasks: GeneratedTask[] = []
    let taskId = 1

    // 각 공간별로 실제 공사 순서에 따라 작업 생성
    for (const space of spaces) {
      const spaceTasks = this.generateSpaceTasks(space, taskId)
      tasks.push(...spaceTasks)
      taskId += spaceTasks.length
    }

    // 의존성 및 제약사항 적용
    const scheduledTasks = this.applyConstraintsAndDependencies(tasks, projectInfo, scheduleInfo)
    
    return scheduledTasks
  }

  private generateSpaceTasks(space: SpaceSelection, startId: number): GeneratedTask[] {
    const tasks: GeneratedTask[] = []
    const spacePrefix = space.id.toUpperCase()
    let taskId = startId

    // 1. 철거 단계 (전체 리모델링인 경우)
    if (space.scope === 'full') {
      const demoConfig = space.id === 'bathroom' || space.id === 'kitchen' ? 
        this.getTaskConfig('demo_heavy') : this.getTaskConfig('demo_light')
      
      if (demoConfig) {
        tasks.push(this.createTask(
          `${spacePrefix}_DEMO_${taskId++}`,
          `${space.name} 철거`,
          space,
          demoConfig,
          []
        ))
      }
    }

    // 2. 설비 1차 작업 (전기, 배관)
    if (space.tasks.electrical) {
      const electricalConfig = this.getTaskConfig('electrical_rough')
      if (electricalConfig) {
        const dependencies = space.scope === 'full' ? 
          [`${spacePrefix}_DEMO_${startId}`] : []
        
        tasks.push(this.createTask(
          `${spacePrefix}_ELEC_ROUGH_${taskId++}`,
          `${space.name} 전기 1차`,
          space,
          electricalConfig,
          dependencies
        ))
      }
    }

    // 배관 작업 (주방, 욕실)
    if ((space.id === 'kitchen' || space.id === 'bathroom') && space.scope === 'full') {
      const plumbingConfig = this.getTaskConfig('plumbing_rough')
      if (plumbingConfig) {
        const dependencies = space.scope === 'full' ? 
          [`${spacePrefix}_DEMO_${startId}`] : []
        
        tasks.push(this.createTask(
          `${spacePrefix}_PLUMB_ROUGH_${taskId++}`,
          `${space.name} 배관 1차`,
          space,
          plumbingConfig,
          dependencies
        ))
      }
    }

    // 3. 욕실 방수 (욕실만)
    if (space.id === 'bathroom' && space.scope === 'full') {
      const waterproofConfig = this.getTaskConfig('bathroom_waterproof')
      if (waterproofConfig) {
        tasks.push(this.createTask(
          `${spacePrefix}_WATERPROOF_${taskId++}`,
          `${space.name} 방수`,
          space,
          waterproofConfig,
          [`${spacePrefix}_PLUMB_ROUGH_${taskId-2}`]
        ))
      }
    }

    // 4. 벽체/골조 작업
    if (space.scope === 'full') {
      const framingConfig = this.getTaskConfig('framing')
      if (framingConfig) {
        const dependencies = this.getLastTasksFromCategories(tasks, ['electrical', 'plumbing'])
        tasks.push(this.createTask(
          `${spacePrefix}_FRAMING_${taskId++}`,
          `${space.name} 목공 골조`,
          space,
          framingConfig,
          dependencies
        ))
      }

      const drywallConfig = this.getTaskConfig('drywall')
      if (drywallConfig) {
        tasks.push(this.createTask(
          `${spacePrefix}_DRYWALL_${taskId++}`,
          `${space.name} 석고보드`,
          space,
          drywallConfig,
          [`${spacePrefix}_FRAMING_${taskId-2}`]
        ))
      }
    }

    // 5. 바닥재 작업
    if (space.tasks.flooring && space.tasks.flooring.length > 0) {
      for (const flooringType of space.tasks.flooring) {
        const configId = `flooring_${flooringType}`
        const flooringConfig = this.getTaskConfig(configId)
        
        if (flooringConfig) {
          const dependencies = space.scope === 'full' ? 
            [`${spacePrefix}_DRYWALL_${taskId-2}`] : []
          
          tasks.push(this.createTask(
            `${spacePrefix}_FLOOR_${flooringType.toUpperCase()}_${taskId++}`,
            `${space.name} ${this.getFlooringName(flooringType)}`,
            space,
            flooringConfig,
            dependencies
          ))
        }
      }
    }

    // 6. 도장/도배 작업
    if (space.tasks.walls && space.tasks.walls.length > 0) {
      for (const wallType of space.tasks.walls) {
        const configId = wallType === 'paint' ? 'painting' : 'wallpaper'
        const wallConfig = this.getTaskConfig(configId)
        
        if (wallConfig) {
          const dependencies = this.getLastTasksFromCategories(tasks, ['flooring'])
          
          tasks.push(this.createTask(
            `${spacePrefix}_WALL_${wallType.toUpperCase()}_${taskId++}`,
            `${space.name} ${this.getWallName(wallType)}`,
            space,
            wallConfig,
            dependencies
          ))
        }
      }
    }

    // 7. 전기/배관 마감
    if (space.tasks.electrical) {
      const electricalFinishConfig = this.getTaskConfig('electrical_finish')
      if (electricalFinishConfig) {
        const dependencies = this.getLastTasksFromCategories(tasks, ['painting'])
        
        tasks.push(this.createTask(
          `${spacePrefix}_ELEC_FINISH_${taskId++}`,
          `${space.name} 전기 마감`,
          space,
          electricalFinishConfig,
          dependencies
        ))
      }
    }

    // 배관 마감 (주방, 욕실)
    if ((space.id === 'kitchen' || space.id === 'bathroom') && space.scope === 'full') {
      const plumbingFinishConfig = this.getTaskConfig('plumbing_finish')
      if (plumbingFinishConfig) {
        const dependencies = this.getLastTasksFromCategories(tasks, ['painting'])
        
        tasks.push(this.createTask(
          `${spacePrefix}_PLUMB_FINISH_${taskId++}`,
          `${space.name} 배관 마감`,
          space,
          plumbingFinishConfig,
          dependencies
        ))
      }
    }

    // 8. 특수 설치 작업 (주방, 욕실)
    if (space.id === 'kitchen' && space.tasks.sink) {
      const kitchenConfig = this.getTaskConfig('kitchen_install')
      if (kitchenConfig) {
        const dependencies = this.getLastTasksFromCategories(tasks, ['electrical', 'plumbing'])
        
        tasks.push(this.createTask(
          `${spacePrefix}_KITCHEN_${taskId++}`,
          `${space.name} 주방 설치`,
          space,
          { ...kitchenConfig, costPerSqm: this.getKitchenCost(space.tasks.sink) },
          dependencies
        ))
      }
    }

    if (space.id === 'bathroom' && space.tasks.renovation) {
      const bathroomConfig = this.getTaskConfig('bathroom_install')
      if (bathroomConfig) {
        const dependencies = this.getLastTasksFromCategories(tasks, ['electrical', 'waterproof'])
        
        tasks.push(this.createTask(
          `${spacePrefix}_BATHROOM_${taskId++}`,
          `${space.name} 욕실 설치`,
          space,
          { ...bathroomConfig, costPerSqm: this.getBathroomCost(space.tasks.renovation) },
          dependencies
        ))
      }
    }

    // 9. 청소 및 마무리
    const cleanupConfig = this.getTaskConfig('cleanup')
    if (cleanupConfig) {
      const dependencies = tasks
        .filter(t => t.category !== 'cleanup')
        .map(t => t.id)
      
      tasks.push(this.createTask(
        `${spacePrefix}_CLEANUP_${taskId++}`,
        `${space.name} 마무리 청소`,
        space,
        cleanupConfig,
        dependencies
      ))
    }

    return tasks
  }

  private createTask(
    id: string,
    name: string,
    space: SpaceSelection,
    config: TaskConfig,
    dependencies: string[]
  ): GeneratedTask {
    const duration = Math.max(
      config.minDuration,
      Math.min(
        Math.ceil(space.actualArea * config.durationPerSqm),
        config.maxDuration
      )
    )

    const cost = space.actualArea * config.costPerSqm

    return {
      id,
      name,
      description: `${space.name} ${config.name}`,
      space: space.name,
      category: config.category,
      duration: duration + (config.dryingTime || 0),
      dependencies,
      isCritical: false, // 나중에 계산
      isMilestone: config.requiresInspection,
      estimatedCost: cost,
      materials: config.materials,
      skills: config.skills
    }
  }

  private applyConstraintsAndDependencies(
    tasks: GeneratedTask[],
    projectInfo: ProjectBasicInfo,
    scheduleInfo: ScheduleInfo
  ): GeneratedTask[] {
    // Critical Path Method 적용
    const scheduledTasks = this.calculateCriticalPath(tasks)
    
    // 자원 제약사항 적용
    return this.applyResourceConstraints(scheduledTasks, scheduleInfo)
  }

  private calculateCriticalPath(tasks: GeneratedTask[]): GeneratedTask[] {
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    const earlyStart = new Map<string, number>()
    const earlyFinish = new Map<string, number>()
    const lateStart = new Map<string, number>()
    const lateFinish = new Map<string, number>()

    // Forward pass
    const topologicalOrder = this.getTopologicalOrder(tasks)
    
    for (const taskId of topologicalOrder) {
      const task = taskMap.get(taskId)!
      let maxFinish = 0
      
      for (const depId of task.dependencies || []) {
        maxFinish = Math.max(maxFinish, earlyFinish.get(depId) || 0)
      }
      
      earlyStart.set(taskId, maxFinish)
      earlyFinish.set(taskId, maxFinish + task.duration)
    }

    // Project finish time
    const projectFinish = Math.max(...Array.from(earlyFinish.values()))

    // Backward pass
    for (let i = topologicalOrder.length - 1; i >= 0; i--) {
      const taskId = topologicalOrder[i]
      const task = taskMap.get(taskId)!
      
      const dependentTasks = tasks.filter(t => (t.dependencies || []).includes(taskId))
      let minStart = projectFinish
      
      if (dependentTasks.length === 0) {
        lateFinish.set(taskId, projectFinish)
      } else {
        for (const depTask of dependentTasks) {
          minStart = Math.min(minStart, lateStart.get(depTask.id) || projectFinish)
        }
        lateFinish.set(taskId, minStart)
      }
      
      lateStart.set(taskId, (lateFinish.get(taskId) || 0) - task.duration)
    }

    // Calculate slack and identify critical tasks
    return tasks.map(task => ({
      ...task,
      isCritical: (earlyStart.get(task.id) || 0) === (lateStart.get(task.id) || 0)
    }))
  }

  private applyResourceConstraints(
    tasks: GeneratedTask[],
    scheduleInfo: ScheduleInfo
  ): GeneratedTask[] {
    // 자원 제약사항을 고려한 실제 일정 조정
    // 전기기사 1명, 배관기사 1명 등의 제약 적용
    return tasks // 복잡한 자원 스케줄링 로직 구현 필요
  }

  private getTopologicalOrder(tasks: GeneratedTask[]): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    
    const visit = (taskId: string) => {
      if (visited.has(taskId)) return
      
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      
      for (const depId of task.dependencies || []) {
        visit(depId)
      }
      
      visited.add(taskId)
      result.push(taskId)
    }
    
    tasks.forEach(task => visit(task.id))
    return result
  }

  private getTaskConfig(configId: string): TaskConfig | null {
    return TASK_CONFIGS.find(config => config.id === configId) || null
  }

  private getLastTasksFromCategories(tasks: GeneratedTask[], categories: string[]): string[] {
    const result: string[] = []
    for (const category of categories) {
      const categoryTasks = tasks.filter(t => t.category === category)
      if (categoryTasks.length > 0) {
        result.push(categoryTasks[categoryTasks.length - 1].id)
      }
    }
    return result
  }

  private getFlooringName(type: string): string {
    const names = {
      laminate: '강화마루',
      hardwood: '원목마루', 
      tile: '타일',
      carpet: '카펫'
    }
    return names[type as keyof typeof names] || type
  }

  private getWallName(type: string): string {
    const names = {
      paint: '페인트',
      wallpaper: '도배',
      tile: '벽타일',
      paneling: '패널링'
    }
    return names[type as keyof typeof names] || type
  }

  private getKitchenCost(sinkType: string): number {
    const costs = {
      door_only: 280000,          // 평당 28만원
      countertop_only: 380000,    // 평당 38만원  
      full_replace: 800000        // 평당 80만원
    }
    return costs[sinkType as keyof typeof costs] || 500000
  }

  private getBathroomCost(renovationType: string): number {
    const costs = {
      waterproof: 180000,         // 평당 18만원
      tile_only: 400000,          // 평당 40만원
      fixtures_only: 500000,      // 평당 50만원
      full: 1200000              // 평당 120만원 
    }
    return costs[renovationType as keyof typeof costs] || 600000
  }
}