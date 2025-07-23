/**
 * 리팩토링된 taskDatabase
 * 기존 taskDatabase.ts의 기능을 모듈화하여 재구성
 */

// 상수 및 데이터 import
export { contractors, getContractor, getContractorsBySpecialty } from './constants/contractors'
export { basicInteriorTasks } from './constants/tasks/basicInteriorTasks'

// 유틸리티 함수 import
export {
  validateWorkingHours,
  filterDIYTasks,
  getWeatherDependentTasks,
  groupTasksByNoiseLevel,
  calculateDryingTime,
  calculateBudgetRange,
  getRequiredContractorTypes,
  findCriticalTasks,
  findTasksByContractor,
  findDependentTasks
} from './utils/taskUtils'

// 프로젝트 서비스 import
export {
  saveProject,
  updateProject,
  getProject,
  getAllProjects,
  deleteProject,
  searchProjects,
  getActiveProjects,
  getProjectStats
} from './services/projectService'

// 작업 템플릿 생성 함수
import { Task, TaskType } from './types'
import { SIZE_MULTIPLIERS } from './constants'

/**
 * 작업 템플릿 생성 함수 (확장)
 */
export function createTask(
  id: string,
  name: string,
  category: TaskType,
  description: string,
  duration: number,
  dependencies: string[] = [],
  contractorId?: string,
  estimatedCost?: number,
  additionalInfo?: Partial<Task>
): Task {
  return {
    id,
    name,
    type: category,
    duration,
    dependencies,
    ...additionalInfo
  } as Task
}

/**
 * 기존 작업 템플릿들 (임시 유지 - 점진적 마이그레이션)
 */
export { residentialFullRemodelTasks } from './taskDatabase'
export { bathroomRemodelTasks } from './taskDatabase'
export { kitchenRemodelTasks } from './taskDatabase'
export { cafeInteriorTasks } from './taskDatabase'

/**
 * 프로젝트 유형별 작업 템플릿 매핑
 */
import { basicInteriorTasks as basicTasks } from './constants/tasks/basicInteriorTasks'

export const taskTemplates = {
  'residential-full': 'residentialFullRemodelTasks', // 임시로 이름만 저장
  'bathroom': 'bathroomRemodelTasks',
  'kitchen': 'kitchenRemodelTasks',
  'cafe': 'cafeInteriorTasks',
  'basic': basicTasks
} as const

/**
 * 작업 기간 조정 함수 (프로젝트 규모에 따라)
 */
export function adjustTaskDuration(tasks: Task[], sizeMultiplier: number = 1): Task[] {
  return tasks.map(task => ({
    ...task,
    duration: Math.ceil(task.duration * sizeMultiplier),
  }))
}

/**
 * 작업 검색 함수
 */
export function findTasksByCategory(tasks: Task[], category: string): Task[] {
  return tasks.filter(task => task.type === category)
}

/**
 * 프로젝트 크기에 따른 승수 계산
 */
export function getProjectSizeMultiplier(area: number): number {
  if (area <= 20) return SIZE_MULTIPLIERS.SMALL
  if (area <= 30) return SIZE_MULTIPLIERS.MEDIUM
  if (area <= 40) return SIZE_MULTIPLIERS.LARGE
  return SIZE_MULTIPLIERS.XLARGE
}

/**
 * 작업 템플릿 가져오기 (임시 - 추후 동적 import로 변경)
 */
export async function getTaskTemplate(templateName: string): Promise<Task[]> {
  // 현재는 basic만 지원
  if (templateName === 'basic') {
    return basicTasks
  }
  
  // TODO: 다른 템플릿들도 모듈화 후 동적 import
  throw new Error(`템플릿을 찾을 수 없습니다: ${templateName}`)
}