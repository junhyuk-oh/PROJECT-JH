"use client"

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Task, TaskStatus } from '@/lib/types'

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 확장된 Task 타입 (업체 정보 등 추가)
export interface ExtendedTask extends Task {
  progress?: number
  status: TaskStatus
  vendor?: {
    name: string
    contact: string
    phone: string
    rating: number
  }
  notes?: string
  warnings?: string[]
}

interface TaskDetailsProps {
  task: ExtendedTask | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (task: ExtendedTask) => void
}

const categoryNames: Record<string, string> = {
  demolition: '철거',
  plumbing: '배관',
  electrical: '전기',
  flooring: '바닥',
  painting: '도색',
  tiling: '타일',
  tile: '타일',
  carpentry: '목공',
  wallpaper: '도배',
  lighting: '조명',
  cleaning: '청소',
  inspection: '검수',
  other: '기타',
  preparation: '준비',
  protection: '보호',
  waterproofing: '방수',
  wall: '벽',
  ceiling: '천장',
  furniture: '가구',
  appliance: '가전',
  window: '창호'
}

const statusNames: Record<TaskStatus, string> = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
  delayed: '지연',
  cancelled: '취소'
}

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500'
}

export function TaskDetails({ task, isOpen, onClose, onUpdate }: TaskDetailsProps) {
  const [editMode, setEditMode] = useState(false)
  const [progress, setProgress] = useState(task?.progress || 0)
  const [notes, setNotes] = useState(task?.notes || '')

  if (!task) return null

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...task,
        progress,
        notes,
        status: progress === 100 ? 'completed' : task.status
      })
    }
    setEditMode(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="작업 상세">
      <div className="p-6 space-y-6">
        {/* 작업 기본 정보 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{task.name}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">카테고리</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                {categoryNames[task.type]}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">상태</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                {statusNames[task.status]}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">예정일</p>
            <p className="text-gray-900">{task.startDate ? formatDate(task.startDate) : 'TBD'}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-1">설명</p>
            <p className="text-gray-700">{task.name} 작업</p>
          </div>
        </div>

        {/* 진행률 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">진행률</h4>
            {editMode && (
              <span className="text-sm text-gray-500">{progress}%</span>
            )}
          </div>
          {editMode ? (
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    progress < 30 ? '#ef4444' : progress < 70 ? '#eab308' : '#22c55e'
                  } ${progress}%, #e5e7eb ${progress}%)`
                }}
              />
              <ProgressBar value={progress} showLabel={false} />
            </div>
          ) : (
            <ProgressBar value={progress} />
          )}
        </div>

        {/* 업체 정보 */}
        {task.vendor && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">업체 정보</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">업체명</span>
                <span className="text-sm font-medium text-gray-900">{task.vendor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">연락처</span>
                <a 
                  href={`tel:${task.vendor?.contact}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {task.vendor?.contact}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">평점</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < (task.vendor?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">({task.vendor?.rating || 0}.0)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메모 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">메모</h4>
          {editMode ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {notes || <span className="text-gray-400">메모가 없습니다.</span>}
            </p>
          )}
        </div>

        {/* 주의사항 */}
        {task.warnings && task.warnings.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ 주의사항</h4>
            <ul className="list-disc list-inside space-y-1">
              {task.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 min-h-[44px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 min-h-[44px] text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 min-h-[44px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                닫기
              </button>
              {onUpdate && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 min-h-[44px] text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  수정
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}