import { Task, Schedule, ScheduledTask, ScheduleOptions } from './types';

// CPM (Critical Path Method) 알고리즘 구현
export class ScheduleGenerator {
  private tasks: Task[];
  private options: ScheduleOptions;
  private taskMap: Map<string, Task>;
  private scheduledTasks: Map<string, ScheduledTask>;

  constructor(tasks: Task[], options: ScheduleOptions) {
    this.tasks = [...tasks]; // 원본 배열 복사
    this.options = options;
    this.taskMap = new Map(tasks.map(task => [task.id, task]));
    this.scheduledTasks = new Map();
  }

  // 메인 스케줄 생성 함수
  generateSchedule(): Schedule {
    // 1. Forward Pass - 최조 착수일/완료일 계산
    this.forwardPass();
    
    // 2. Backward Pass - 최만 착수일/완료일 계산
    this.backwardPass();
    
    // 3. Float 계산 및 임계 경로 식별
    this.calculateFloatAndCriticalPath();
    
    // 4. 실제 날짜 할당
    this.assignActualDates();
    
    // 5. 스케줄 생성
    const scheduledTasksArray = Array.from(this.scheduledTasks.values());
    const criticalPath = this.findCriticalPath();
    const totalDuration = this.calculateTotalDuration();
    const endDate = this.calculateEndDate(this.options.startDate, totalDuration);

    return {
      projectId: '', // 프로젝트 ID는 호출하는 쪽에서 설정
      tasks: scheduledTasksArray,
      criticalPath,
      totalDuration,
      startDate: this.options.startDate,
      endDate,
      createdAt: new Date()
    };
  }

