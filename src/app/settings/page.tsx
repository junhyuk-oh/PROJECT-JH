'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">설정</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* 프로필 섹션 */}
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">프로필</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                U
              </div>
              <div>
                <p className="font-medium text-gray-900">사용자</p>
                <p className="text-sm text-gray-500">user@example.com</p>
              </div>
            </div>
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">알림</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">푸시 알림</p>
                <p className="text-sm text-gray-500">중요한 업데이트와 리마인더 받기</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* 앱 설정 */}
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">앱 설정</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">다크 모드</p>
                <p className="text-sm text-gray-500">눈의 피로를 줄이는 어두운 테마</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">자동 저장</p>
                <p className="text-sm text-gray-500">변경사항을 자동으로 저장</p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSave ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSave ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* 정보 섹션 */}
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">정보</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">버전</p>
              <p className="text-gray-500">1.0.0</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">개인정보 처리방침</p>
              <span className="text-gray-400">›</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">이용약관</p>
              <span className="text-gray-400">›</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">오픈소스 라이선스</p>
              <span className="text-gray-400">›</span>
            </div>
          </div>
        </section>

        {/* 로그아웃 버튼 */}
        <button className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-lg hover:bg-red-100 transition-colors">
          로그아웃
        </button>
      </div>
    </div>
  )
}