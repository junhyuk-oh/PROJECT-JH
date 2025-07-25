'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
}

// Web Vitals 임계값 (Google 기준)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

function sendToAnalytics(metric: PerformanceMetric) {
  // 개발 환경에서는 콘솔 로그
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Performance Metric:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      unit: metric.name === 'CLS' ? 'score' : 'ms'
    })
  }

  // 프로덕션에서는 실제 분석 서비스로 전송
  // 예: Google Analytics, Mixpanel, DataDog 등
  if (process.env.NODE_ENV === 'production') {
    // gtag('event', 'web_vitals', {
    //   name: metric.name,
    //   value: Math.round(metric.value),
    //   rating: metric.rating
    // })
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Cumulative Layout Shift (CLS)
    onCLS(metric => {
      sendToAnalytics({
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
      })
    })

    // First Contentful Paint (FCP)
    onFCP(metric => {
      sendToAnalytics({
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
      })
    })

    // First Input Delay는 더 이상 사용되지 않음 (INP로 대체됨)

    // Largest Contentful Paint (LCP)  
    onLCP(metric => {
      sendToAnalytics({
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
      })
    })

    // Time to First Byte (TTFB)
    onTTFB(metric => {
      sendToAnalytics({
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
      })
    })

    // Custom performance markers
    if ('performance' in window) {
      // React hydration time 측정
      const navigationStart = performance.timing?.navigationStart
      if (navigationStart) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const hydrationTime = performance.now()
            sendToAnalytics({
              name: 'Hydration',
              value: hydrationTime,
              rating: hydrationTime < 1000 ? 'good' : hydrationTime < 2000 ? 'needs-improvement' : 'poor'
            })
          }, 0)
        })
      }
    }
  }, [])

  // 이 컴포넌트는 렌더링하지 않음 (모니터링만)
  return null
}

// 개발 환경에서 성능 정보를 보여주는 디버그 컴포넌트
export function PerformanceDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navigation = entry as PerformanceNavigationTiming
          console.log('📊 Navigation Timing:', {
            'DNS Lookup': Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
            'TCP Connect': Math.round(navigation.connectEnd - navigation.connectStart),
            'Server Response': Math.round(navigation.responseEnd - navigation.requestStart),
            'DOM Processing': Math.round(navigation.domComplete - navigation.responseEnd),
            'Total Load Time': Math.round(navigation.loadEventEnd - navigation.fetchStart)
          })
        }
      })
    })

    try {
      performanceObserver.observe({ entryTypes: ['navigation'] })
    } catch (e) {
      console.warn('Performance Observer not supported')
    }

    return () => performanceObserver.disconnect()
  }, [])

  return null
}