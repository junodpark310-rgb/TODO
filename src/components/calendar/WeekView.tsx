import { useCalendarStore } from '../../stores/useCalendarStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { useCalendarUI } from '../../contexts/CalendarContext'
import { TimeBlock } from './TimeBlock'
import { TimeSlot } from './TimeSlot'
import { getSlotTimes, timeToY } from '../../utils/timeUtils'
import { assignColumns } from '../../utils/layout'
import { getWeekDates, formatShortDate, formatDayName, todayString } from '../../utils/date'
import type { Task } from '../../types/task'

const LABEL_WIDTH = 44

export function WeekView() {
  const timeboxes = useCalendarStore((s) => s.timeboxes)
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const { slotHeight, totalHeight } = useCalendarUI()

  const slotTimes = getSlotTimes()
  const weekDates = getWeekDates(selectedDate)
  const today = todayString()

  function getTask(taskId: string | null): Task | null {
    if (!taskId) return null
    return tasks.find((t) => t.id === taskId) ?? null
  }

  function getTimeboxesForDate(date: string) {
    return timeboxes.filter((tb) => tb.date === date)
  }

  function getColumnMapForDate(date: string) {
    return assignColumns(getTimeboxesForDate(date))
  }

  return (
    <div className="flex flex-col h-full">
      {/* 타임라인 (헤더 포함 — 스크롤바 정렬 일치) */}
      <div id="calendar-scroll" className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* 날짜 헤더 — sticky */}
        <div className="flex flex-shrink-0 border-b border-overlay sticky top-0 z-10 bg-surface">
          {/* 시간 레이블 자리 */}
          <div style={{ width: LABEL_WIDTH }} className="flex-shrink-0" />
          {/* 요일 헤더 */}
          {weekDates.map((date) => {
            const isToday = date === today
            const isSelected = date === selectedDate
            return (
              <div
                key={date}
                className={`flex-1 text-center py-2 border-l border-overlay ${
                  isToday ? 'bg-primary/10' : ''
                }`}
              >
                <p className={`text-[10px] ${isToday ? 'text-primary' : 'text-muted'}`}>
                  {formatDayName(date)}
                </p>
                <p className={`text-sm font-semibold mt-0.5 ${
                  isToday ? 'text-primary' : isSelected ? 'text-text' : 'text-subtext'
                }`}>
                  {formatShortDate(date)}
                </p>
              </div>
            )
          })}
        </div>
        <div className="flex" style={{ height: totalHeight }}>

          {/* 시간 레이블 */}
          <div className="relative flex-shrink-0" style={{ width: LABEL_WIDTH }}>
            {slotTimes.map((time, i) => (
              <div
                key={time}
                className="absolute flex items-start justify-end pr-1.5 pointer-events-none"
                style={{ top: i * slotHeight, height: slotHeight, width: LABEL_WIDTH }}
              >
                <span className="text-[9px] text-muted leading-none -mt-1.5">{time}</span>
              </div>
            ))}
          </div>

          {/* 7일 컬럼 */}
          {weekDates.map((date) => {
            const isToday = date === today
            const dayTimeboxes = getTimeboxesForDate(date)

            const columnMap = getColumnMapForDate(date)

            return (
              <div
                key={date}
                className={`relative flex-1 border-l border-overlay ${isToday ? 'bg-primary/5' : ''}`}
              >
                {/* 수평 구분선 */}
                {slotTimes.map((time, i) => (
                  <div
                    key={time}
                    className={`absolute w-full border-t pointer-events-none ${
                      i % 2 === 0 ? 'border-overlay' : 'border-overlay/30'
                    }`}
                    style={{ top: i * slotHeight }}
                  />
                ))}

                {/* 드롭 슬롯 */}
                {slotTimes.map((time, i) => (
                  <TimeSlot key={time} time={time} index={i} slotHeight={slotHeight} date={date} />
                ))}

                {/* 현재 시각 선 (오늘만) */}
                {isToday && <CurrentTimeLine slotHeight={slotHeight} />}

                {/* 타임 블록 */}
                {dayTimeboxes.map((tb) => (
                  <TimeBlock
                    key={tb.id}
                    timebox={tb}
                    task={getTask(tb.taskId)}
                    columnInfo={columnMap.get(tb.id)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CurrentTimeLine({ slotHeight }: { slotHeight: number }) {
  const now = new Date()
  const h = now.getHours()
  if (h < 6 || h >= 24) return null

  const timeStr = `${String(h).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const y = timeToY(timeStr, slotHeight)

  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: y }}>
      <div className="flex items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-red flex-shrink-0 -ml-0.5" />
        <div className="flex-1 h-px bg-red/60" />
      </div>
    </div>
  )
}
