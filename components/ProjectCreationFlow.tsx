"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useProjectStepper } from '@/hooks/useFirestore';
import { ProjectData, GeneratedSchedule } from '@/lib/types';
import SpaceSelectionForm from '@/components/forms/SpaceSelectionForm';

// 프로젝트 생성 플로우의 단계별 컴포넌트들
import ProjectInfoForm from '@/components/forms/ProjectInfoForm';
import StyleSelectionForm from '@/components/forms/StyleSelectionForm';
import ScheduleForm from '@/components/forms/ScheduleForm';
import ScheduleResults from '@/components/ScheduleResults';

interface StepConfig {
  title: string;
  description: string;
  icon: string;
}

const STEPS: StepConfig[] = [
  {
    title: '프로젝트 기본 정보',
    description: '면적, 주거형태, 예산 등 기본 정보를 입력해주세요',
    icon: '🏠'
  },
  {
    title: '공간별 상세 선택',
    description: '인테리어할 공간과 작업을 세세하게 선택해주세요',
    icon: '🔨'
  },
  {
    title: '스타일 및 마감재',
    description: '원하는 인테리어 스타일과 마감재를 선택해주세요',
    icon: '🎨'
  },
  {
    title: '일정 및 조건',
    description: '공사 시작일, 작업 조건 등을 설정해주세요',
    icon: '📅'
  }
];

interface ProjectCreationFlowProps {
  onComplete?: (projectId: string) => void;
  initialData?: Partial<ProjectData>;
}

