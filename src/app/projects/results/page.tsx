'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Brain,
  Calendar,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react'
import Link from 'next/link'
import { AIRecommendations } from '@/components/visualizations/AIRecommendations'
import { ScheduleResults } from '@/components/ScheduleResults'

export default function ProjectResultsPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'recommendations'>('schedule')

  // 더미 프로젝트 데이터
  const projectData = {
    name: '스마트 오피스 빌딩 건설',
    budget: 50000000,
    duration: 120,
    teamSize: 25,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-06-30')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/projects" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{projectData.name}</h1>
                <p className="text-sm text-gray-500">AI 일정 분석 결과</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">공유</span>
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">내보내기</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'schedule'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                일정 결과
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'recommendations'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 추천사항
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'schedule' ? (
            <ScheduleResults 
              schedule={{}} 
              projectInfo={projectData}
            />
          ) : (
            <AIRecommendations 
              projectData={projectData}
              scheduleData={{}}
            />
          )}
        </motion.div>
      </div>

      {/* AI 채팅 플로팅 버튼 */}
      <Link
        href="/ai"
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            AI 어시스턴트
          </span>
        </div>
      </Link>
    </div>
  )
}