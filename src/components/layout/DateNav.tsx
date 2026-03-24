import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../../stores/useTaskStore'
import { formatDisplayDate, addDays, todayString } from '../../utils/date'
import { DatePicker } from './DatePicker'

export function DateNav() {
  const { selectedDate, setSelectedDate } = useTaskStore()
  const [showPicker, setShowPicker] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isToday = selectedDate === todayString()

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!showPicker) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <button
        onClick={() => setSelectedDate(addDays(selectedDate, -1))}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-overlay transition-colors"
      >
        ‹
      </button>

      {/* 날짜 버튼 — 클릭하면 피커 열림 */}
      <button
        onClick={() => setShowPicker((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-overlay transition-colors"
      >
        <span className="text-sm font-medium text-text">
          {formatDisplayDate(selectedDate)}
        </span>
        {isToday && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">오늘</span>
        )}
      </button>

      <button
        onClick={() => setSelectedDate(addDays(selectedDate, 1))}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-overlay transition-colors"
      >
        ›
      </button>

      {!isToday && (
        <button
          onClick={() => setSelectedDate(todayString())}
          className="text-xs text-muted hover:text-primary transition-colors ml-2 px-1.5 py-0.5 rounded border border-muted/30 hover:border-primary/50"
        >
          오늘로
        </button>
      )}

      {showPicker && <DatePicker onClose={() => setShowPicker(false)} />}
    </div>
  )
}
