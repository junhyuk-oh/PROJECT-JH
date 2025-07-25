import React from 'react'
import { cn } from '@/lib/utils'

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  count: number
  label: string
}

export const FilterButton = React.memo(function FilterButton({ 
  active, 
  onClick, 
  count, 
  label 
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {label} ({count})
    </button>
  )
})