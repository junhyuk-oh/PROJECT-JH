/**
 * 코드 스플리팅을 위한 Lazy 컴포넌트들
 * 큰 컴포넌트들을 동적으로 로딩하여 초기 번들 사이즈 최적화
 */

import { lazy } from 'react'

// 무거운 시각화 컴포넌트들을 lazy loading으로 처리
export const LazyGanttChart = lazy(() => 
  import('@/components/visualizations/GanttChart').then(module => ({
    default: module.GanttChart
  }))
)

export const LazyNotionCalendar = lazy(() =>
  import('@/components/visualizations/NotionCalendar').then(module => ({
    default: module.NotionCalendar
  }))
)

export const LazyCalendarView = lazy(() =>
  import('@/components/visualizations/CalendarView').then(module => ({
    default: module.CalendarView
  }))
)

export const LazyWhatIfAnalysis = lazy(() =>
  import('@/components/WhatIfAnalysis').then(module => ({
    default: module.WhatIfAnalysis
  }))
)

export const LazySimpleHistogram = lazy(() =>
  import('@/components/charts/SimpleHistogram').then(module => ({
    default: module.SimpleHistogram
  }))
)

// React Query Devtools도 lazy loading
export const LazyReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then(module => ({
    default: module.ReactQueryDevtools
  }))
)

// 성능 디버거는 개발 환경에서만 로딩
export const LazyPerformanceDebugger = lazy(() =>
  import('@/components/common/PerformanceMonitor').then(module => ({
    default: module.PerformanceDebugger
  }))
)