"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  DollarSign,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { generateCompleteSchedule, generateAIRecommendations } from '@/lib/scheduleGenerator';
import { GanttChart } from '@/components/visualizations/GanttChart';
import { CalendarView } from '@/components/visualizations/CalendarView';
import { TaskDetails } from '@/components/visualizations/TaskDetails';
import { AIRecommendations } from '@/components/visualizations/AIRecommendations';
import { ProjectData } from '@/lib/types';

interface ScheduleResultsProps {
  project: ProjectData;
  onRestart?: () => void;
}

export default function ScheduleResults({ project, onRestart }: ScheduleResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // 공정표 생성
  const scheduleResult = React.useMemo(() => {
    if (!project.spaces || !project.basicInfo || !project.schedule) {
      return null;
    }
    
    return generateCompleteSchedule(
      project.spaces,
      project.basicInfo,
      project.schedule
    );
  }, [project]);
  
  // AI 추천사항 생성
  const aiRecommendations = React.useMemo(() => {
    if (!scheduleResult || !project.basicInfo) return null;
    
    return generateAIRecommendations(scheduleResult, project.basicInfo);
  }, [scheduleResult, project.basicInfo]);
  
  if (!scheduleResult) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">공정표를 생성하는 데 필요한 정보가 부족합니다.</p>
      </div>
    );
  }
  
  const { tasks, totalDays, totalCost, startDate, endDate, criticalPath, warnings, recommendations } = scheduleResult;
  
  // 간트차트용 데이터 변환
  const ganttTasks = tasks.map(task => ({
    ...task,
    start: task.startDate!.toISOString(),
    end: task.endDate!.toISOString(),
    resources: task.requiredSpecialists,
    cost: task.estimatedCost,
    progress: 0
  }));
  
  // 캘린더용 데이터 변환
  const calendarTasks = tasks.map(task => ({
    ...task,
    start: task.startDate!.toISOString(),
    end: task.endDate!.toISOString(),
    resources: task.requiredSpecialists
  }));
  
  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
          AI 공정표 생성 완료!
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          CPM 알고리즘 기반으로 최적화된 인테리어 공정표가 완성되었습니다.
          <br />
          총 {tasks.length}개의 작업이 {totalDays}일 동안 진행됩니다.
        </p>
      </div>
      
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-sm text-blue-600 mb-1">총 공사 기간</div>
            <div className="text-3xl font-bold text-blue-800">{totalDays}일</div>
            <div className="text-sm text-blue-700 mt-1">
              {format(startDate, 'M/d')} - {format(endDate, 'M/d')}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-sm text-green-600 mb-1">예상 총 비용</div>
            <div className="text-3xl font-bold text-green-800">
              {(totalCost / 10000).toFixed(0)}만원
            </div>
            <div className="text-sm text-green-700 mt-1">
              평당 {((totalCost / project.basicInfo.totalArea) / 10000).toFixed(0)}만원
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <div className="text-sm text-purple-600 mb-1">중요 경로</div>
            <div className="text-3xl font-bold text-purple-800">{criticalPath.length}</div>
            <div className="text-sm text-purple-700 mt-1">개 작업</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <div className="text-sm text-orange-600 mb-1">병렬 작업</div>
            <div className="text-3xl font-bold text-orange-800">
              {tasks.filter(t => !t.isCritical).length}
            </div>
            <div className="text-sm text-orange-700 mt-1">개 가능</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 경고 및 추천사항 */}
      {(warnings.length > 0 || recommendations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warnings.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  주의사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 text-red-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {recommendations.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-5 w-5" />
                  추천사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-blue-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* 상세 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 간트차트</TabsTrigger>
          <TabsTrigger value="calendar">📅 캘린더</TabsTrigger>
          <TabsTrigger value="tasks">📋 작업 목록</TabsTrigger>
          <TabsTrigger value="insights">💡 AI 인사이트</TabsTrigger>
        </TabsList>
        
        {/* 간트차트 탭 */}
        <TabsContent value="overview" className="mt-6">
          <GanttChart 
            tasks={ganttTasks}
            startDate={startDate}
            endDate={endDate}
            onTaskClick={setSelectedTask}
          />
        </TabsContent>
        
        {/* 캘린더 탭 */}
        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            tasks={calendarTasks}
            startDate={startDate}
            endDate={endDate}
            onTaskClick={setSelectedTask}
          />
        </TabsContent>
        
        {/* 작업 목록 탭 */}
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>전체 작업 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{task.name}</h3>
                        <p className="text-sm text-gray-600">{task.space}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.isCritical && (
                          <Badge variant="destructive">중요 경로</Badge>
                        )}
                        <Badge variant="outline">{task.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">기간:</span>
                        <div className="font-medium">{task.duration}일</div>
                      </div>
                      <div>
                        <span className="text-gray-500">비용:</span>
                        <div className="font-medium">{(task.estimatedCost / 10000).toFixed(0)}만원</div>
                      </div>
                      <div>
                        <span className="text-gray-500">시작:</span>
                        <div className="font-medium">
                          {format(task.startDate!, 'M/d', { locale: ko })}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">종료:</span>
                        <div className="font-medium">
                          {format(task.endDate!, 'M/d', { locale: ko })}
                        </div>
                      </div>
                    </div>
                    
                    {task.isDIYPossible && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          DIY 가능
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI 인사이트 탭 */}
        <TabsContent value="insights" className="mt-6">
          {aiRecommendations && (
            <AIRecommendations
              recommendations={aiRecommendations}
              projectInfo={{
                totalCost,
                totalDays,
                diyPotential: tasks.filter(t => t.isDIYPossible).length,
                criticalTasks: criticalPath.length
              }}
            />
          )}
        </TabsContent>
      </Tabs>
      
      {/* 작업 상세 모달 */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          allTasks={tasks}
          onClose={() => setSelectedTask(null)}
        />
      )}
      
      {/* 하단 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
          <Download className="mr-2 h-5 w-5" />
          PDF 다운로드
        </Button>
        
        <Button size="lg" variant="outline">
          <Share2 className="mr-2 h-5 w-5" />
          공유하기
        </Button>
        
        <Button size="lg" variant="outline">
          <Calendar className="mr-2 h-5 w-5" />
          캘린더에 추가
        </Button>
        
        {onRestart && (
          <Button size="lg" variant="outline" onClick={onRestart}>
            <RefreshCw className="mr-2 h-5 w-5" />
            새로운 프로젝트
          </Button>
        )}
      </div>
    </div>
  );
}