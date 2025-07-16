// 프로젝트 관련 타입 정의 (기존 types.ts에서 분리)

// 프로젝트 기본 정보
export interface ProjectBasicInfo {
  totalArea: number;
  housingType: 'apartment' | 'house' | 'villa' | 'officetel';
  buildingAge?: number;
  residenceStatus: 'occupied' | 'empty' | 'moving_in';
  preferredStyle: string;
  projectDuration: string;
  workPriority?: 'quality' | 'speed' | 'minimal_disruption';
}

// 공간별 상세 선택 (핵심!)
export interface SpaceSelection {
  id: string;
  name: string;
  estimatedArea: number; // 자동 계산
  actualArea: number;    // 사용자 수정 가능
  scope: 'full' | 'partial';
  tasks: {
    flooring?: ('laminate' | 'tile' | 'carpet' | 'hardwood')[];
    walls?: ('wallpaper' | 'paint' | 'tile' | 'paneling')[];
    ceiling?: ('wallpaper' | 'paint' | 'molding' | 'lighting')[];
    electrical?: boolean;
    furniture?: boolean;
    // 주방 전용
    sink?: ('full_replace' | 'countertop_only' | 'door_only');
    tiles?: ('wall_tile' | 'floor_tile' | 'both');
    appliances?: ('refrigerator' | 'storage' | 'hood')[];
    // 욕실 전용
    renovation?: ('full' | 'tile_only' | 'fixtures_only' | 'waterproof');
  };
  priority: number; // 1-5
}

// 스타일 선택
export interface StyleSelection {
  mainStyle: 'modern' | 'classic' | 'natural' | 'contemporary' | 'provence' | 'custom';
  subStyle?: {
    modern?: 'minimal' | 'industrial' | 'scandinavian' | 'luxury';
    classic?: 'european' | 'american' | 'vintage' | 'modern_classic';
  };
  colorPreference: 'bright' | 'dark' | 'mixed' | 'any';
  materialGrade: 'premium' | 'standard' | 'budget' | 'mixed';
  specialRequirements?: string;
}

// 일정 정보
export interface ScheduleInfo {
  startDate: Date;
  preferredEndDate?: Date;
  workDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  dailyWorkHours: { start: string; end: string };
  unavailablePeriods: { start: Date; end: Date; reason: string }[];
  noiseRestrictions: 'weekdays_only' | 'weekends_only' | 'time_limited' | 'no_restriction';
  residenceStatus: 'live_in' | 'move_out';
  specialNotes?: string;
}

// 전체 프로젝트 데이터
export interface ProjectData {
  id?: string;
  userId: string;
  basicInfo?: ProjectBasicInfo;
  spaces?: SpaceSelection[];
  style?: StyleSelection;
  schedule?: ScheduleInfo;
  generatedSchedule?: {
    tasks: GeneratedTask[];
    timeline: GanttChartData;
    insights: GanttChartData['insights'];
    totalDuration: number;
    criticalPath: string[];
    generatedAt: Date;
  };
  status: 'draft' | 'analyzing' | 'completed' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
}

// 생성된 작업
export interface GeneratedTask {
  id: string;
  name: string;
  description: string;
  space: string;
  category: 'demolition' | 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'flooring' | 'lighting' | 'cleanup';
  duration: number; // 일 단위
  dependencies: string[];
  isCritical: boolean;
  isMilestone: boolean;
  estimatedCost: number;
  materials: string[];
  skills: string[];
}

// 간트차트 데이터
export interface GanttChartData {
  tasks: Array<{
    id: string;
    name: string;
    start: Date;
    end: Date;
    duration: number;
    progress: number;
    dependencies: string[];
    category: GeneratedTask['category'];
    space: string;
    isCritical: boolean;
    isMilestone: boolean;
    color: string;
    estimatedCost: number;
  }>;
  timeline: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    workingDays: Date[];
    holidays: Date[];
  };
  insights: {
    complexity: number;
    warnings: string[];
    suggestions: string[];
    optimizations: string[];
    budgetImpact: number;
    criticalPath: string[];
  };
}