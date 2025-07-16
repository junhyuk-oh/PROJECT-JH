"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Palette, Sparkles } from 'lucide-react';
import { StyleSelection, FormStepProps } from '@/lib/types';

const MAIN_STYLES = [
  { value: 'modern', label: '모던', description: '깔끔하고 세련된', color: 'bg-gray-500', image: '🏢' },
  { value: 'classic', label: '클래식', description: '우아하고 전통적인', color: 'bg-amber-600', image: '🏛️' },
  { value: 'natural', label: '내추럴', description: '자연스럽고 편안한', color: 'bg-green-600', image: '🌿' },
  { value: 'contemporary', label: '컨템포러리', description: '현대적이고 실용적인', color: 'bg-blue-600', image: '🎨' },
  { value: 'scandinavian', label: '스칸디나비안', description: '밝고 미니멀한', color: 'bg-cyan-500', image: '❄️' },
  { value: 'industrial', label: '인더스트리얼', description: '도시적이고 개성있는', color: 'bg-gray-700', image: '🏭' }
] as const;

const COLOR_PREFERENCES = [
  { value: 'bright', label: '밝은 톤', description: '화이트, 아이보리 계열', example: '🤍' },
  { value: 'neutral', label: '중성 톤', description: '베이지, 그레이 계열', example: '🤎' },
  { value: 'dark', label: '어두운 톤', description: '블랙, 차콜 계열', example: '🖤' },
  { value: 'mixed', label: '믹스 톤', description: '다양한 색상 조합', example: '🎨' }
] as const;

const MATERIAL_GRADES = [
  { value: 'budget', label: '실속형', description: '합리적인 가격의 기본 마감재', cost: '저렴' },
  { value: 'standard', label: '표준형', description: '검증된 품질의 일반 마감재', cost: '보통' },
  { value: 'premium', label: '고급형', description: '프리미엄 브랜드 마감재', cost: '비쌈' },
  { value: 'mixed', label: '선택형', description: '포인트별로 다른 등급 사용', cost: '맞춤' }
] as const;

