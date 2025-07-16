import { SpaceSelection, GeneratedTask } from '../types'
import { 
  CONSTRUCTION_PHASES, 
  MATERIAL_COSTS, 
  SPECIAL_ROOM_TASKS, 
  SCALE_FACTORS,
  REFERENCE_COSTS 
} from '../types/construction'

interface RealisticTaskConfig {
  totalArea: number;
  projectDuration: number; // weeks
  qualityLevel: 'budget' | 'standard' | 'premium';
  livingDuringWork: boolean;
}

// 실제 건설업계 기준 작업 추출기
export function extractRealisticTasks(
  spaces: SpaceSelection[], 
  config: RealisticTaskConfig
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let taskCounter = 1

  // 전체 프로젝트 규모 계수 계산
  const scaleFactors = calculateScaleFactors(config.totalArea, config.qualityLevel)
  
  // 1단계: 철거 및 준비 작업 (순차적, 공간별)
  const demolitionTasks = generateDemolitionPhase(spaces, scaleFactors, taskCounter)
  tasks.push(...demolitionTasks)
  taskCounter += demolitionTasks.length

  // 2단계: 구조 및 설비 러프인 (일부 병렬 가능)
  const roughInTasks = generateRoughInPhase(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...roughInTasks)
  taskCounter += roughInTasks.length

  // 3단계: 벽체 마감 (순차적)
  const wallTasks = generateWallPhase(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...wallTasks)
  taskCounter += wallTasks.length

  // 4단계: 바닥 작업 (공간별 순차)
  const flooringTasks = generateFlooringPhase(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...flooringTasks)
  taskCounter += flooringTasks.length

  // 5단계: 도장 작업 (공간별 순차)
  const paintingTasks = generatePaintingPhase(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...paintingTasks)
  taskCounter += paintingTasks.length

  // 6단계: 마감 설비 (병렬 가능)
  const finishTasks = generateFinishPhase(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...finishTasks)
  taskCounter += finishTasks.length

  // 7단계: 특수 공간 작업 (주방, 욕실)
  const specialTasks = generateSpecialRoomTasks(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...specialTasks)
  taskCounter += specialTasks.length

  // 8단계: 최종 마무리
  const completionTasks = generateCompletionPhase(spaces, scaleFactors, taskCounter, tasks)
  tasks.push(...completionTasks)

  return tasks
}

function calculateScaleFactors(totalArea: number, qualityLevel: 'budget' | 'standard' | 'premium') {
  // 면적별 계수
  let areaFactor
  if (totalArea <= 20) areaFactor = SCALE_FACTORS.area.small
  else if (totalArea <= 40) areaFactor = SCALE_FACTORS.area.medium
  else if (totalArea <= 60) areaFactor = SCALE_FACTORS.area.large
  else areaFactor = SCALE_FACTORS.area.xlarge

  // 품질별 계수
  const qualityFactor = SCALE_FACTORS.quality[qualityLevel]

  return {
    timeMultiplier: areaFactor.timeFactor * qualityFactor.timeFactor,
    costMultiplier: areaFactor.costFactor * qualityFactor.costFactor
  }
}

function generateDemolitionPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter

  // 전체 철거는 공간별로 순차 진행
  spaces.forEach((space, index) => {
    if (space.scope === 'full') {
      const demolitionPhase = CONSTRUCTION_PHASES.PHASE_1_PREP.demolition
      const duration = Math.max(
        Math.ceil(space.actualArea * demolitionPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
        demolitionPhase.baseTime.minimum
      )
      const cost = Math.max(
        space.actualArea * demolitionPhase.baseCost.perSqm * scaleFactors.costMultiplier,
        demolitionPhase.baseCost.minimum
      )

      const dependencies = index > 0 ? [`demo-${counter - 1}`] : []

      tasks.push(createRealisticTask(
        `demo-${counter}`,
        `${space.name} ${demolitionPhase.name}`,
        `${space.name}의 ${demolitionPhase.description}`,
        space.name,
        'demolition',
        duration,
        dependencies,
        true, // critical
        false,
        cost,
        ['철거 도구', '폐기물 처리', '방진 설비'],
        ['철거 전문가', '폐기물 처리업체'],
        true // noisy work
      ))
      counter++
    }
  })

  // 현장 정리 작업 (철거 완료 후)
  if (tasks.length > 0) {
    const prepPhase = CONSTRUCTION_PHASES.PHASE_1_PREP.site_preparation
    const totalArea = spaces.reduce((sum, space) => sum + space.actualArea, 0)
    
    tasks.push(createRealisticTask(
      `prep-${counter}`,
      prepPhase.name,
      prepPhase.description,
      '전체',
      'cleanup',
      Math.max(
        Math.ceil(totalArea * prepPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
        prepPhase.baseTime.minimum
      ),
      tasks.map(t => t.id), // 모든 철거 작업 완료 후
      true,
      false,
      Math.max(
        totalArea * prepPhase.baseCost.perSqm * scaleFactors.costMultiplier,
        prepPhase.baseCost.minimum
      ),
      ['폐기물 컨테이너', '청소 도구'],
      ['정리 전문가'],
      false
    ))
  }

  return tasks
}

function generateRoughInPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter
  
  const totalArea = spaces.reduce((sum, space) => sum + space.actualArea, 0)
  const prepTaskIds = existingTasks.filter(t => t.category === 'cleanup').map(t => t.id)

  // 구조 작업 (전체 동시 진행)
  const structuralPhase = CONSTRUCTION_PHASES.PHASE_2_ROUGH_IN.structural_work
  tasks.push(createRealisticTask(
    `struct-${counter++}`,
    structuralPhase.name,
    structuralPhase.description,
    '전체',
    'carpentry',
    Math.max(
      Math.ceil(totalArea * structuralPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      structuralPhase.baseTime.minimum
    ),
    prepTaskIds,
    true,
    false,
    Math.max(
      totalArea * structuralPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      structuralPhase.baseCost.minimum
    ),
    ['목재', 'H빔', '앵커볼트', '단열재'],
    ['구조 전문가', '목수'],
    true
  ))

  // 전기 러프인 (구조 완료 후)
  const electricalPhase = CONSTRUCTION_PHASES.PHASE_2_ROUGH_IN.electrical_rough
  tasks.push(createRealisticTask(
    `elec-rough-${counter++}`,
    electricalPhase.name,
    electricalPhase.description,
    '전체',
    'electrical',
    Math.max(
      Math.ceil(totalArea * electricalPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      electricalPhase.baseTime.minimum
    ),
    [`struct-${counter - 2}`],
    true,
    false,
    Math.max(
      totalArea * electricalPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      electricalPhase.baseCost.minimum
    ),
    ['전선', '배관', '배전반', '콘센트 박스'],
    ['전기 기술자'],
    false
  ))

  // 배관 러프인 (구조 완료 후, 전기와 병렬 가능)
  const plumbingPhase = CONSTRUCTION_PHASES.PHASE_2_ROUGH_IN.plumbing_rough
  tasks.push(createRealisticTask(
    `plumb-rough-${counter++}`,
    plumbingPhase.name,
    plumbingPhase.description,
    '전체',
    'plumbing',
    Math.max(
      Math.ceil(totalArea * plumbingPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      plumbingPhase.baseTime.minimum
    ),
    [`struct-${counter - 3}`],
    false, // 병렬 가능하므로 critical path 아님
    false,
    Math.max(
      totalArea * plumbingPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      plumbingPhase.baseCost.minimum
    ),
    ['급수관', '배수관', '밸브', '조인트'],
    ['배관공'],
    false
  ))

  return tasks
}

function generateWallPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter
  
  const totalArea = spaces.reduce((sum, space) => sum + space.actualArea, 0)
  const roughInDeps = existingTasks
    .filter(t => t.id.includes('rough') || t.id.includes('struct'))
    .map(t => t.id)

  // 단열 작업
  const insulationPhase = CONSTRUCTION_PHASES.PHASE_3_WALLS.insulation
  tasks.push(createRealisticTask(
    `insul-${counter++}`,
    insulationPhase.name,
    insulationPhase.description,
    '전체',
    'carpentry',
    Math.max(
      Math.ceil(totalArea * insulationPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      insulationPhase.baseTime.minimum
    ),
    roughInDeps,
    true,
    false,
    Math.max(
      totalArea * insulationPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      insulationPhase.baseCost.minimum
    ),
    ['단열재', '방습지', '테이프'],
    ['단열 전문가'],
    false
  ))

  // 석고보드 설치
  const drywallPhase = CONSTRUCTION_PHASES.PHASE_3_WALLS.drywall
  tasks.push(createRealisticTask(
    `drywall-${counter++}`,
    drywallPhase.name,
    drywallPhase.description,
    '전체',
    'carpentry',
    Math.max(
      Math.ceil(totalArea * drywallPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      drywallPhase.baseTime.minimum
    ),
    [`insul-${counter - 2}`],
    true,
    false,
    Math.max(
      totalArea * drywallPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      drywallPhase.baseCost.minimum
    ),
    ['석고보드', '나사', '조인트 컴파운드'],
    ['석고보드 시공자'],
    false
  ))

  // 벽체 마감 (퍼티 및 사포)
  const finishingPhase = CONSTRUCTION_PHASES.PHASE_3_WALLS.drywall_finishing
  tasks.push(createRealisticTask(
    `wall-finish-${counter++}`,
    finishingPhase.name,
    finishingPhase.description,
    '전체',
    'painting',
    Math.max(
      Math.ceil(totalArea * finishingPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      finishingPhase.baseTime.minimum
    ) + (finishingPhase.dryingTime || 0), // 건조 시간 추가
    [`drywall-${counter - 2}`],
    true,
    false,
    Math.max(
      totalArea * finishingPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      finishingPhase.baseCost.minimum
    ),
    ['퍼티', '사포', '프라이머'],
    ['마감 전문가'],
    false
  ))

  return tasks
}

function generateFlooringPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter
  
  const wallFinishDeps = existingTasks
    .filter(t => t.id.includes('wall-finish'))
    .map(t => t.id)

  // 공간별 바닥 작업
  spaces.forEach((space, index) => {
    if (space.tasks.flooring && space.tasks.flooring.length > 0) {
      const flooringType = space.tasks.flooring[0]
      
      // 바닥 준비 작업
      const prepPhase = CONSTRUCTION_PHASES.PHASE_4_FLOORING.flooring_prep
      const prepTaskId = `floor-prep-${space.id}-${counter++}`
      
      tasks.push(createRealisticTask(
        prepTaskId,
        `${space.name} ${prepPhase.name}`,
        `${space.name} ${prepPhase.description}`,
        space.name,
        'flooring',
        Math.max(
          Math.ceil(space.actualArea * prepPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
          prepPhase.baseTime.minimum
        ) + (prepPhase.dryingTime || 0),
        wallFinishDeps,
        index === 0, // 첫 번째 방만 critical path
        false,
        Math.max(
          space.actualArea * prepPhase.baseCost.perSqm * scaleFactors.costMultiplier,
          prepPhase.baseCost.minimum
        ),
        ['평탄화재', '방수재', '프라이머'],
        ['바닥 전문가'],
        false
      ))

      // 바닥재 설치
      const installPhase = CONSTRUCTION_PHASES.PHASE_4_FLOORING.flooring_install
      const materialCost = MATERIAL_COSTS.flooring[flooringType as keyof typeof MATERIAL_COSTS.flooring]
      const costPerSqm = scaleFactors.costMultiplier > 1.2 ? materialCost.premium : materialCost.perSqm
      
      tasks.push(createRealisticTask(
        `floor-install-${space.id}-${counter++}`,
        `${space.name} ${getFlooringDisplayName(flooringType)} 설치`,
        `${space.name}에 ${getFlooringDisplayName(flooringType)}을(를) 설치합니다`,
        space.name,
        'flooring',
        Math.max(
          Math.ceil(space.actualArea * installPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
          installPhase.baseTime.minimum
        ),
        [prepTaskId],
        index === 0,
        false,
        space.actualArea * costPerSqm,
        [getFlooringDisplayName(flooringType), '접착제', '몰딩', '문지방'],
        ['바닥재 시공자'],
        false
      ))
    }
  })

  return tasks
}

function generatePaintingPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter
  
  const flooringDeps = existingTasks
    .filter(t => t.id.includes('floor-install'))
    .map(t => t.id)

  const totalArea = spaces.reduce((sum, space) => sum + space.actualArea, 0)

  // 프라이머 작업
  const primerPhase = CONSTRUCTION_PHASES.PHASE_5_PAINTING.primer
  const primerTaskId = `primer-${counter++}`
  
  tasks.push(createRealisticTask(
    primerTaskId,
    primerPhase.name,
    primerPhase.description,
    '전체',
    'painting',
    Math.max(
      Math.ceil(totalArea * primerPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      primerPhase.baseTime.minimum
    ) + (primerPhase.dryingTime || 0),
    flooringDeps,
    true,
    false,
    Math.max(
      totalArea * primerPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      primerPhase.baseCost.minimum
    ),
    ['프라이머', '롤러', '붓', '마스킹테이프'],
    ['페인터'],
    false
  ))

  // 공간별 도장 작업
  spaces.forEach((space, index) => {
    if (space.tasks.walls && space.tasks.walls.length > 0) {
      const wallType = space.tasks.walls[0]
      
      if (wallType === 'paint') {
        // 1차 도장
        const basePaintPhase = CONSTRUCTION_PHASES.PHASE_5_PAINTING.base_paint
        const basePaintTaskId = `paint-1st-${space.id}-${counter++}`
        
        const materialCost = MATERIAL_COSTS.walls.paint
        const costPerSqm = scaleFactors.costMultiplier > 1.2 ? materialCost.premium : materialCost.perSqm
        
        tasks.push(createRealisticTask(
          basePaintTaskId,
          `${space.name} 1차 도장`,
          `${space.name} 벽면 1차 페인트 작업`,
          space.name,
          'painting',
          Math.max(
            Math.ceil(space.actualArea * basePaintPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
            basePaintPhase.baseTime.minimum
          ) + (basePaintPhase.dryingTime || 0),
          [primerTaskId],
          index === 0,
          false,
          space.actualArea * costPerSqm * 0.6, // 1차 도장은 60%
          ['페인트', '롤러', '붓'],
          ['페인터'],
          false
        ))

        // 2차 도장
        const finishPaintPhase = CONSTRUCTION_PHASES.PHASE_5_PAINTING.finish_paint
        
        tasks.push(createRealisticTask(
          `paint-2nd-${space.id}-${counter++}`,
          `${space.name} 2차 도장`,
          `${space.name} 벽면 2차 페인트 작업`,
          space.name,
          'painting',
          Math.max(
            Math.ceil(space.actualArea * finishPaintPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
            finishPaintPhase.baseTime.minimum
          ) + (finishPaintPhase.dryingTime || 0),
          [basePaintTaskId],
          index === 0,
          false,
          space.actualArea * costPerSqm * 0.4, // 2차 도장은 40%
          ['페인트', '롤러', '붓'],
          ['페인터'],
          false
        ))
      } else if (wallType === 'wallpaper') {
        // 도배 작업
        const materialCost = MATERIAL_COSTS.walls.wallpaper
        const costPerSqm = scaleFactors.costMultiplier > 1.2 ? materialCost.premium : materialCost.perSqm
        
        tasks.push(createRealisticTask(
          `wallpaper-${space.id}-${counter++}`,
          `${space.name} 도배`,
          `${space.name} 벽면 도배 작업`,
          space.name,
          'painting',
          Math.max(2, Math.ceil(space.actualArea * 0.3 * scaleFactors.timeMultiplier)),
          [primerTaskId],
          index === 0,
          false,
          space.actualArea * costPerSqm,
          ['벽지', '풀', '도배 도구'],
          ['도배사'],
          false
        ))
      }
    }
  })

  return tasks
}

function generateFinishPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter
  
  const paintingDeps = existingTasks
    .filter(t => t.category === 'painting' && !t.id.includes('primer'))
    .map(t => t.id)

  const totalArea = spaces.reduce((sum, space) => sum + space.actualArea, 0)

  // 전기 마감
  const electricalFinishPhase = CONSTRUCTION_PHASES.PHASE_6_FINISH.electrical_finish
  tasks.push(createRealisticTask(
    `elec-finish-${counter++}`,
    electricalFinishPhase.name,
    electricalFinishPhase.description,
    '전체',
    'electrical',
    Math.max(
      Math.ceil(totalArea * electricalFinishPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      electricalFinishPhase.baseTime.minimum
    ),
    paintingDeps,
    false, // 병렬 가능
    false,
    Math.max(
      totalArea * electricalFinishPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      electricalFinishPhase.baseCost.minimum
    ),
    ['스위치', '콘센트', '조명기구', '커버플레이트'],
    ['전기 기술자'],
    false
  ))

  // 배관 마감
  const plumbingFinishPhase = CONSTRUCTION_PHASES.PHASE_6_FINISH.plumbing_finish
  tasks.push(createRealisticTask(
    `plumb-finish-${counter++}`,
    plumbingFinishPhase.name,
    plumbingFinishPhase.description,
    '전체',
    'plumbing',
    Math.max(
      Math.ceil(totalArea * plumbingFinishPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      plumbingFinishPhase.baseTime.minimum
    ),
    paintingDeps,
    false, // 병렬 가능
    false,
    Math.max(
      totalArea * plumbingFinishPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      plumbingFinishPhase.baseCost.minimum
    ),
    ['수전', '배수구', '트랩', '실리콘'],
    ['배관공'],
    false
  ))

  // 목공 마감
  const carpentryFinishPhase = CONSTRUCTION_PHASES.PHASE_6_FINISH.carpentry_finish
  tasks.push(createRealisticTask(
    `carp-finish-${counter++}`,
    carpentryFinishPhase.name,
    carpentryFinishPhase.description,
    '전체',
    'carpentry',
    Math.max(
      Math.ceil(totalArea * carpentryFinishPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      carpentryFinishPhase.baseTime.minimum
    ),
    paintingDeps,
    false, // 병렬 가능
    false,
    Math.max(
      totalArea * carpentryFinishPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      carpentryFinishPhase.baseCost.minimum
    ),
    ['문틀', '걸레받이', '몰딩', '실리콘'],
    ['목수'],
    false
  ))

  return tasks
}

function generateSpecialRoomTasks(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter

  spaces.forEach(space => {
    // 주방 특수 작업
    if (space.id === 'kitchen' && space.tasks.sink) {
      const roughInDeps = existingTasks
        .filter(t => t.id.includes('rough'))
        .map(t => t.id)

      // 주방 방수
      const kitchenWaterproof = SPECIAL_ROOM_TASKS.kitchen.waterproofing
      const waterproofTaskId = `kitchen-waterproof-${counter++}`
      
      tasks.push(createRealisticTask(
        waterproofTaskId,
        `주방 ${kitchenWaterproof.name}`,
        `주방 ${kitchenWaterproof.name} 작업`,
        space.name,
        'plumbing',
        kitchenWaterproof.baseTime.fixed + (kitchenWaterproof.dryingTime || 0),
        roughInDeps,
        true,
        false,
        kitchenWaterproof.baseCost.fixed * scaleFactors.costMultiplier,
        ['방수재', '프라이머', '실링재'],
        ['방수 전문가'],
        false
      ))

      // 싱크대 설치
      const cabinetInstall = SPECIAL_ROOM_TASKS.kitchen.cabinet_install
      const sinkCost = scaleFactors.costMultiplier > 1.2 
        ? MATERIAL_COSTS.fixtures.kitchen_sink.premium 
        : MATERIAL_COSTS.fixtures.kitchen_sink.standard

      tasks.push(createRealisticTask(
        `kitchen-cabinet-${counter++}`,
        `주방 ${cabinetInstall.name}`,
        `주방 ${cabinetInstall.name} 작업`,
        space.name,
        'carpentry',
        cabinetInstall.baseTime.fixed,
        [waterproofTaskId],
        false,
        true, // milestone
        sinkCost,
        ['싱크대', '수전', '배수관', '가스배관'],
        ['싱크대 설치기사', '배관공'],
        false
      ))
    }

    // 욕실 특수 작업
    if (space.id === 'bathroom' && space.tasks.renovation) {
      const roughInDeps = existingTasks
        .filter(t => t.id.includes('rough'))
        .map(t => t.id)

      // 욕실 방수
      const bathroomWaterproof = SPECIAL_ROOM_TASKS.bathroom.waterproofing
      const waterproofTaskId = `bathroom-waterproof-${counter++}`
      
      tasks.push(createRealisticTask(
        waterproofTaskId,
        `욕실 ${bathroomWaterproof.name}`,
        `욕실 ${bathroomWaterproof.name} 작업`,
        space.name,
        'plumbing',
        bathroomWaterproof.baseTime.fixed + (bathroomWaterproof.dryingTime || 0),
        roughInDeps,
        true,
        false,
        bathroomWaterproof.baseCost.fixed * scaleFactors.costMultiplier,
        ['방수재', '프라이머', '실링재', '방수테이프'],
        ['방수 전문가'],
        false
      ))

      // 욕실 타일
      const tileInstall = SPECIAL_ROOM_TASKS.bathroom.tile_install
      const tileTaskId = `bathroom-tile-${counter++}`
      
      tasks.push(createRealisticTask(
        tileTaskId,
        `욕실 ${tileInstall.name}`,
        `욕실 ${tileInstall.name} 작업`,
        space.name,
        'flooring',
        tileInstall.baseTime.fixed + (tileInstall.dryingTime || 0),
        [waterproofTaskId],
        true,
        false,
        Math.max(
          space.actualArea * tileInstall.baseCost.perSqm,
          tileInstall.baseCost.minimum
        ) * scaleFactors.costMultiplier,
        ['욕실 타일', '접착제', '줄눈재', '실리콘'],
        ['타일공'],
        false
      ))

      // 욕실 기구 설치
      const fixtureInstall = SPECIAL_ROOM_TASKS.bathroom.fixture_install
      const fixtureCost = scaleFactors.costMultiplier > 1.2 
        ? MATERIAL_COSTS.fixtures.bathroom_full.premium 
        : MATERIAL_COSTS.fixtures.bathroom_full.standard

      tasks.push(createRealisticTask(
        `bathroom-fixture-${counter++}`,
        `욕실 ${fixtureInstall.name}`,
        `욕실 ${fixtureInstall.name} 작업`,
        space.name,
        'plumbing',
        fixtureInstall.baseTime.fixed,
        [tileTaskId],
        false,
        true, // milestone
        fixtureCost,
        ['변기', '세면대', '샤워기', '수전'],
        ['위생 설비 기사'],
        false
      ))
    }
  })

  return tasks
}

function generateCompletionPhase(
  spaces: SpaceSelection[], 
  scaleFactors: any, 
  startCounter: number,
  existingTasks: GeneratedTask[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  let counter = startCounter
  
  const totalArea = spaces.reduce((sum, space) => sum + space.actualArea, 0)
  
  // 모든 마감 작업 완료 후 의존성
  const finishDeps = existingTasks
    .filter(t => 
      t.id.includes('finish') || 
      t.id.includes('cabinet') || 
      t.id.includes('fixture')
    )
    .map(t => t.id)

  // 최종 점검
  const inspectionPhase = CONSTRUCTION_PHASES.PHASE_7_COMPLETION.final_inspection
  const inspectionTaskId = `final-inspection-${counter++}`
  
  tasks.push(createRealisticTask(
    inspectionTaskId,
    inspectionPhase.name,
    inspectionPhase.description,
    '전체',
    'cleanup',
    Math.max(
      Math.ceil(totalArea * inspectionPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      inspectionPhase.baseTime.minimum
    ),
    finishDeps,
    true,
    true, // milestone
    Math.max(
      totalArea * inspectionPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      inspectionPhase.baseCost.minimum
    ),
    ['검사 도구', '측정기'],
    ['품질 관리자', '전기 검사관'],
    false
  ))

  // 최종 청소
  const cleanupPhase = CONSTRUCTION_PHASES.PHASE_7_COMPLETION.final_cleanup
  
  tasks.push(createRealisticTask(
    `final-cleanup-${counter++}`,
    cleanupPhase.name,
    cleanupPhase.description,
    '전체',
    'cleanup',
    Math.max(
      Math.ceil(totalArea * cleanupPhase.baseTime.perSqm * scaleFactors.timeMultiplier),
      cleanupPhase.baseTime.minimum
    ),
    [inspectionTaskId],
    true,
    true, // milestone
    Math.max(
      totalArea * cleanupPhase.baseCost.perSqm * scaleFactors.costMultiplier,
      cleanupPhase.baseCost.minimum
    ),
    ['청소 도구', '보호필름 제거'],
    ['청소 전문가'],
    false
  ))

  return tasks
}

function createRealisticTask(
  id: string,
  name: string,
  description: string,
  space: string,
  category: GeneratedTask['category'],
  duration: number,
  dependencies: string[],
  isCritical: boolean,
  isMilestone: boolean,
  estimatedCost: number,
  materials: string[],
  skills: string[],
  noisyWork: boolean = false
): GeneratedTask {
  return {
    id,
    name,
    description,
    space,
    category,
    duration,
    dependencies,
    isCritical,
    isMilestone,
    estimatedCost: Math.round(estimatedCost),
    materials,
    skills
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