import { 
  TaskMaster, 
  taskMasterData, 
  spaceTaskTemplates, 
  adjustDurationByArea,
  concurrentWorkRules,
  noiseWorkHours,
  taskCostEstimates
} from './taskDatabase';
import { 
  SpaceSelection, 
  ProjectBasicInfo, 
  ScheduleInfo, 
  GeneratedTask 
} from './types/project';

// CPM 노드 인터페이스
interface CPMNode {
  id: string;
  name: string;
  duration: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
  dependencies: string[];
  dependents: string[];
  category: string;
  space: string;
  estimatedCost: number;
  startDate?: Date;
  endDate?: Date;
  warnings: string[];
  tips: string[];
  requiredSpecialists: string[];
  isDIYPossible: boolean;
  noiseLevel: string;
  dustLevel: string;
}

// 스케줄 생성 결과
interface ScheduleResult {
  tasks: CPMNode[];
  criticalPath: string[];
  totalDays: number;
  totalCost: number;
  startDate: Date;
  endDate: Date;
  warnings: string[];
  recommendations: string[];
}

// 위상 정렬을 통한 작업 순서 결정
function topologicalSort(tasks: Map<string, CPMNode>): string[] {
  const visited = new Set<string>();
  const stack: string[] = [];
  
  function visit(taskId: string) {
    if (visited.has(taskId)) return;
    visited.add(taskId);
    
    const task = tasks.get(taskId);
    if (task) {
      task.dependencies.forEach(depId => visit(depId));
      stack.push(taskId);
    }
  }
  
  tasks.forEach((_, taskId) => visit(taskId));
  return stack;
}

// Forward Pass - 최소 시작 시간 계산
function forwardPass(tasks: Map<string, CPMNode>, sortedIds: string[]) {
  sortedIds.forEach(taskId => {
    const task = tasks.get(taskId)!;
    
    if (task.dependencies.length === 0) {
      task.earlyStart = 0;
    } else {
      task.earlyStart = Math.max(
        ...task.dependencies.map(depId => {
          const dep = tasks.get(depId)!;
          return dep.earlyFinish;
        })
      );
    }
    
    task.earlyFinish = task.earlyStart + task.duration;
  });
}

// Backward Pass - 최대 시작 시간 계산
function backwardPass(tasks: Map<string, CPMNode>, sortedIds: string[], projectDuration: number) {
  // 역순으로 처리
  [...sortedIds].reverse().forEach(taskId => {
    const task = tasks.get(taskId)!;
    
    if (task.dependents.length === 0) {
      task.lateFinish = projectDuration;
    } else {
      task.lateFinish = Math.min(
        ...task.dependents.map(depId => {
          const dep = tasks.get(depId)!;
          return dep.lateStart;
        })
      );
    }
    
    task.lateStart = task.lateFinish - task.duration;
    task.slack = task.lateStart - task.earlyStart;
    task.isCritical = task.slack === 0;
  });
}

// 작업 간 의존성 설정
function buildDependents(tasks: Map<string, CPMNode>) {
  tasks.forEach(task => {
    task.dependents = [];
  });
  
  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      const dep = tasks.get(depId);
      if (dep) {
        dep.dependents.push(task.id);
      }
    });
  });
}

// 병렬 작업 최적화
function optimizeParallelWork(tasks: Map<string, CPMNode>) {
  const spaceGroups = new Map<string, CPMNode[]>();
  
  // 공간별로 작업 그룹화
  tasks.forEach(task => {
    if (!spaceGroups.has(task.space)) {
      spaceGroups.set(task.space, []);
    }
    spaceGroups.get(task.space)!.push(task);
  });
  
  // 다른 공간에서 동시 작업 가능한 경우 조정
  spaceGroups.forEach((spaceTasks, space) => {
    spaceTasks.forEach(task => {
      // 같은 카테고리의 다른 공간 작업 찾기
      tasks.forEach(otherTask => {
        if (otherTask.space !== space && 
            otherTask.category === task.category &&
            canWorkConcurrently(task.category, otherTask.category)) {
          // 동시 작업 가능하면 시작 시간 맞추기
          if (Math.abs(task.earlyStart - otherTask.earlyStart) < 2) {
            const syncStart = Math.min(task.earlyStart, otherTask.earlyStart);
            task.earlyStart = syncStart;
            otherTask.earlyStart = syncStart;
          }
        }
      });
    });
  });
}

// 동시 작업 가능 여부 확인
function canWorkConcurrently(category1: string, category2: string): boolean {
  return concurrentWorkRules[category1]?.includes(category2) || false;
}

// 작업일 계산 (주말/공휴일 제외)
function calculateWorkDays(startDate: Date, duration: number, workDays: string[]): Date {
  const endDate = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < duration) {
    endDate.setDate(endDate.getDate() + 1);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][endDate.getDay()];
    
    if (workDays.includes(dayName)) {
      daysAdded++;
    }
  }
  
  return endDate;
}

