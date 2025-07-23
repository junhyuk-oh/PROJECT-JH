'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAllProjects } from '@/lib/taskDatabase'
import MobileHeader from '@/components/mobile/MobileHeader'
import CurrentProjectCard from '@/components/mobile/CurrentProjectCard'
import TodayTasks from '@/components/mobile/TodayTasks'
import QuickActions from '@/components/mobile/QuickActions'
import { BottomNavigation } from '@/components/ui/BottomNavigation'

interface Project {
  id: string
  name: string
  type: string
  startDate: Date
  budget: number
  area: number
  currentState: string
  totalDuration: number
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    loadProjects()
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  const loadProjects = async () => {
    try {
      const allProjects = await getAllProjects()
      setProjects(allProjects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  const getProjectTypeLabel = (type: string) => {
    const labels = {
      residential: '주거공간',
      bathroom: '욕실',
      kitchen: '주방',
      commercial: '상업공간',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getProjectStatus = (project: Project) => {
    const startDate = new Date(project.startDate)
    const today = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + project.totalDuration)

    if (today < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { label: '시작 예정', color: 'text-blue-600', detail: `${daysUntilStart}일 후 시작` }
    } else if (today > endDate) {
      return { label: '완료', color: 'text-gray-600', detail: '프로젝트 완료' }
    } else {
      const progress = Math.round(((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)
      return { label: '진행 중', color: 'text-green-600', detail: `${progress}% 완료` }
    }
  }

  // 현재 진행 중인 프로젝트 찾기
  const currentProject = projects.find(p => {
    const status = getProjectStatus(p)
    return status.label === '진행 중'
  })

  // 프로젝트의 현재 진행률과 남은 일수 계산
  const getProjectProgress = (project: Project) => {
    const startDate = new Date(project.startDate)
    const today = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + project.totalDuration)
    
    const progress = Math.min(100, Math.max(0, Math.round(((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)))
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    
    return { progress, daysRemaining, targetDate: formatDate(endDate) }
  }

  // 오늘의 작업 예시 데이터
  const todayTasks = currentProject ? [
    { id: '1', title: '도배 작업 완료 확인', time: '오전 9:00 - 10:00', status: 'completed' as const, order: 1 },
    { id: '2', title: '바닥재 업체 연락', time: '오후 2:00 - 3:00', status: 'in_progress' as const, order: 2 },
    { id: '3', title: '조명 설치 일정 확인', time: '오후 4:00', status: 'pending' as const, order: 3 }
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-notion-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-blue mx-auto"></div>
          <p className="mt-4 text-notion-text-secondary">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 모바일 뷰
  if (isMobile) {
    return (
      <div className="min-h-screen bg-notion-bg-secondary pb-20">
        <MobileHeader userName="사용자" />
        
        <main className="px-5 py-6 space-y-6">
          {currentProject ? (
            <>
              {/* 현재 프로젝트 카드 */}
              <CurrentProjectCard 
                project={{
                  id: currentProject.id,
                  name: currentProject.name,
                  type: currentProject.type,
                  ...getProjectProgress(currentProject),
                  currentPhase: '3주차 • 진행 중'
                }}
              />

              {/* 오늘 할 일 */}
              <TodayTasks tasks={todayTasks} />

              {/* 빠른 액션 */}
              <QuickActions />
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-notion-sm">
              <div className="w-16 h-16 bg-notion-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-bold text-notion-text mb-2">
                진행 중인 프로젝트가 없습니다
              </h3>
              <p className="text-notion-text-secondary text-notion-sm mb-6">
                첫 인테리어 프로젝트를 시작해보세요
              </p>
              <Link
                href="/create"
                className="inline-flex items-center justify-center px-6 py-3 bg-notion-text text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                새 프로젝트 만들기
              </Link>
            </div>
          )}
        </main>

        {/* 플로팅 액션 버튼 */}
        <Link
          href="/create"
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-notion-yellow to-amber-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 active:scale-95 transition-all z-40"
          style={{
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
          }}
        >
          +
        </Link>

        {/* 하단 네비게이션 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-notion-border">
          <BottomNavigation />
        </div>
      </div>
    )
  }

  // 데스크톱 뷰 (기존 레이아웃 유지)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SELFFIN</h1>
          <p className="text-gray-600">
            AI 기반 인테리어 프로젝트 일정 관리 시스템
          </p>
        </div>

        {/* 새 프로젝트 버튼 */}
        <div className="mb-8">
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 프로젝트 만들기
          </Link>
        </div>

        {/* 프로젝트 목록 */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 프로젝트가 없습니다</h3>
              <p className="text-gray-600 mb-6">첫 번째 인테리어 프로젝트를 만들어보세요</p>
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                프로젝트 만들기
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const status = getProjectStatus(project)
              
              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/schedule-results?projectId=${project.id}`)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {getProjectTypeLabel(project.type)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">상태</span>
                      <span className={`font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">진행률</span>
                      <span className="text-gray-900">{status.detail}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">예산</span>
                      <span className="text-gray-900">{formatBudget(project.budget)}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">면적</span>
                      <span className="text-gray-900">{project.area}평</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">공사 기간</span>
                      <span className="text-gray-900">{project.totalDuration}일</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {formatDate(project.startDate)} 시작
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AI 결과 예시 보기 버튼 */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">AI 분석 결과 예시 보기</h3>
              <p className="text-gray-600">AI가 생성한 일정 최적화와 추천사항을 확인해보세요</p>
            </div>
            <Link
              href="/projects/results"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              예시 보기
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 기능 안내 */}
        {projects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CPM 일정 최적화</h3>
              <p className="text-gray-600 text-sm">
                Critical Path Method를 활용한 최적 공사 일정 자동 생성
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">진행 상황 추적</h3>
              <p className="text-gray-600 text-sm">
                실시간 공사 진행률 확인 및 일정 조정 알림
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">업체 관리</h3>
              <p className="text-gray-600 text-sm">
                각 공정별 전문 업체 배정 및 일정 조율
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}