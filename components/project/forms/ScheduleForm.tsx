"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Home,
  Volume2
} from 'lucide-react';
import { ScheduleInfo, FormStepProps } from '@/lib/types';

const WORK_DAYS = [
  { value: 'mon', label: '월', korean: '월요일' },
  { value: 'tue', label: '화', korean: '화요일' },
  { value: 'wed', label: '수', korean: '수요일' },
  { value: 'thu', label: '목', korean: '목요일' },
  { value: 'fri', label: '금', korean: '금요일' },
  { value: 'sat', label: '토', korean: '토요일' },
  { value: 'sun', label: '일', korean: '일요일' }
] as const;

const NOISE_RESTRICTIONS = [
  { 
    value: 'no_restriction', 
    label: '제한 없음', 
    description: '언제든지 작업 가능',
    icon: '🔨'
  },
  { 
    value: 'weekdays_only', 
    label: '평일만', 
    description: '월~금요일만 작업',
    icon: '📅'
  },
  { 
    value: 'weekends_only', 
    label: '주말만', 
    description: '토~일요일만 작업',
    icon: '🏖️'
  },
  { 
    value: 'time_limited', 
    label: '시간 제한', 
    description: '특정 시간대만 작업',
    icon: '⏰'
  }
] as const;

const URGENCY_LEVELS = [
  { 
    value: 'flexible', 
    label: '여유롭게', 
    description: '품질 중심으로 천천히',
    color: 'text-green-600',
    days: '+7일'
  },
  { 
    value: 'moderate', 
    label: '보통', 
    description: '적절한 속도로 진행',
    color: 'text-blue-600',
    days: '표준'
  },
  { 
    value: 'urgent', 
    label: '급함', 
    description: '최대한 빠르게 완성',
    color: 'text-red-600',
    days: '-5일'
  }
] as const;