// 공간별 작업 추출
function extractTasksFromSpaces(
  spaces: SpaceSelection[],
  basicInfo: ProjectBasicInfo,
  scheduleInfo: ScheduleInfo
): Map<string, CPMNode> {
  const tasks = new Map<string, CPMNode>();
  
  spaces.forEach(space => {
    const templateTasks = spaceTaskTemplates[space.id] || [];
    
    templateTasks.forEach(taskId => {
      const masterTask = taskMasterData[taskId];
      if (!masterTask) return;
      
      // 면적에 따른 기간 조정
      const adjustedDuration = adjustDurationByArea(
        masterTask.baseDuration,
        space.actualArea || basicInfo.totalArea / spaces.length
      );
      
      // 비용 계산
      const categoryKey = masterTask.category as keyof typeof taskCostEstimates;
      const estimatedCost = taskCostEstimates[categoryKey] * (space.actualArea || basicInfo.totalArea / spaces.length);
      
      const node: CPMNode = {
        id: `${space.id}_${taskId}`,
        name: `${space.name} - ${masterTask.name}`,
        duration: adjustedDuration,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
        isCritical: false,
        dependencies: masterTask.dependencies.map(dep => `${space.id}_${dep}`),
        dependents: [],
        category: masterTask.category,
        space: space.name,
        estimatedCost,
        warnings: [...masterTask.warnings],
        tips: [...masterTask.tips],
        requiredSpecialists: [...masterTask.requiredSpecialists],
        isDIYPossible: masterTask.isDIYPossible,
        noiseLevel: masterTask.noiseLevel,
        dustLevel: masterTask.dustLevel
      };
      
      // 거주 중 공사 제약사항 추가
      if (basicInfo.residenceStatus === 'occupied') {
        if (masterTask.noiseLevel === 'high') {
          node.warnings.push('거주 중 공사로 소음 작업 시간 엄격 준수 필요');
        }
        if (masterTask.dustLevel === 'high') {
          node.warnings.push('거주 중 공사로 분진 차단막 필수 설치');
        }
      }
      
      tasks.set(node.id, node);
    });
  });
  
  // 의존성 검증 및 정리
  tasks.forEach(task => {
    task.dependencies = task.dependencies.filter(depId => tasks.has(depId));
  });
  
  return tasks;
}

// 메인 스케줄 생성 함수
export function generateCompleteSchedule(
  spaces: SpaceSelection[],
  basicInfo: ProjectBasicInfo,
  scheduleInfo: ScheduleInfo
): ScheduleResult {
  // 1. 작업 추출
  const tasks = extractTasksFromSpaces(spaces, basicInfo, scheduleInfo);
  
  // 2. 의존성 설정
  buildDependents(tasks);
  
  // 3. 위상 정렬
  const sortedIds = topologicalSort(tasks);
  
  // 4. Forward Pass
  forwardPass(tasks, sortedIds);
  
  // 5. 프로젝트 총 기간 계산
  const projectDuration = Math.max(...Array.from(tasks.values()).map(t => t.earlyFinish));
  
  // 6. Backward Pass
  backwardPass(tasks, sortedIds, projectDuration);
  
  // 7. 병렬 작업 최적화
  optimizeParallelWork(tasks);
  
  // 8. Critical Path 추출
  const criticalPath = Array.from(tasks.values())
    .filter(t => t.isCritical)
    .map(t => t.id);
  
  // 9. 실제 날짜 할당
  const startDate = new Date(scheduleInfo.startDate);
  tasks.forEach(task => {
    task.startDate = calculateWorkDays(startDate, task.earlyStart, scheduleInfo.workDays);
    task.endDate = calculateWorkDays(startDate, task.earlyFinish, scheduleInfo.workDays);
  });
  
  // 10. 전체 프로젝트 종료일
  const endDate = calculateWorkDays(startDate, projectDuration, scheduleInfo.workDays);
  
  // 11. 경고 및 추천사항 생성
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // 총 비용 계산
  const totalCost = Array.from(tasks.values()).reduce((sum, task) => sum + task.estimatedCost, 0);
  
  // 일정 경고
  if (projectDuration > parseInt(basicInfo.projectDuration)) {
    warnings.push(`예상 공사 기간(${projectDuration}일)이 희망 기간(${basicInfo.projectDuration}일)을 초과합니다.`);
    recommendations.push('일부 작업을 DIY로 전환하거나 병렬 작업을 늘려 기간을 단축할 수 있습니다.');
  }
  
  // 예산 경고
  const budgetLimit = parseInt(basicInfo.budgetRange?.split('-')[1] || '0') * 10000;
  if (budgetLimit > 0 && totalCost > budgetLimit) {
    warnings.push(`예상 비용(${totalCost.toLocaleString()}원)이 예산을 초과합니다.`);
    recommendations.push('DIY 가능한 작업을 직접 시공하여 비용을 절감할 수 있습니다.');
  }
  
  // 거주 중 공사 경고
  if (basicInfo.residenceStatus === 'occupied') {
    warnings.push('거주 중 공사로 소음/분진 작업 시간이 제한됩니다.');
    recommendations.push('생활 영향이 큰 작업은 주말이나 외출 시간에 집중 배치하세요.');
  }
  
  // DIY 추천
  const diyTasks = Array.from(tasks.values()).filter(t => t.isDIYPossible);
  if (diyTasks.length > 0) {
    const diySavings = diyTasks.reduce((sum, task) => sum + task.estimatedCost * 0.5, 0);
    recommendations.push(`DIY 가능 작업: ${diyTasks.length}개 (예상 절감액: ${diySavings.toLocaleString()}원)`);
  }
  
  return {
    tasks: Array.from(tasks.values()),
    criticalPath,
    totalDays: projectDuration,
    totalCost,
    startDate,
    endDate,
    warnings,
    recommendations
  };
}

