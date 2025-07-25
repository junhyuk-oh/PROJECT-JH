'use client'

import { SimulationResult } from '@/lib/monteCarloSimulator'

interface SimpleHistogramProps {
  simulationResult: SimulationResult
}

export function SimpleHistogram({ simulationResult }: SimpleHistogramProps) {
  const { histogram, minDuration, maxDuration, p10, p50, p90, mean, stdDev, confidence } = simulationResult
  const maxValue = Math.max(...histogram)
  const binCount = histogram.length
  const binWidth = (maxDuration - minDuration) / binCount

  // Calculate which bins contain P10, P50, P90
  const getBarColor = (index: number): string => {
    const binStart = minDuration + index * binWidth
    const binEnd = binStart + binWidth
    
    if (binEnd <= p10) return 'bg-green-400' // Optimistic
    if (binStart >= p90) return 'bg-red-400' // Pessimistic
    if (binStart <= p50 && binEnd >= p50) return 'bg-yellow-400' // Median
    return 'bg-blue-400' // Normal
  }

  const getPercentilePosition = (value: number): number => {
    return ((value - minDuration) / (maxDuration - minDuration)) * 100
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        프로젝트 완료 기간 확률 분포
      </h3>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 w-12 flex flex-col justify-between text-xs text-gray-600 text-right pr-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-14 mr-4">
          <div className="relative h-48 border-l-2 border-b-2 border-gray-400">
            {/* Bars */}
            <div className="absolute inset-0 flex items-end">
              {histogram.map((count, index) => (
                <div
                  key={index}
                  className="flex-1 px-0.5"
                  style={{ height: '100%' }}
                >
                  <div
                    className={`w-full ${getBarColor(index)} rounded-t transition-all hover:opacity-80`}
                    style={{ 
                      height: `${(count / maxValue) * 100}%`,
                      minHeight: count > 0 ? '2px' : '0'
                    }}
                    title={`${Math.round(minDuration + index * binWidth)}-${Math.round(minDuration + (index + 1) * binWidth)}일: ${count}회`}
                  />
                </div>
              ))}
            </div>

            {/* Percentile Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {/* P10 Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                style={{ left: `${getPercentilePosition(p10)}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-green-600 whitespace-nowrap">
                  P10 ({p10}일)
                </span>
              </div>

              {/* P50 Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-600"
                style={{ left: `${getPercentilePosition(p50)}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-yellow-600 whitespace-nowrap">
                  P50 ({p50}일)
                </span>
              </div>

              {/* P90 Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-600"
                style={{ left: `${getPercentilePosition(p90)}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-red-600 whitespace-nowrap">
                  P90 ({p90}일)
                </span>
              </div>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{minDuration}일</span>
            <span>{Math.round((minDuration + maxDuration) / 2)}일</span>
            <span>{maxDuration}일</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>낙관적 (P10 이하)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span>일반 범위</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>중앙값 (P50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span>비관적 (P90 이상)</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">평균</p>
          <p className="font-semibold text-gray-900">{mean}일</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">표준편차</p>
          <p className="font-semibold text-gray-900">±{stdDev}일</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">범위</p>
          <p className="font-semibold text-gray-900">{minDuration}-{maxDuration}일</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">신뢰도</p>
          <p className="font-semibold text-gray-900">{confidence}%</p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 해석</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• 10% 확률로 <strong>{p10}일</strong> 이내에 완료 가능 (매우 순조로운 경우)</li>
          <li>• 50% 확률로 <strong>{p50}일</strong> 이내에 완료 가능 (현실적인 예상)</li>
          <li>• 90% 확률로 <strong>{p90}일</strong> 이내에 완료 가능 (여유있는 계획)</li>
          <li>• 평균 {mean}일, 표준편차 ±{stdDev}일로 {confidence}% 신뢰도</li>
        </ul>
      </div>
    </div>
  )
}