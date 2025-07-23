interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = true,
  className = "" 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  // 진행률에 따른 색상 결정
  const getProgressColor = () => {
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  const getBgColor = () => {
    if (percentage < 30) return 'bg-red-100'
    if (percentage < 70) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">진행률</span>
          <span className="text-sm font-medium text-gray-700">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full h-2 rounded-full overflow-hidden ${getBgColor()}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}