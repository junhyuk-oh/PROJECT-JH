'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MobileHeaderProps {
  userName?: string
}

export default function MobileHeader({ userName = '사용자' }: MobileHeaderProps) {
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '좋은 아침이에요'
    if (hour < 18) return '좋은 오후에요'
    return '좋은 저녁이에요'
  }

  return (
    <div className="relative">
      {/* 상태바 영역 */}
      <div className="safe-top bg-notion-bg-secondary" />
      
      {/* 헤더 */}
      <header className="bg-notion-bg-secondary px-5 pb-4">
        <div className="flex items-center justify-between pt-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-notion-text mb-1">
              {getGreeting()}, {userName}님! 👋
            </h1>
            <p className="text-notion-sm text-notion-text-secondary">
              오늘도 멋진 공간을 만들어봐요
            </p>
          </div>
          
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-notion-sm hover:shadow-notion-md transition-all"
          >
            🏠
          </button>
        </div>
      </header>

      {/* 프로필 드롭다운 */}
      {showProfile && (
        <div className="absolute right-5 top-20 w-48 bg-white rounded-lg shadow-notion-md border border-notion-border z-50 animate-slide-down">
          <div className="p-4 border-b border-notion-border">
            <p className="font-medium text-notion-text">{userName}</p>
            <p className="text-notion-sm text-notion-text-secondary">프로젝트 관리자</p>
          </div>
          <div className="p-2">
            <button 
              onClick={() => router.push('/settings')}
              className="w-full text-left px-3 py-2 rounded hover:bg-notion-bg-hover text-notion-sm text-notion-text"
            >
              설정
            </button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-notion-bg-hover text-notion-sm text-notion-text">
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}