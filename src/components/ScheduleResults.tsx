"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Users,
  AlertTriangle,
  Download,
  Share,
  ChevronRight,
  Layers
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  duration: number
  cost: number
  assignedTo: string[]
  isCritical: boolean
  progress: number
  dependencies: string[]
}

interface ScheduleResultsProps {
  schedule?: any
  projectInfo?: any
}

export function ScheduleResults({ schedule, projectInfo }: ScheduleResultsProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'calendar' | 'gantt'>('summary')
  
  // 더미 데이터
  const tasks: Task[] = [
    {
      id: '1',
      name: '기초 공사',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-15'),
      duration: 14,
      cost: 5000000,
      assignedTo: ['시공팀 A'],
      isCritical: true,
      progress: 100,
      dependencies: []
    },
    {
      id: '2',
      name: '골조 공사',
      startDate: new Date('2024-03-16'),
      endDate: new Date('2024-04-10'),
      duration: 25,
      cost: 12000000,
      assignedTo: ['시공팀 B', '시공팀 C'],
      isCritical: true,
      progress: 75,
      dependencies: ['1']
    },
    {
      id: '3',
      name: '설비 공사',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-20'),
      duration: 20,
      cost: 8000000,
      assignedTo: ['설비팀'],
      isCritical: false,
      progress: 50,
      dependencies: ['2']
    },
    {
      id: '4',
      name: '마감 공사',
      startDate: new Date('2024-04-21'),
      endDate: new Date('2024-05-15'),
      duration: 24,
      cost: 10000000,
      assignedTo: ['마감팀'],
      isCritical: true,
      progress: 0,
      dependencies: ['3']
    }
  ]

  const totalDuration = 75
  const totalCost = 35000000
  const criticalTasks = tasks.filter(t => t.isCritical)
  const completedTasks = tasks.filter(t => t.progress === 100)
  const overallProgress = Math.round(
    tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
  )

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">일정 생성 완료</h2>
            <p className="text-gray-600 mt-1">
              AI가 최적화한 프로젝트 일정이 생성되었습니다
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-sm font-bold text-gray-900">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="전체 공기"
          value={`${totalDuration}일`}
          color="bg-blue-500"
        />
        <StatCard
          icon={DollarSign}
          label="총 예산"
          value={`${(totalCost / 10000).toLocaleString()}만원`}
          color="bg-green-500"
        />
        <StatCard
          icon={Layers}
          label="총 작업 수"
          value={`${tasks.length}개`}
          color="bg-purple-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="임계 경로"
          value={`${criticalTasks.length}개`}
          color="bg-red-500"
        />
      </div>

      {/* 뷰 모드 탭 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === 'summary'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            요약 보기
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === 'calendar'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            캘린더 보기
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === 'gantt'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            간트차트 보기
          </button>
        </div>

        {/* 요약 보기 */}
        {viewMode === 'summary' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">주요 작업 일정</h3>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  task.isCritical 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{task.name}</h4>
                      {task.isCritical && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          임계 경로
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(task.startDate, 'M월 d일', { locale: ko })} - 
                        {format(task.endDate, 'M월 d일', { locale: ko })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.duration}일
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {(task.cost / 10000).toLocaleString()}만원
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {task.assignedTo.map((team, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {task.progress}%
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 캘린더 보기 (플레이스홀더) */}
        {viewMode === 'calendar' && (
          <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">캘린더 뷰가 여기에 표시됩니다</p>
            </div>
          </div>
        )}

        {/* 간트차트 보기 (플레이스홀더) */}
        {viewMode === 'gantt' && (
          <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">간트차트가 여기에 표시됩니다</p>
            </div>
          </div>
        )}
      </div>

      {/* 다음 단계 안내 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">다음 단계</h3>
        <div className="grid gap-3">
          <button className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">팀원에게 일정 공유</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">캘린더와 동기화</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">상세 분석 보고서 생성</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}