export default function ScheduleForm({ onComplete, onBack, initialData }: FormStepProps) {
  const [formData, setFormData] = useState<ScheduleInfo>({
    startDate: initialData?.startDate || new Date(),
    preferredEndDate: initialData?.preferredEndDate,
    workDays: initialData?.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'],
    dailyWorkHours: initialData?.dailyWorkHours || { start: '09:00', end: '18:00' },
    unavailablePeriods: initialData?.unavailablePeriods || [],
    noiseRestrictions: initialData?.noiseRestrictions || 'time_limited',
    residenceStatus: initialData?.residenceStatus || 'live_in',
    urgencyLevel: initialData?.urgencyLevel || 'moderate',
    specialNotes: initialData?.specialNotes || ''
  });

  const [newUnavailablePeriod, setNewUnavailablePeriod] = useState({
    start: '',
    end: '',
    reason: ''
  });

  const updateField = <K extends keyof ScheduleInfo>(
    field: K,
    value: ScheduleInfo[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 작업 요일 토글
  const toggleWorkDay = (day: string) => {
    const currentDays = formData.workDays;
    const newDays = currentDays.includes(day as any)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day as any];
    updateField('workDays', newDays);
  };

  // 사용 불가 기간 추가
  const addUnavailablePeriod = () => {
    if (newUnavailablePeriod.start && newUnavailablePeriod.end && newUnavailablePeriod.reason) {
      const newPeriod = {
        start: new Date(newUnavailablePeriod.start),
        end: new Date(newUnavailablePeriod.end),
        reason: newUnavailablePeriod.reason
      };
      
      updateField('unavailablePeriods', [...formData.unavailablePeriods, newPeriod]);
      setNewUnavailablePeriod({ start: '', end: '', reason: '' });
    }
  };

  // 사용 불가 기간 제거
  const removeUnavailablePeriod = (index: number) => {
    const newPeriods = formData.unavailablePeriods.filter((_, i) => i !== index);
    updateField('unavailablePeriods', newPeriods);
  };

  // 폼 제출
  const handleSubmit = () => {
    // 기본 유효성 검사
    if (formData.workDays.length === 0) {
      alert('최소 하나의 작업 요일을 선택해주세요.');
      return;
    }

    onComplete({ schedule: formData });
  };

  // 총 작업 요일 수 계산
  const workDaysCount = formData.workDays.length;
  const weeklyHours = workDaysCount * 9; // 기본 9시간 작업 기준

  // 시작일로부터 오늘까지의 차이
  const daysDiff = Math.ceil((formData.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          📅 일정 및 작업 조건
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          공사 시작일과 작업 조건을 설정해주세요. 
          정확한 조건일수록 현실적인 공정표가 생성됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 메인 입력 폼 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 시작일 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                공사 시작일
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate">시작 희망일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate.toISOString().split('T')[0]}
                  onChange={(e) => updateField('startDate', new Date(e.target.value))}
                  className="mt-2"
                  min={new Date().toISOString().split('T')[0]}
                />
                {daysDiff < 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    과거 날짜는 선택할 수 없습니다.
                  </p>
                )}
                {daysDiff < 7 && daysDiff >= 0 && (
                  <p className="text-amber-600 text-sm mt-1">
                    일주일 이내 시작은 일정이 타이트할 수 있습니다.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="preferredEndDate">완성 희망일 (선택사항)</Label>
                <Input
                  id="preferredEndDate"
                  type="date"
                  value={formData.preferredEndDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateField('preferredEndDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="mt-2"
                  min={formData.startDate.toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* 작업 요일 및 시간 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                작업 시간
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 작업 요일 */}
              <div>
                <Label className="mb-3 block">작업 가능 요일</Label>
                <div className="grid grid-cols-7 gap-2">
                  {WORK_DAYS.map((day) => (
                    <Button
                      key={day.value}
                      variant={formData.workDays.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleWorkDay(day.value)}
                      className="aspect-square"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  선택된 요일: {formData.workDays.map(day => 
                    WORK_DAYS.find(d => d.value === day)?.korean
                  ).join(', ')} ({workDaysCount}일/주)
                </p>
              </div>

              {/* 작업 시간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">작업 시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.dailyWorkHours.start}
                    onChange={(e) => updateField('dailyWorkHours', {
                      ...formData.dailyWorkHours,
                      start: e.target.value
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">작업 종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.dailyWorkHours.end}
                    onChange={(e) => updateField('dailyWorkHours', {
                      ...formData.dailyWorkHours,
                      end: e.target.value
                    })}
                    className="mt-2"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                주간 예상 작업시간: {weeklyHours}시간
              </p>
            </CardContent>
          </Card>

          {/* 소음 제한 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-purple-600" />
                소음 제한 조건
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NOISE_RESTRICTIONS.map((restriction) => (
                  <div
                    key={restriction.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.noiseRestrictions === restriction.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateField('noiseRestrictions', restriction.value)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{restriction.icon}</span>
                      <div>
                        <div className="font-semibold">{restriction.label}</div>
                        <div className="text-sm text-gray-600">{restriction.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 거주 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-orange-600" />
                거주 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.residenceStatus}
                onValueChange={(value) => updateField('residenceStatus', value as ScheduleInfo['residenceStatus'])}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live_in" id="live_in" />
                  <Label htmlFor="live_in" className="cursor-pointer">
                    거주하면서 공사 (생활 패턴 고려 필요)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="move_out" id="move_out" />
                  <Label htmlFor="move_out" className="cursor-pointer">
                    이사 후 공사 (자유로운 작업 가능)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="temporary_stay" id="temporary_stay" />
                  <Label htmlFor="temporary_stay" className="cursor-pointer">
                    임시 거주 (제한적 작업)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 긴급도 */}
          <Card>
            <CardHeader>
              <CardTitle>긴급도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {URGENCY_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.urgencyLevel === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateField('urgencyLevel', level.value)}
                  >
                    <div className="text-center">
                      <div className={`font-semibold ${level.color} mb-1`}>
                        {level.label}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {level.description}
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {level.days}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 사용 불가 기간 */}
          <Card>
            <CardHeader>
              <CardTitle>사용 불가 기간 (선택사항)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 기존 사용 불가 기간 목록 */}
              {formData.unavailablePeriods.length > 0 && (
                <div className="space-y-2">
                  {formData.unavailablePeriods.map((period, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {period.start.toLocaleDateString()} ~ {period.end.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">{period.reason}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUnavailablePeriod(index)}
                      >
                        제거
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 사용 불가 기간 추가 */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>시작일</Label>
                    <Input
                      type="date"
                      value={newUnavailablePeriod.start}
                      onChange={(e) => setNewUnavailablePeriod(prev => ({
                        ...prev,
                        start: e.target.value
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>종료일</Label>
                    <Input
                      type="date"
                      value={newUnavailablePeriod.end}
                      onChange={(e) => setNewUnavailablePeriod(prev => ({
                        ...prev,
                        end: e.target.value
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>사유</Label>
                  <Input
                    placeholder="예: 가족 행사, 출장, 휴가 등"
                    value={newUnavailablePeriod.reason}
                    onChange={(e) => setNewUnavailablePeriod(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={addUnavailablePeriod}
                  disabled={!newUnavailablePeriod.start || !newUnavailablePeriod.end || !newUnavailablePeriod.reason}
                >
                  기간 추가
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 특별 사항 */}
          <Card>
            <CardHeader>
              <CardTitle>특별 사항</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="예: 이웃과의 약속, 특별한 요청사항, 기타 고려사항 등을 자유롭게 입력해주세요"
                value={formData.specialNotes}
                onChange={(e) => updateField('specialNotes', e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 일정 요약 */}
        <div className="space-y-6">
          {/* 일정 요약 */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">일정 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">시작일</span>
                  <span className="font-semibold">
                    {formData.startDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">작업 요일</span>
                  <span className="font-semibold">{workDaysCount}일/주</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">일일 작업시간</span>
                  <span className="font-semibold">
                    {formData.dailyWorkHours.start} ~ {formData.dailyWorkHours.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주간 작업시간</span>
                  <span className="font-semibold">{weeklyHours}시간</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">긴급도</span>
                  <span className={`font-semibold ${
                    URGENCY_LEVELS.find(l => l.value === formData.urgencyLevel)?.color
                  }`}>
                    {URGENCY_LEVELS.find(l => l.value === formData.urgencyLevel)?.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 조건 체크 */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                조건 체크
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {formData.workDays.length < 3 && (
                  <div className="text-red-600">
                    ⚠️ 작업 요일이 적어 공사 기간이 길어질 수 있습니다
                  </div>
                )}
                {formData.residenceStatus === 'live_in' && (
                  <div className="text-amber-600">
                    💡 거주하면서 공사 시 생활 불편이 있을 수 있습니다
                  </div>
                )}
                {formData.noiseRestrictions !== 'no_restriction' && (
                  <div className="text-blue-600">
                    🔇 소음 제한으로 일부 작업이 지연될 수 있습니다
                  </div>
                )}
                {formData.urgencyLevel === 'urgent' && (
                  <div className="text-red-600">
                    🚀 급한 일정으로 추가 비용이 발생할 수 있습니다
                  </div>
                )}
                {daysDiff < 7 && daysDiff >= 0 && (
                  <div className="text-amber-600">
                    ⏰ 시작일이 임박하여 준비 기간이 부족할 수 있습니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 최종 단계 안내 */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-green-800 font-medium mb-2">준비 완료!</div>
                <div className="text-sm text-green-700">
                  입력하신 모든 정보를 바탕으로 
                  AI가 맞춤형 인테리어 공정표를 생성해드립니다.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          이전 단계
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI 공정표 생성하기
        </Button>
      </div>
    </div>
  );
}