// 간트차트 데이터 생성
export function generateGanttChartData(
  tasks: CPMNode[],
  scheduleInfo: ScheduleInfo,
  totalDays: number
) {
  const ganttData = {
    tasks: tasks.map(task => ({
      id: task.id,
      name: task.name,
      start: task.startDate!.toISOString(),
      end: task.endDate!.toISOString(),
      duration: task.duration,
      dependencies: task.dependencies,
      progress: 0,
      isCritical: task.isCritical,
      category: task.category,
      space: task.space,
      resources: task.requiredSpecialists,
      cost: task.estimatedCost
    })),
    insights: {
      totalDuration: totalDays,
      criticalPathLength: tasks.filter(t => t.isCritical).length,
      parallelWorkOpportunities: identifyParallelOpportunities(tasks),
      bottlenecks: identifyBottlenecks(tasks),
      warnings: []
    }
  };
  
  return ganttData;
}

// 병렬 작업 기회 식별
function identifyParallelOpportunities(tasks: CPMNode[]): number {
  let opportunities = 0;
  const timeSlots = new Map<number, CPMNode[]>();
  
  tasks.forEach(task => {
    const slot = task.earlyStart;
    if (!timeSlots.has(slot)) {
      timeSlots.set(slot, []);
    }
    timeSlots.get(slot)!.push(task);
  });
  
  timeSlots.forEach(slotTasks => {
    if (slotTasks.length > 1) {
      opportunities += slotTasks.length - 1;
    }
  });
  
  return opportunities;
}

// 병목 구간 식별
function identifyBottlenecks(tasks: CPMNode[]): string[] {
  const bottlenecks: string[] = [];
  
  tasks.forEach(task => {
    if (task.isCritical && task.dependents.length > 2) {
      bottlenecks.push(`${task.name}는 ${task.dependents.length}개의 후속 작업에 영향을 줍니다.`);
    }
  });
  
  return bottlenecks;
}

// AI 추천사항 생성
export function generateAIRecommendations(
  scheduleResult: ScheduleResult,
  basicInfo: ProjectBasicInfo
): {
  costSaving: string[];
  timeSaving: string[];
  riskMitigation: string[];
  alternatives: string[];
} {
  const recommendations = {
    costSaving: [] as string[],
    timeSaving: [] as string[],
    riskMitigation: [] as string[],
    alternatives: [] as string[]
  };
  
  // 비용 절감 방안
  const diyTasks = scheduleResult.tasks.filter(t => t.isDIYPossible);
  if (diyTasks.length > 0) {
    const totalDIYSaving = diyTasks.reduce((sum, task) => sum + task.estimatedCost * 0.5, 0);
    recommendations.costSaving.push(
      `${diyTasks.map(t => t.name).join(', ')} 작업을 DIY로 진행하면 약 ${totalDIYSaving.toLocaleString()}원 절감 가능`
    );
  }
  
  // 일정 단축 방안
  const parallelOpportunities = scheduleResult.tasks.filter(t => 
    !t.isCritical && t.slack > 2
  );
  if (parallelOpportunities.length > 0) {
    recommendations.timeSaving.push(
      `${parallelOpportunities[0].name} 등 ${parallelOpportunities.length}개 작업의 여유 시간을 활용하여 병렬 작업 가능`
    );
  }
  
  // 리스크 완화
  if (basicInfo.residenceStatus === 'occupied') {
    recommendations.riskMitigation.push(
      '거주 중 공사로 인한 불편을 최소화하기 위해 소음 작업은 외출 시간에 집중 배치'
    );
  }
  
  const highNoiseTask = scheduleResult.tasks.filter(t => t.noiseLevel === 'high');
  if (highNoiseTask.length > 0) {
    recommendations.riskMitigation.push(
      `소음 작업(${highNoiseTask.length}개)은 평일 오전 9시-오후 6시 사이에만 진행`
    );
  }
  
  // 대안 제시
  if (scheduleResult.totalDays > parseInt(basicInfo.projectDuration)) {
    recommendations.alternatives.push(
      '공사 기간 단축을 위해 일부 마감재를 조립식이나 시공이 빠른 제품으로 변경 검토'
    );
  }
  
  return recommendations;
}