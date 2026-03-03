import { useState } from 'react'
import { useTaskStore } from '../../stores/useTaskStore'
import { toDateString, todayString, getDaysInMonth, getMonthStartDay } from '../../utils/date'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
  onClose: () => void
}

export function DatePicker({ onClose }: Props) {
  const { selectedDate, setSelectedDate } = useTaskStore()
  const today = todayString()

  const initial = new Date(selectedDate + 'T00:00:00')
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const days = getDaysInMonth(viewYear, viewMonth)
  const startDay = getMonthStartDay(viewYear, viewMonth) // 0=일

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(date: Date) {
    setSelectedDate(toDateString(date))
    onClose()
  }

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-surface border border-overlay rounded-xl shadow-2xl p-3 w-64">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center text-muted hover:text-text transition-colors rounded">
          ‹
        </button>
        <span className="text-sm font-medium text-text">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center text-muted hover:text-text transition-colors rounded">
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`text-[10px] text-center py-1 ${i === 0 ? 'text-red/70' : i === 6 ? 'text-blue/70' : 'text-muted'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* 앞 빈 칸 */}
        {Array.from({ length: startDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* 날짜 */}
        {days.map((date) => {
          const dateStr = toDateString(date)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const dayOfWeek = date.getDay()

          return (
            <button
              key={dateStr}
              onClick={() => selectDay(date)}
              className={`text-xs h-7 w-7 mx-auto rounded-lg flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-primary text-white font-bold'
                  : isToday
                    ? 'bg-primary/20 text-primary font-semibold'
                    : dayOfWeek === 0
                      ? 'text-red/70 hover:bg-overlay'
                      : dayOfWeek === 6
                        ? 'text-blue/70 hover:bg-overlay'
                        : 'text-text hover:bg-overlay'
              }`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* 오늘로 버튼 */}
      <div className="mt-2 pt-2 border-t border-overlay text-center">
        <button
          onClick={() => { setSelectedDate(today); onClose() }}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          오늘로 이동
        </button>
      </div>
    </div>
  )
}
