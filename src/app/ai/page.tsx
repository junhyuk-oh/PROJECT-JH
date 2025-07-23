'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Bot, Sparkles, Lock } from 'lucide-react'

export default function AIPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">AI 상담</h1>
          </div>
        </div>
      </div>

      {/* 준비 중 안내 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-6 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            AI 상담 기능 준비 중
          </h2>
          
          <p className="text-gray-600 mb-6">
            더 나은 서비스를 위해 AI 상담 기능을 준비하고 있습니다.
            곧 만나보실 수 있어요!
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">출시 예정 기능</span>
            </div>
            <ul className="text-sm text-blue-600 space-y-1 text-left">
              <li>• 프로젝트 일정 최적화 제안</li>
              <li>• 비용 절감 방법 추천</li>
              <li>• 리스크 분석 및 대응 방안</li>
              <li>• 실시간 질의응답</li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}