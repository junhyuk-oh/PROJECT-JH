"use client"

import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Lightbulb,
  Volume2,
  Wind,
  Hammer,
  CheckCircle,
  XCircle,
  Cloud
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskDetailsProps {
  task: {
    id: string;
    name: string;
    start: string;
    end: string;
    duration: number;
    dependencies: string[];
    isCritical: boolean;
    category: string;
    space: string;
    estimatedCost: number;
    warnings?: string[];
    tips?: string[];
    requiredSpecialists?: string[];
    isDIYPossible?: boolean;
    noiseLevel?: string;
    dustLevel?: string;
    weatherSensitive?: boolean;
    progress?: number;
  };
  allTasks?: Array<{ id: string; name: string }>;
  onClose: () => void;
}

const categoryNames: Record<string, string> = {
  demolition: '철거',
  plumbing: '배관',
  electrical: '전기',
  waterproofing: '방수',
  tiling: '타일',
  carpentry: '목공',
  painting: '도장',
  installation: '설치',
  cleaning: '청소'
};

const noiseLevelNames: Record<string, { name: string; color: string }> = {
  high: { name: '높음', color: 'text-red-500' },
  medium: { name: '보통', color: 'text-yellow-500' },
  low: { name: '낮음', color: 'text-green-500' },
  none: { name: '없음', color: 'text-gray-500' }
};

const dustLevelNames: Record<string, { name: string; color: string }> = {
  high: { name: '많음', color: 'text-red-500' },
  medium: { name: '보통', color: 'text-yellow-500' },
  low: { name: '적음', color: 'text-green-500' },
  none: { name: '없음', color: 'text-gray-500' }
};

export function TaskDetails({ task, allTasks = [], onClose }: TaskDetailsProps) {
  const startDate = new Date(task.start);
  const endDate = new Date(task.end);
  const remainingDays = differenceInDays(endDate, new Date());
  
  // 의존 작업 정보 가져오기
  const dependencyTasks = task.dependencies.map(depId => 
    allTasks.find(t => t.id === depId)
  ).filter(Boolean);
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{task.name}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  {categoryNames[task.category]}
                </span>
                {task.isCritical && (
                  <span className="bg-red-500 px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    중요 경로
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* 본문 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* 진행 상태 */}
          {task.progress !== undefined && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">진행률</span>
                <span className="text-sm text-gray-600">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">시작일</div>
                  <div className="font-medium">
                    {format(startDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">종료일</div>
                  <div className="font-medium">
                    {format(endDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">소요 기간</div>
                  <div className="font-medium">{task.duration}일</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">예상 비용</div>
                  <div className="font-medium">
                    {task.estimatedCost.toLocaleString()}원
                  </div>
                </div>
              </div>
              
              {task.requiredSpecialists && task.requiredSpecialists.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">필요 전문가</div>
                    <div className="font-medium">
                      {task.requiredSpecialists.join(', ')}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Hammer className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">DIY 가능 여부</div>
                  <div className="font-medium flex items-center gap-1">
                    {task.isDIYPossible ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">가능</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">불가능</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 작업 특성 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">작업 특성</h3>
            <div className="grid grid-cols-3 gap-4">
              {task.noiseLevel && (
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">소음 수준</div>
                    <div className={`font-medium ${noiseLevelNames[task.noiseLevel].color}`}>
                      {noiseLevelNames[task.noiseLevel].name}
                    </div>
                  </div>
                </div>
              )}
              
              {task.dustLevel && (
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">분진 수준</div>
                    <div className={`font-medium ${dustLevelNames[task.dustLevel].color}`}>
                      {dustLevelNames[task.dustLevel].name}
                    </div>
                  </div>
                </div>
              )}
              
              {task.weatherSensitive !== undefined && (
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">날씨 민감도</div>
                    <div className={`font-medium ${task.weatherSensitive ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {task.weatherSensitive ? '민감함' : '무관'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 선행 작업 */}
          {dependencyTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                선행 작업
              </h3>
              <div className="space-y-2">
                {dependencyTasks.map((dep: any) => (
                  <div key={dep.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-sm">{dep.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 주의사항 */}
          {task.warnings && task.warnings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                주의사항
              </h3>
              <div className="space-y-2">
                {task.warnings.map((warning, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 작업 팁 */}
          {task.tips && task.tips.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-green-600">
                <Lightbulb className="w-5 h-5" />
                작업 팁
              </h3>
              <div className="space-y-2">
                {task.tips.map((tip, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 하단 정보 */}
          <div className="mt-6 pt-4 border-t text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>작업 ID: {task.id}</span>
              {remainingDays > 0 && (
                <span>
                  시작까지 <span className="font-medium text-gray-700">{remainingDays}일</span> 남음
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}