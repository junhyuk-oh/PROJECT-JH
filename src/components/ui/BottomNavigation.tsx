'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarIcon, GanttIcon, AIIcon, SettingsIcon } from '@/components/icons'
import { Home, FolderOpen, Calendar, Settings } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.FC<{ className?: string; size?: number }>
}

const navItems: NavItem[] = [
  {
    label: '홈',
    href: '/',
    icon: ({ className }: { className?: string }) => <Home className={className} />,
  },
  {
    label: '프로젝트',
    href: '/projects',
    icon: ({ className }: { className?: string }) => <FolderOpen className={className} />,
  },
  {
    label: '일정',
    href: '/schedule',
    icon: ({ className }: { className?: string }) => <Calendar className={className} />,
  },
  {
    label: '설정',
    href: '/settings',
    icon: ({ className }: { className?: string }) => <Settings className={className} />,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      {/* iOS 안전 영역을 위한 패딩 */}
      <div className="flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 min-h-[48px] py-2 px-3 transition-colors"
            >
              <Icon
                size={24}
                className={`mb-1 transition-colors ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}