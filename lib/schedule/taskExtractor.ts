import { SpaceSelection, GeneratedTask, BASE_TASK_DURATIONS } from '../types'
import { extractRealisticTasks } from './realisticTaskExtractor'

// 공간에서 작업 추출하기 - 실제 건설업계 기준으로 개선
export function extractTasksFromSpaces(
  spaces: SpaceSelection[], 
  basicInfo?: any, 
  scheduleInfo?: any
): GeneratedTask[] {
  // 새로운 현실적인 작업 추출기 사용
  if (basicInfo && scheduleInfo) {
    const config = {
      totalArea: basicInfo.totalArea || 42,
      projectDuration: parseProjectDuration(basicInfo.projectDuration || '6주'),
      qualityLevel: determineQualityLevel(basicInfo.preferredStyle) as 'budget' | 'standard' | 'premium',
      livingDuringWork: basicInfo.residenceStatus === 'occupied'
    }
    
    return extractRealisticTasks(spaces, config)
  }
  
  // 레거시 호환성을 위한 기본 로직 (단순화된 버전)
  return extractTasksLegacy(spaces)
}

// 레거시 작업 추출 로직 (기존 로직의 단순화된 버전)
function extractTasksLegacy(spaces: SpaceSelection[]): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let taskCounter = 1

  spaces.forEach(space => {
    // 철거 작업 (필요한 경우)
    if (space.scope === 'full') {
      tasks.push(createTask(
        taskCounter++,
        `${space.name} 철거`,
        `${space.name}의 기존 설비를 철거합니다`,
        space.name,
        'demolition',
        Math.max(Math.ceil(space.actualArea * BASE_TASK_DURATIONS.demolition.perSqm), BASE_TASK_DURATIONS.demolition.minimum),
        [],
        true,
        false,
        space.actualArea * 50000,
        ['철거 도구', '폐기물 처리'],
        ['철거 전문가']
      ))
    }

    // 전기 작업
    if (space.tasks.electrical) {
      const demolitionTask = tasks.find(t => t.space === space.name && t.category === 'demolition')
      tasks.push(createTask(
        taskCounter++,
        `${space.name} 전기 공사`,
        `${space.name}의 전기 배선 및 콘센트를 설치합니다`,
        space.name,
        'electrical',
        Math.max(Math.ceil(space.actualArea * BASE_TASK_DURATIONS.electrical.perSqm), BASE_TASK_DURATIONS.electrical.minimum),
        demolitionTask ? [demolitionTask.id] : [],
        true,
        false,
        space.actualArea * 80000,
        ['전선', '콘센트', '스위치'],
        ['전기 기술자']
      ))
    }

    // 바닥재 작업
    if (space.tasks.flooring && space.tasks.flooring.length > 0) {
      const dependencies = []
      const electricalTask = tasks.find(t => t.space === space.name && t.category === 'electrical')
      if (electricalTask) dependencies.push(electricalTask.id)

      const flooringType = space.tasks.flooring[0]
      const costMultiplier = getFlooringCostMultiplier(flooringType)

      tasks.push(createTask(
        taskCounter++,
        `${space.name} 바닥재 시공`,
        `${space.name}에 ${getFlooringDisplayName(flooringType)}을(를) 시공합니다`,
        space.name,
        'flooring',
        Math.max(Math.ceil(space.actualArea * BASE_TASK_DURATIONS.flooring.perSqm), BASE_TASK_DURATIONS.flooring.minimum),
        dependencies,
        true,
        false,
        space.actualArea * costMultiplier,
        [getFlooringDisplayName(flooringType), '접착제', '몰딩'],
        ['바닥재 시공자']
      ))
    }

    // 벽면 작업
    if (space.tasks.walls && space.tasks.walls.length > 0) {
      const dependencies = []
      const electricalTask = tasks.find(t => t.space === space.name && t.category === 'electrical')
      if (electricalTask) dependencies.push(electricalTask.id)

      const wallType = space.tasks.walls[0]
      const costMultiplier = getWallCostMultiplier(wallType)

      tasks.push(createTask(
        taskCounter++,
        `${space.name} 벽면 작업`,
        `${space.name}에 ${getWallDisplayName(wallType)} 작업을 진행합니다`,
        space.name,
        'painting',
        Math.max(Math.ceil(space.actualArea * BASE_TASK_DURATIONS.painting.perSqm), BASE_TASK_DURATIONS.painting.minimum),
        dependencies,
        false,
        false,
        space.actualArea * costMultiplier,
        [getWallDisplayName(wallType), '프라이머', '도구'],
        ['페인터', '도배사']
      ))
    }

    // 가구 설치
    if (space.tasks.furniture) {
      const flooringTask = tasks.find(t => t.space === space.name && t.category === 'flooring')
      const wallTask = tasks.find(t => t.space === space.name && t.category === 'painting')
      const dependencies = []
      if (flooringTask) dependencies.push(flooringTask.id)
      if (wallTask) dependencies.push(wallTask.id)

      tasks.push(createTask(
        taskCounter++,
        `${space.name} 가구 설치`,
        `${space.name}에 가구를 설치합니다`,
        space.name,
        'carpentry',
        Math.max(2, Math.ceil(space.actualArea * 0.2)),
        dependencies,
        false,
        true,
        space.actualArea * 100000,
        ['가구', '나사', '조립 도구'],
        ['가구 설치자']
      ))
    }

    // 주방 특별 작업
    if (space.id === 'kitchen') {
      if (space.tasks.sink) {
        const dependencies = []
        const demolitionTask = tasks.find(t => t.space === space.name && t.category === 'demolition')
        if (demolitionTask) dependencies.push(demolitionTask.id)

        tasks.push(createTask(
          taskCounter++,
          `${space.name} 싱크대 설치`,
          `${space.name}에 싱크대를 설치합니다`,
          space.name,
          'plumbing',
          3,
          dependencies,
          true,
          false,
          800000,
          ['싱크대', '수도관', '배수관'],
          ['배관공', '설치기사']
        ))
      }
    }

    // 욕실 특별 작업
    if (space.id === 'bathroom') {
      if (space.tasks.renovation) {
        const dependencies = []
        const demolitionTask = tasks.find(t => t.space === space.name && t.category === 'demolition')
        if (demolitionTask) dependencies.push(demolitionTask.id)

        const renovationType = space.tasks.renovation
        const duration = renovationType === 'full' ? 7 : renovationType === 'waterproof' ? 3 : 4
        const cost = renovationType === 'full' ? 2000000 : renovationType === 'waterproof' ? 500000 : 1000000

        tasks.push(createTask(
          taskCounter++,
          `${space.name} 리모델링`,
          `${space.name} ${getRenovationDisplayName(renovationType)} 작업을 진행합니다`,
          space.name,
          'plumbing',
          duration,
          dependencies,
          true,
          false,
          cost,
          ['타일', '방수재', '배관자재'],
          ['타일공', '배관공', '방수전문가']
        ))
      }
    }

    // 마무리 정리 작업
    const spaceTaskDependencies = tasks
      .filter(t => t.space === space.name && t.category !== 'cleanup')
      .map(t => t.id)

    if (spaceTaskDependencies.length > 0) {
      tasks.push(createTask(
        taskCounter++,
        `${space.name} 마무리 정리`,
        `${space.name}의 시공 완료 후 정리 작업을 진행합니다`,
        space.name,
        'cleanup',
        1,
        spaceTaskDependencies,
        false,
        true,
        50000,
        ['청소용품', '보호필름'],
        ['청소 전문가']
      ))
    }
  })

  return tasks
}