export default function ProjectCreationFlow({ 
  onComplete,
  initialData 
}: ProjectCreationFlowProps) {
  const { user, isAuthenticated } = useAuth();
  const { currentProject, projectId, updateStep, resetProject } = useProjectStepper(user?.uid || '');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Firebase 로딩 중이거나 사용자 인증 확인
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔥 Firebase 연동 데모</h2>
            <p className="text-gray-600 mb-6">
              실제 Firebase 설정 없이도 데모를 체험할 수 있습니다.
              <br />
              임시 사용자로 진행하거나 Firebase 설정 후 로그인하세요.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => {
                  // 임시 사용자 ID로 진행
                  window.location.reload();
                }}
              >
                데모로 체험하기
              </Button>
              <p className="text-sm text-gray-500">
                * 실제 데이터는 저장되지 않습니다
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 단계 완료 처리
  const handleStepComplete = async (stepData: any) => {
    try {
      console.log(`Step ${currentStep} completed with data:`, stepData);
      
      // Firebase에 데이터 저장
      const savedProjectId = await updateStep(stepData);
      
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // 마지막 단계 완료 - 공정표 생성 시작
        setIsGenerating(true);
        
        // 여기서 Cloud Function 호출하여 공정표 생성
        // 현재는 시뮬레이션을 위해 setTimeout 사용
        setTimeout(() => {
          setIsGenerating(false);
          setGeneratedSchedule({
            id: 'schedule-' + savedProjectId,
            projectId: savedProjectId,
            tasks: [], // 실제로는 생성된 작업 목록
            insights: {
              complexity: 7,
              totalDuration: 28,
              criticalPath: [],
              budgetBreakdown: {
                materials: 0,
                labor: 0,
                contingency: 0,
                total: 0
              },
              warnings: [],
              suggestions: [],
              optimizations: [],
              riskFactors: []
            },
            ganttData: {
              tasks: [],
              timeline: {
                startDate: new Date(),
                endDate: new Date(),
                totalDays: 28,
                workingDays: [],
                holidays: [],
                milestones: []
              }
            },
            generatedAt: new Date(),
            version: 1,
            aiModel: 'claude-opus-4'
          });
        }, 3000);

        if (onComplete && savedProjectId) {
          onComplete(savedProjectId);
        }
      }
    } catch (error) {
      console.error('단계 완료 처리 중 오류:', error);
      alert('데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 이전 단계로 이동
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 프로젝트 초기화
  const handleRestart = () => {
    resetProject();
    setCurrentStep(1);
    setGeneratedSchedule(null);
    setIsGenerating(false);
  };

  // 진행률 계산
  const progress = (currentStep / 4) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
          🏠 AI 인테리어 공정표 생성기
        </h1>
        <p className="text-xl text-gray-600">
          4단계 간편 입력으로 맞춤형 인테리어 공정표를 만들어보세요
        </p>
      </div>

      {/* 진행 상태 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentStep <= 4 ? STEPS[currentStep - 1].title : '🎉 공정표 생성 완료'}
            </h2>
            <span className="text-sm text-gray-500">
              {currentStep <= 4 ? `${currentStep}/4 단계` : '완료'}
            </span>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step, index) => (
              <div 
                key={index}
                className={`text-center p-3 rounded-lg transition-colors ${
                  index + 1 === currentStep 
                    ? 'bg-orange-100 border border-orange-300' 
                    : index + 1 < currentStep 
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-sm font-medium text-gray-800">{step.title}</div>
                <div className="text-xs text-gray-600 mt-1">{step.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 단계별 폼 렌더링 */}
      <div className="min-h-[600px]">
        {currentStep === 1 && (
          <ProjectInfoForm 
            onComplete={handleStepComplete}
            initialData={currentProject.basicInfo}
          />
        )}
        
        {currentStep === 2 && (
          <SpaceSelectionForm
            onComplete={handleStepComplete}
            onBack={handleBackStep}
            initialData={{ spaces: currentProject.spaces }}
            totalArea={currentProject.basicInfo?.totalArea || 84}
            housingType={currentProject.basicInfo?.housingType || 'apartment'}
          />
        )}
        
        {currentStep === 3 && (
          <StyleSelectionForm
            onComplete={handleStepComplete}
            onBack={handleBackStep}
            initialData={currentProject.style}
          />
        )}
        
        {currentStep === 4 && (
          <ScheduleForm
            onComplete={handleStepComplete}
            onBack={handleBackStep}
            initialData={currentProject.schedule}
          />
        )}

        {/* 공정표 생성 중 */}
        {isGenerating && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🤖 AI가 맞춤형 공정표를 생성하고 있습니다...
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              입력하신 정보를 바탕으로 최적화된 인테리어 공정표를 만들고 있어요. 
              잠시만 기다려주세요!
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div>✅ 공간별 작업 분석 완료</div>
              <div>🔄 작업 순서 최적화 중...</div>
              <div>📊 일정 및 비용 계산 중...</div>
            </div>
          </div>
        )}

        {/* 생성된 공정표 표시 */}
        {generatedSchedule && (
          <ScheduleResults 
            schedule={generatedSchedule}
            project={currentProject}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* 하단 도움말 */}
      {currentStep <= 4 && !isGenerating && !generatedSchedule && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">도움말</h3>
                <div className="text-blue-700 space-y-2 text-sm">
                  {currentStep === 1 && (
                    <>
                      <p>• 정확한 면적과 예산을 입력하면 더 정밀한 공정표가 생성됩니다.</p>
                      <p>• 예산 유연성을 설정하면 비용 최적화 제안을 받을 수 있습니다.</p>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <p>• 각 공간별로 필요한 작업만 선택하여 비용을 절약할 수 있습니다.</p>
                      <p>• 실제 면적을 정확히 입력하면 자재 계산이 더 정확해집니다.</p>
                      <p>• 특별 요구사항을 상세히 입력하면 맞춤형 제안을 받을 수 있습니다.</p>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <p>• 스타일 선택은 자재 추천과 디자인 제안에 영향을 줍니다.</p>
                      <p>• 마감재 등급에 따라 전체 비용이 크게 달라질 수 있습니다.</p>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <p>• 정확한 시작일을 입력하면 실제 일정 관리에 도움이 됩니다.</p>
                      <p>• 작업 제한 조건을 설정하면 현실적인 공정표가 생성됩니다.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 디버그 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-600">
              <div><strong>현재 단계:</strong> {currentStep}</div>
              <div><strong>프로젝트 ID:</strong> {projectId || '미생성'}</div>
              <div><strong>사용자 ID:</strong> {user?.uid}</div>
              <div><strong>저장된 데이터:</strong></div>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(currentProject, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}