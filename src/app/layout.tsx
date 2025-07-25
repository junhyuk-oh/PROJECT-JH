import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { BottomNavigation } from '@/components/ui/BottomNavigation'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { QueryProvider } from '@/contexts/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor'
import { LazyPerformanceDebugger } from '@/components/common/LazyComponents'
import './globals.css'

export const metadata: Metadata = {
  title: 'SELFFIN - 반셀프 인테리어 일정 관리',
  description: 'AI 기반 인테리어 공사 일정 자동 생성 및 관리 플랫폼',
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
        <ErrorBoundary>
          <QueryProvider>
            <ProjectProvider>
              <div className="min-h-screen pb-16">
                <Suspense fallback={<LoadingSpinner />}>
                  {children}
                </Suspense>
              </div>
              <BottomNavigation />
            </ProjectProvider>
          </QueryProvider>
          <PerformanceMonitor />
          {process.env.NODE_ENV === 'development' && (
            <>
              <Script src="/performance-debug.js" strategy="afterInteractive" />
              <Suspense fallback={null}>
                <LazyPerformanceDebugger />
              </Suspense>
            </>
          )}
        </ErrorBoundary>
      </body>
    </html>
  )
}