  // Forward Pass: 최조 착수일과 완료일 계산
  private forwardPass(): void {
    const visited = new Set<string>();
    const queue: string[] = [];

    // 선행 작업이 없는 작업들을 큐에 추가
    this.tasks.forEach(task => {
      if (task.dependencies.length === 0) {
        task.earlyStart = 0;
        task.earlyFinish = task.duration;
        queue.push(task.id);
      }
    });

    // 위상 정렬을 사용한 Forward Pass
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      const currentTask = this.taskMap.get(currentId)!;

      // 후행 작업들 처리
      this.tasks.forEach(task => {
        if (task.dependencies.includes(currentId)) {
          const maxEarlyFinish = Math.max(
            ...task.dependencies
              .map(depId => this.taskMap.get(depId)?.earlyFinish || 0)
          );
          
          task.earlyStart = maxEarlyFinish;
          task.earlyFinish = task.earlyStart + task.duration;

          // 모든 선행 작업이 처리되었는지 확인
          const allDependenciesVisited = task.dependencies.every(depId => visited.has(depId));
          if (allDependenciesVisited && !queue.includes(task.id)) {
            queue.push(task.id);
          }
        }
      });
    }
  }

  // Backward Pass: 최만 착수일과 완료일 계산
  private backwardPass(): void {
    const visited = new Set<string>();
    const queue: string[] = [];
    
    // 프로젝트 완료 시간 찾기
    const projectFinish = Math.max(...this.tasks.map(task => task.earlyFinish || 0));

    // 후행 작업이 없는 작업들을 큐에 추가
    this.tasks.forEach(task => {
      const hasSuccessors = this.tasks.some(t => t.dependencies.includes(task.id));
      if (!hasSuccessors) {
        task.lateFinish = projectFinish;
        task.lateStart = task.lateFinish - task.duration;
        queue.push(task.id);
      }
    });

    // 역방향 위상 정렬을 사용한 Backward Pass
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      const currentTask = this.taskMap.get(currentId)!;

      // 선행 작업들 처리
      currentTask.dependencies.forEach(depId => {
        const depTask = this.taskMap.get(depId)!;
        
        // 후행 작업들의 최소 늦은 시작시간 찾기
        const successorTasks = this.tasks.filter(t => t.dependencies.includes(depId));
        const minLateStart = Math.min(
          ...successorTasks.map(t => t.lateStart || projectFinish)
        );
        
        depTask.lateFinish = minLateStart;
        depTask.lateStart = depTask.lateFinish - depTask.duration;

        if (!queue.includes(depId)) {
          queue.push(depId);
        }
      });
    }
  }

  // Float 계산 및 임계 경로 식별
  private calculateFloatAndCriticalPath(): void {
    this.tasks.forEach(task => {
      const totalFloat = (task.lateStart || 0) - (task.earlyStart || 0);
      task.isCritical = totalFloat === 0;
    });
  }

  // 실제 날짜 할당
  private assignActualDates(): void {
    this.tasks.forEach(task => {
      const startDate = this.addWorkingDays(this.options.startDate, task.earlyStart || 0);
      const endDate = this.addWorkingDays(this.options.startDate, (task.earlyFinish || 0) - 1);
      
      // 제약사항 적용
      const adjustedDates = this.applyConstraints(task.id, startDate, endDate);
      
      const scheduledTask: ScheduledTask = {
        ...task,
        startDate: adjustedDates.start,
        endDate: adjustedDates.end,
        status: 'pending' as const
      };
      
      this.scheduledTasks.set(task.id, scheduledTask);
    });
  }

  // 작업일 기준으로 날짜 계산
  private addWorkingDays(startDate: Date, days: number): Date {
    const date = new Date(startDate);
    let addedDays = 0;
    
    while (addedDays < days) {
      date.setDate(date.getDate() + 1);
      
      // 작업 가능일 확인 (주말 제외)
      const dayOfWeek = date.getDay();
      const isWorkDay = dayOfWeek >= 1 && dayOfWeek <= 5; // 월-금
      const isHoliday = this.options.preferences?.holidays?.some(
        holiday => this.isSameDate(holiday, date)
      );
      
      if (isWorkDay && !isHoliday) {
        addedDays++;
      }
    }
    
    return date;
  }

  // 날짜 비교
  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // 제약사항 적용 (단순화)
  private applyConstraints(taskId: string, startDate: Date, endDate: Date): { start: Date, end: Date } {
    // 기본적으로 계산된 날짜를 그대로 반환
    return { start: new Date(startDate), end: new Date(endDate) };
  }

  // 작업일 기준으로 날짜 역산
  private subtractWorkingDays(endDate: Date, days: number): Date {
    const date = new Date(endDate);
    let subtractedDays = 0;
    
    while (subtractedDays < days) {
      date.setDate(date.getDate() - 1);
      
      const dayOfWeek = date.getDay();
      const isWorkDay = dayOfWeek >= 1 && dayOfWeek <= 5; // 월-금
      const isHoliday = this.options.preferences?.holidays?.some(
        holiday => this.isSameDate(holiday, date)
      );
      
      if (isWorkDay && !isHoliday) {
        subtractedDays++;
      }
    }
    
    return date;
  }

  // 임계 경로 찾기
  private findCriticalPath(): string[] {
    const criticalTasks = this.tasks
      .filter(task => task.isCritical)
      .sort((a, b) => (a.earlyStart || 0) - (b.earlyStart || 0));
    
    return criticalTasks.map(task => task.id);
  }

  // 전체 프로젝트 기간 계산
  private calculateTotalDuration(): number {
    return Math.max(...this.tasks.map(task => task.earlyFinish || 0));
  }

  // 종료일 계산
  private calculateEndDate(startDate: Date, duration: number): Date {
    return this.addWorkingDays(startDate, duration - 1);
  }
}

// 헬퍼 함수들

// 기본 스케줄 옵션 생성
export function createDefaultScheduleOptions(projectType: any, area: number, budget: number, startDate: Date): ScheduleOptions {
  return {
    projectType,
    area,
    budget,
    startDate,
    preferences: {
      workingDays: [1, 2, 3, 4, 5], // 월-금
      holidays: [],
      priority: 'quality'
    }
  };
}

