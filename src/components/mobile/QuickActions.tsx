'use client'

import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  icon: string
  label: string
  route?: string
  onClick?: () => void
}

export default function QuickActions() {
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      id: 'photo',
      icon: '📸',
      label: '현장 사진',
      onClick: () => alert('현장 사진 촬영 기능 준비 중')
    },
    {
      id: 'contact',
      icon: '📞',
      label: '업체 연락',
      onClick: () => alert('업체 연락처 관리 기능 준비 중')
    },
    {
      id: 'progress',
      icon: '📊',
      label: '진행률 확인',
      route: '/projects/results'
    },
    {
      id: 'budget',
      icon: '💰',
      label: '예산 관리',
      onClick: () => alert('예산 관리 기능 준비 중')
    }
  ]

  const handleActionClick = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route)
    } else if (action.onClick) {
      action.onClick()
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-notion-text mb-4">빠른 실행</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="bg-white rounded-xl p-5 shadow-notion-sm hover:shadow-notion-md transition-all hover:scale-[1.02] active:scale-[0.98] animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-notion-sm font-medium text-notion-text">
                {action.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}