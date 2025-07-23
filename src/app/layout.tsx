import type { Metadata } from 'next'
import { BottomNavigation } from '@/components/ui/BottomNavigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'SELFFIN - 개인 재무 관리 시스템',
  description: '나만의 재무 목표를 설정하고 달성하세요',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="bg-notion-bg text-notion-text font-sans antialiased">
        <div className="min-h-screen pb-16">
          {children}
        </div>
        <BottomNavigation />
      </body>
    </html>
  )
}