// 한국 공휴일 추가
export function addKoreanHolidays(options: ScheduleOptions, year: number): ScheduleOptions {
  const holidays = [
    new Date(year, 0, 1),   // 신정
    new Date(year, 2, 1),   // 삼일절
    new Date(year, 4, 5),   // 어린이날
    new Date(year, 5, 6),   // 현충일
    new Date(year, 7, 15),  // 광복절
    new Date(year, 9, 3),   // 개천절
    new Date(year, 9, 9),   // 한글날
    new Date(year, 11, 25), // 크리스마스
    // 음력 공휴일은 별도 계산 필요
  ];
  
  return {
    ...options,
    preferences: {
      ...options.preferences,
      holidays: [...(options.preferences?.holidays || []), ...holidays]
    }
  };
}

// Gantt 차트용 데이터 변환
export interface GanttData {
  taskId: string;
  taskName: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  isCritical: boolean;
  category: string;
}

export function convertToGanttData(schedule: Schedule): GanttData[] {
  return schedule.tasks.map(task => ({
    taskId: task.id,
    taskName: task.name,
    start: task.startDate,
    end: task.endDate,
    progress: 0,
    dependencies: task.dependencies,
    isCritical: schedule.criticalPath.includes(task.id),
    category: task.type
  }));
}

// 일정 충돌 확인 (단순화)
export function checkScheduleConflicts(schedule: Schedule): string[] {
  return [];
}

// 일정 압축 제안
export function suggestScheduleCompression(schedule: Schedule): { taskId: string; method: string; days: number }[] {
  const suggestions: { taskId: string; method: string; days: number }[] = [];
  
  return [];
}

// 프로젝트 정보를 기반으로 스케줄 생성
export function generateSchedule(projectInfo: {
  projectType: string;
  area: number;
  budget: number;
  startDate: Date;
  currentState: string;
}) {
  // 프로젝트 타입에 따른 템플릿 선택
  let templateKey = '';
  if (projectInfo.projectType === 'residential') {
    templateKey = projectInfo.currentState === 'full' ? 'residential-full' : 'residential-full';
  } else if (projectInfo.projectType === 'bathroom') {
    templateKey = 'bathroom';
  } else if (projectInfo.projectType === 'kitchen') {
    templateKey = 'kitchen';
  } else if (projectInfo.projectType === 'commercial') {
    templateKey = 'cafe';
  }

  // 작업 템플릿 가져오기
  const { taskTemplates, adjustTaskDuration } = require('./taskDatabase');
  const baseTasks = taskTemplates[templateKey] || taskTemplates['residential-full'];
  
  // 면적에 따른 작업 기간 조정
  let sizeMultiplier = 1;
  if (projectInfo.area > 40) {
    sizeMultiplier = 1.3;
  } else if (projectInfo.area > 30) {
    sizeMultiplier = 1.15;
  } else if (projectInfo.area < 20) {
    sizeMultiplier = 0.85;
  }
  
  const adjustedTasks = adjustTaskDuration(baseTasks, sizeMultiplier);
  
  // 스케줄 옵션 생성
  const scheduleOptions = createDefaultScheduleOptions(
    projectInfo.projectType,
    projectInfo.area,
    projectInfo.budget,
    new Date(projectInfo.startDate)
  );
  const optionsWithHolidays = addKoreanHolidays(scheduleOptions, new Date(projectInfo.startDate).getFullYear());
  
  // CPM 스케줄 생성
  const generator = new ScheduleGenerator(adjustedTasks, optionsWithHolidays);
  const schedule = generator.generateSchedule();
  
  // Task 객체에 날짜 정보 추가
  const tasksWithDates = schedule.tasks.map(scheduledTask => ({
    ...scheduledTask,
    startDate: scheduledTask.startDate,
    endDate: scheduledTask.endDate,
    type: scheduledTask.type
  }));
  
  return {
    schedule: tasksWithDates,
    criticalPath: schedule.criticalPath,
    totalDuration: schedule.totalDuration
  };
}