export default function StyleSelectionForm({ onComplete, onBack, initialData }: FormStepProps) {
  const [formData, setFormData] = useState<StyleSelection>({
    mainStyle: initialData?.mainStyle || 'modern',
    colorPreference: initialData?.colorPreference || 'neutral',
    materialGrade: initialData?.materialGrade || 'standard',
    inspiration: initialData?.inspiration || '',
    specialRequirements: initialData?.specialRequirements || ''
  });

  const updateField = <K extends keyof StyleSelection>(
    field: K,
    value: StyleSelection[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onComplete({ style: formData });
  };

  const selectedStyle = MAIN_STYLES.find(style => style.value === formData.mainStyle);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🎨 스타일 및 마감재 선택
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          원하는 인테리어 스타일과 마감재 수준을 선택해주세요.
          선택한 스타일에 맞는 자재와 색상을 추천해드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 스타일 선택 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 메인 스타일 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                메인 스타일
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MAIN_STYLES.map((style) => (
                  <div
                    key={style.value}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.mainStyle === style.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateField('mainStyle', style.value)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{style.image}</div>
                      <div className="font-semibold text-gray-800">{style.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                    </div>
                    {formData.mainStyle === style.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 색상 선호도 */}
          <Card>
            <CardHeader>
              <CardTitle>색상 선호도</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.colorPreference}
                onValueChange={(value) => updateField('colorPreference', value as StyleSelection['colorPreference'])}
                className="grid grid-cols-2 gap-4"
              >
                {COLOR_PREFERENCES.map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={color.value} id={color.value} />
                    <Label 
                      htmlFor={color.value} 
                      className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <span className="text-2xl">{color.example}</span>
                      <div>
                        <div className="font-medium">{color.label}</div>
                        <div className="text-sm text-gray-500">{color.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 마감재 등급 */}
          <Card>
            <CardHeader>
              <CardTitle>마감재 등급</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MATERIAL_GRADES.map((grade) => (
                  <div
                    key={grade.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.materialGrade === grade.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateField('materialGrade', grade.value)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">{grade.label}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        grade.cost === '저렴' ? 'bg-green-100 text-green-700' :
                        grade.cost === '보통' ? 'bg-blue-100 text-blue-700' :
                        grade.cost === '비쌈' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {grade.cost}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{grade.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 영감 및 참고 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                영감 및 참고자료 (선택사항)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inspiration">참고 이미지 URL 또는 설명</Label>
                <Textarea
                  id="inspiration"
                  placeholder="예: 핀터레스트 링크, 인스타그램 게시물 링크, 또는 '깔끔한 화이트 톤의 스칸디나비안 스타일' 등의 설명"
                  value={formData.inspiration}
                  onChange={(e) => updateField('inspiration', e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="specialRequirements">특별 요구사항</Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="예: 반려동물 친화적 소재, 알레르기 고려 자재, 특정 브랜드 선호 등"
                  value={formData.specialRequirements}
                  onChange={(e) => updateField('specialRequirements', e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 스타일 미리보기 */}
        <div className="space-y-6">
          {/* 선택된 스타일 요약 */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">선택된 스타일</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStyle && (
                <div className="text-center">
                  <div className="text-4xl mb-3">{selectedStyle.image}</div>
                  <div className="text-xl font-bold text-purple-800 mb-2">
                    {selectedStyle.label}
                  </div>
                  <div className="text-purple-700 mb-4">
                    {selectedStyle.description}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">색상 톤</span>
                  <span className="font-medium">
                    {COLOR_PREFERENCES.find(c => c.value === formData.colorPreference)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">마감재 등급</span>
                  <span className="font-medium">
                    {MATERIAL_GRADES.find(g => g.value === formData.materialGrade)?.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스타일별 특징 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">스타일 특징</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-2">
                {formData.mainStyle === 'modern' && (
                  <>
                    <div>• 깔끔한 라인과 단순한 형태</div>
                    <div>• 중성색 계열의 색상 팔레트</div>
                    <div>• 유리, 스틸, 콘크리트 소재</div>
                    <div>• 기능성을 중시한 가구</div>
                  </>
                )}
                {formData.mainStyle === 'classic' && (
                  <>
                    <div>• 우아한 곡선과 장식적 요소</div>
                    <div>• 따뜻한 색상과 골드 포인트</div>
                    <div>• 원목, 대리석 등 고급 소재</div>
                    <div>• 전통적인 패턴과 텍스처</div>
                  </>
                )}
                {formData.mainStyle === 'natural' && (
                  <>
                    <div>• 자연 소재의 따뜻한 질감</div>
                    <div>• 어스 톤 색상 팔레트</div>
                    <div>• 원목, 라탄, 리넨 소재</div>
                    <div>• 식물과 자연 요소 활용</div>
                  </>
                )}
                {formData.mainStyle === 'scandinavian' && (
                  <>
                    <div>• 밝고 깔끔한 화이트 베이스</div>
                    <div>• 기능적이면서 아늑한 분위기</div>
                    <div>• 자작나무, 소나무 등 밝은 원목</div>
                    <div>• 심플하고 실용적인 디자인</div>
                  </>
                )}
                {/* 다른 스타일들도 추가 가능 */}
              </div>
            </CardContent>
          </Card>

          {/* 예상 효과 */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">예상 효과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700 space-y-2">
                <div>✨ 선택한 스타일에 맞는 통일감 있는 인테리어</div>
                <div>🎨 조화로운 색상 배치로 세련된 분위기</div>
                <div>💎 선택한 등급에 맞는 품질의 마감재</div>
                <div>🏠 개성있고 만족도 높은 공간 완성</div>
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
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8"
        >
          다음 단계
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}