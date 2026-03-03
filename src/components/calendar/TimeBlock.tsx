import { useRef } from 'react'
import type { Timebox } from '../../types/timebox'
import type { Task } from '../../types/task'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { useCalendarUI } from '../../contexts/CalendarContext'
import {
  timeToY,
  blockHeight,
  SLOT_MINUTES,
  addMinutesToTime,
  timeDiffMinutes,
} from '../../utils/timeUtils'
import type { ColumnInfo } from '../../utils/layout'

const GAP = 3 // 블록 간 좌우 간격(px)

interface Props {
  timebox: Timebox
  task: Task | null
  columnInfo?: ColumnInfo
}

export function TimeBlock({ timebox, task, columnInfo }: Props) {
  const { updateTimebox, deleteTimebox, startTracking, stopTracking } = useCalendarStore()
  const { toggleDone } = useTaskStore()
  const { slotHeight } = useCalendarUI()

  const lastMoveSlot = useRef(0)
  const lastResizeSlot = useRef(0)

  const top = timeToY(timebox.startTime, slotHeight)
  const height = blockHeight(timebox.startTime, timebox.endTime, slotHeight)
  const duration = timeDiffMinutes(timebox.startTime, timebox.endTime)

  const col = columnInfo?.column ?? 0
  const total = columnInfo?.totalColumns ?? 1
  const leftStyle = `calc(${(col / total) * 100}% + ${GAP}px)`
  const rightStyle = `calc(${((total - col - 1) / total) * 100}% + ${GAP}px)`

  const isDone = task?.status === 'done'
  const isTracking = !!(timebox.actualStart && !timebox.actualEnd)
  const isFinished = !!(timebox.actualStart && timebox.actualEnd)

  function handleMoveStart(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[data-handle]')) return
    e.preventDefault()

    const startY = e.clientY
    const origStart = timebox.startTime
    const origEnd = timebox.endTime
    lastMoveSlot.current = 0

    function onMove(e: MouseEvent) {
      const deltaSlots = Math.round((e.clientY - startY) / slotHeight)
      if (deltaSlots === lastMoveSlot.current) return
      lastMoveSlot.current = deltaSlots

      const deltaMinutes = deltaSlots * SLOT_MINUTES
      const newStart = addMinutesToTime(origStart, deltaMinutes)
      const newEnd = addMinutesToTime(origEnd, deltaMinutes)
      if (newStart !== newEnd) updateTimebox(timebox.id, { startTime: newStart, endTime: newEnd })
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const startY = e.clientY
    const origEnd = timebox.endTime
    lastResizeSlot.current = 0

    function onMove(e: MouseEvent) {
      const deltaSlots = Math.round((e.clientY - startY) / slotHeight)
      if (deltaSlots === lastResizeSlot.current) return
      lastResizeSlot.current = deltaSlots

      const newEnd = addMinutesToTime(origEnd, deltaSlots * SLOT_MINUTES)
      if (timeDiffMinutes(timebox.startTime, newEnd) >= SLOT_MINUTES) {
        // pushSubsequent: true → 뒤 블록 자동 밀기
        updateTimebox(timebox.id, { endTime: newEnd }, true)
      }
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const showTracking = !timebox.isBuffer && height >= slotHeight * 1.5

  return (
    <div
      onMouseDown={handleMoveStart}
      style={{ top, height, position: 'absolute', left: leftStyle, right: rightStyle, zIndex: 10 }}
      className={`rounded-lg border flex flex-col group select-none overflow-hidden transition-shadow hover:shadow-lg ${
        timebox.isBuffer
          ? 'bg-muted/20 border-muted/40 cursor-default'
          : isDone
            ? 'bg-green/10 border-green/30 cursor-grab active:cursor-grabbing'
            : isTracking
              ? 'bg-blue/20 border-blue/50 ring-1 ring-blue/30 cursor-grab active:cursor-grabbing'
              : 'bg-primary/20 border-primary/40 hover:border-primary/70 cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start gap-1.5 px-2 pt-1.5 flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-muted' : 'text-text'}`}>
            {timebox.isBuffer ? (timebox.bufferLabel ?? '여유 시간') : (task?.title ?? '삭제된 태스크')}
          </p>
          {height >= 36 && (
            <p className="text-[10px] text-muted mt-0.5">
              {timebox.startTime}~{timebox.endTime} · {duration}분
            </p>
          )}
        </div>
        <button
          data-handle="delete"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => deleteTimebox(timebox.id)}
          className="text-muted hover:text-red text-[10px] opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>

      {showTracking && (
        <div className="px-2 pb-1">
          {!timebox.actualStart && (
            <button
              data-handle="track"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => startTracking(timebox.id)}
              className="text-[10px] px-2 py-0.5 rounded bg-primary/30 hover:bg-primary/50 text-text transition-colors"
            >
              ▶ 시작
            </button>
          )}
          {isTracking && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-blue">{timebox.actualStart} 시작</span>
              <button
                data-handle="track"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { stopTracking(timebox.id); if (task) toggleDone(task.id) }}
                className="text-[10px] px-2 py-0.5 rounded bg-green/30 hover:bg-green/50 text-text transition-colors"
              >
                ✓ 완료
              </button>
            </div>
          )}
          {isFinished && (
            <p className="text-[10px] text-green/80">{timebox.actualStart} ~ {timebox.actualEnd}</p>
          )}
        </div>
      )}

      <div
        data-handle="resize"
        onMouseDown={handleResizeStart}
        className="h-2 w-full cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity flex-shrink-0"
      >
        <div className="w-6 h-0.5 rounded-full bg-current opacity-30" />
      </div>
    </div>
  )
}