// 프로젝트 기간 파싱 ("6주" -> 6)
function parseProjectDuration(duration: string): number {
  const match = duration.match(/\d+/)
  return match ? parseInt(match[0]) : 6
}

// 스타일에 따른 품질 등급 결정
function determineQualityLevel(style: string): string {
  if (style?.includes('luxury') || style?.includes('premium')) {
    return 'premium'
  } else if (style?.includes('budget') || style?.includes('economical')) {
    return 'budget'
  }
  return 'standard'
}

// 헬퍼 함수들
function createTask(
  id: number,
  name: string,
  description: string,
  space: string,
  category: any,
  duration: number,
  dependencies: string[],
  isCritical: boolean,
  isMilestone: boolean,
  estimatedCost: number,
  materials: string[],
  skills: string[]
): GeneratedTask {
  return {
    id: `task-${id}`,
    name,
    description,
    space,
    category,
    duration,
    dependencies,
    isCritical,
    isMilestone,
    estimatedCost,
    materials,
    skills
  }
}

function getFlooringCostMultiplier(type: string): number {
  switch (type) {
    case 'laminate': return 120000
    case 'hardwood': return 200000
    case 'tile': return 150000
    case 'carpet': return 80000
    default: return 120000
  }
}

function getWallCostMultiplier(type: string): number {
  switch (type) {
    case 'wallpaper': return 60000
    case 'paint': return 40000
    case 'tile': return 180000
    case 'paneling': return 250000
    default: return 60000
  }
}

function getFlooringDisplayName(type: string): string {
  switch (type) {
    case 'laminate': return '강화마루'
    case 'hardwood': return '원목마루'
    case 'tile': return '타일'
    case 'carpet': return '카펫'
    default: return '바닥재'
  }
}

function getWallDisplayName(type: string): string {
  switch (type) {
    case 'wallpaper': return '도배'
    case 'paint': return '페인트'
    case 'tile': return '타일'
    case 'paneling': return '패널링'
    default: return '벽면재'
  }
}

function getRenovationDisplayName(type: string): string {
  switch (type) {
    case 'full': return '전체 리모델링'
    case 'tile_only': return '타일 교체'
    case 'fixtures_only': return '기구 교체'
    case 'waterproof': return '방수 보수'
    default: return '리모델링'
  }
}