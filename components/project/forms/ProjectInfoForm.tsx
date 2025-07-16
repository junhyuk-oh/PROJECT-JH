"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Home, 
  Building, 
  Calculator,
  TrendingUp,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { ProjectBasicInfo, FormStepProps } from '@/lib/types';

const HOUSING_TYPES = [
  { value: 'apartment', label: '아파트', icon: Building, description: '공동주택' },
  { value: 'house', label: '단독주택', icon: Home, description: '독립된 주택' },
  { value: 'villa', label: '빌라/연립', icon: Building, description: '저층 공동주택' },
  { value: 'officetel', label: '오피스텔', icon: Building, description: '주거용 오피스텔' }
] as const;

const BUDGET_PRIORITIES = [
  { value: 'economy', label: '경제성 우선', description: '최대한 저렴하게', color: 'text-green-600' },
  { value: 'quality', label: '품질 우선', description: '좋은 자재로', color: 'text-blue-600' },
  { value: 'speed', label: '속도 우선', description: '빠른 완성', color: 'text-purple-600' }
] as const;

export default function ProjectInfoForm({ onComplete, initialData }: FormStepProps) {
  const [formData, setFormData] = useState<ProjectBasicInfo>({
    totalArea: initialData?.totalArea || 84,
    housingType: initialData?.housingType || 'apartment',
    buildingAge: initialData?.buildingAge || undefined,
    residenceStatus: initialData?.residenceStatus || 'occupied',
    totalBudget: initialData?.totalBudget || 5000,
    budgetFlexibility: initialData?.budgetFlexibility || '10_percent',
    budgetPriority: initialData?.budgetPriority || 'quality'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectBasicInfo, string>>>({});

  // 폼 데이터 업데이트
  const updateField = <K extends keyof ProjectBasicInfo>(
    field: K,
    value: ProjectBasicInfo[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectBasicInfo, string>> = {};

    if (formData.totalArea < 10 || formData.totalArea > 200) {
      newErrors.totalArea = '면적은 10평 이상 200평 이하로 입력해주세요.';
    }

    if (formData.totalBudget < 500 || formData.totalBudget > 20000) {
      newErrors.totalBudget = '예산은 500만원 이상 2억원 이하로 입력해주세요.';
    }

    if (formData.buildingAge && (formData.buildingAge < 0 || formData.buildingAge > 50)) {
      newErrors.buildingAge = '건물 연식은 0년 이상 50년 이하로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ basicInfo: formData });
    }
  };

  // 예상 평당 비용 계산
  const estimatedCostPerPyeong = Math.round(formData.totalBudget / formData.totalArea);

  // 프로젝트 복잡도 예상
  const getComplexityLevel = () => {
    const costPerPyeong = estimatedCostPerPyeong;
    if (costPerPyeong < 300) return { level: '간단', color: 'text-green-600', description: '기본적인 인테리어' };
    if (costPerPyeong < 600) return { level: '보통', color: 'text-blue-600', description: '표준 인테리어' };
    return { level: '복잡', color: 'text-purple-600', description: '고급 인테리어' };
  };

  const complexity = getComplexityLevel();

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🏠 프로젝트 기본 정보
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          인테리어 프로젝트의 기본 정보를 입력해주세요. 
          정확한 정보일수록 더 정밀한 공정표가 생성됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 메인 입력 폼 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 면적 입력 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                주거 면적
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="totalArea">전체 면적 (평)</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="totalArea"
                    type="number"
                    value={formData.totalArea}
                    onChange={(e) => updateField('totalArea', Number(e.target.value))}
                    placeholder="84"
                    min="10"
                    max="200"
                    className={errors.totalArea ? 'border-red-500' : ''}
                  />
                  <Slider
                    value={[formData.totalArea]}
                    onValueChange={([value]) => updateField('totalArea', value)}
                    min={10}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>10평</span>
                    <span>{formData.totalArea}평</span>
                    <span>200평</span>
                  </div>
                </div>
                {errors.totalArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalArea}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 주거 형태 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-600" />
                주거 형태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.housingType}
                onValueChange={(value) => updateField('housingType', value as ProjectBasicInfo['housingType'])}
                className="grid grid-cols-2 gap-4"
              >
                {HOUSING_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label 
                        htmlFor={type.value} 
                        className="flex items-center gap-2 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50"
                      >
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 예산 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                예산 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 총 예산 */}
              <div>
                <Label htmlFor="totalBudget">총 예산 (만원)</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="totalBudget"
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => updateField('totalBudget', Number(e.target.value))}
                    placeholder="5000"
                    min="500"
                    max="20000"
                    step="100"
                    className={errors.totalBudget ? 'border-red-500' : ''}
                  />
                  <Slider
                    value={[formData.totalBudget]}
                    onValueChange={([value]) => updateField('totalBudget', value)}
                    min={500}
                    max={20000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>500만원</span>
                    <span>{formData.totalBudget.toLocaleString()}만원</span>
                    <span>2억원</span>
                  </div>
                </div>
                {errors.totalBudget && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalBudget}</p>
                )}
              </div>

              {/* 예산 유연성 */}
              <div>
                <Label>예산 유연성</Label>
                <RadioGroup
                  value={formData.budgetFlexibility}
                  onValueChange={(value) => updateField('budgetFlexibility', value as ProjectBasicInfo['budgetFlexibility'])}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strict" id="strict" />
                    <Label htmlFor="strict" className="cursor-pointer">
                      예산 엄수 (정확히 {formData.totalBudget.toLocaleString()}만원)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10_percent" id="10_percent" />
                    <Label htmlFor="10_percent" className="cursor-pointer">
                      10% 여유 (최대 {Math.round(formData.totalBudget * 1.1).toLocaleString()}만원)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="20_percent" id="20_percent" />
                    <Label htmlFor="20_percent" className="cursor-pointer">
                      20% 여유 (최대 {Math.round(formData.totalBudget * 1.2).toLocaleString()}만원)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 예산 우선순위 */}
              <div>
                <Label>예산 사용 우선순위</Label>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  {BUDGET_PRIORITIES.map((priority) => (
                    <div 
                      key={priority.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.budgetPriority === priority.value 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => updateField('budgetPriority', priority.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${priority.color}`}>{priority.label}</div>
                          <div className="text-sm text-gray-600">{priority.description}</div>
                        </div>
                        <input
                          type="radio"
                          name="budgetPriority"
                          value={priority.value}
                          checked={formData.budgetPriority === priority.value}
                          onChange={() => updateField('budgetPriority', priority.value)}
                          className="h-4 w-4 text-orange-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-600" />
                추가 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 건물 연식 */}
              <div>
                <Label htmlFor="buildingAge">건물 연식 (년, 선택사항)</Label>
                <Input
                  id="buildingAge"
                  type="number"
                  value={formData.buildingAge || ''}
                  onChange={(e) => updateField('buildingAge', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="15"
                  min="0"
                  max="50"
                  className={`mt-2 ${errors.buildingAge ? 'border-red-500' : ''}`}
                />
                {errors.buildingAge && (
                  <p className="text-red-500 text-sm mt-1">{errors.buildingAge}</p>
                )}
              </div>

              {/* 거주 상태 */}
              <div>
                <Label>거주 상태</Label>
                <Select
                  value={formData.residenceStatus}
                  onValueChange={(value) => updateField('residenceStatus', value as ProjectBasicInfo['residenceStatus'])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occupied">거주 중</SelectItem>
                    <SelectItem value="empty">비어있음</SelectItem>
                    <SelectItem value="moving_in">입주 예정</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 요약 및 미리보기 */}
        <div className="space-y-6">
          {/* 프로젝트 요약 */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800">📊 프로젝트 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">전체 면적</span>
                  <span className="font-semibold">{formData.totalArea}평</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 예산</span>
                  <span className="font-semibold">{formData.totalBudget.toLocaleString()}만원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">평당 예산</span>
                  <span className="font-semibold">{estimatedCostPerPyeong.toLocaleString()}만원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예상 복잡도</span>
                  <span className={`font-semibold ${complexity.color}`}>{complexity.level}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-orange-200">
                <div className="text-sm text-orange-700">
                  <div className="font-medium mb-1">{complexity.description}</div>
                  <div>
                    {complexity.level === '간단' && '기본적인 바닥재, 도배 중심의 인테리어'}
                    {complexity.level === '보통' && '타일, 조명, 부분 리모델링 포함'}
                    {complexity.level === '복잡' && '전체 리모델링, 고급 마감재 사용 가능'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 예상 기간 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Clock className="h-5 w-5" />
                예상 소요 기간
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {complexity.level === '간단' ? '2-3주' : 
                   complexity.level === '보통' ? '4-6주' : '6-10주'}
                </div>
                <div className="text-sm text-blue-700">
                  실제 기간은 선택한 작업에 따라 달라집니다
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 다음 단계 안내 */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-green-800 font-medium mb-2">다음 단계</div>
                <div className="text-sm text-green-700">
                  공간별로 어떤 작업을 할지 세세하게 선택해보세요. 
                  선택한 작업에 따라 정확한 일정과 비용이 계산됩니다.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-8"
        >
          다음 단계
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}