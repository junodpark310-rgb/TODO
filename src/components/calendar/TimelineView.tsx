import { useCalendarStore } from '../../stores/useCalendarStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { useCalendarUI } from '../../contexts/CalendarContext'
import { TimeBlock } from './TimeBlock'
import { TimeSlot } from './TimeSlot'
import { WeekView } from './WeekView'
import { getSlotTimes, timeToY, addMinutesToTime, timeToMinutes } from '../../utils/timeUtils'
import { assignColumns } from '../../utils/layout'
import type { Task } from '../../types/task'

const LABEL_WIDTH = 52

export function TimelineView() {
  const timeboxes = useCalendarStore((s) => s.timeboxes)
  const addTimebox = useCalendarStore((s) => s.addTimebox)
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const { slotHeight, totalHeight, zoomIn, zoomOut, canZoomIn, canZoomOut, viewMode, setViewMode } = useCalendarUI()

  function addBufferBlock() {
    // 오늘 마지막 블록 끝나는 시간 다음에 삽입, 없으면 현재 시각 이후
    const todayBoxes = timeboxes
      .filter((tb) => tb.date === selectedDate)
      .sort((a, b) => timeToMinutes(b.endTime) - timeToMinutes(a.endTime))

    const now = new Date()
    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const startTime = todayBoxes[0] ? todayBoxes[0].endTime : nowStr
    const endTime = addMinutesToTime(startTime, 30)

    addTimebox({ taskId: null, date: selectedDate, startTime, endTime, isBuffer: true, bufferLabel: '여유 시간' })
  }

  const slotTimes = getSlotTimes()
  const todayTimeboxes = timeboxes.filter((tb) => tb.date === selectedDate)
  const columnMap = assignColumns(todayTimeboxes)

  function getTask(taskId: string | null): Task | null {
    if (!taskId) return null
    return tasks.find((t) => t.id === taskId) ?? null
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-3 py-2.5 border-b border-overlay flex items-center gap-2 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-subtext uppercase tracking-wider">타임박싱</h2>
          <p className="text-xs text-muted mt-0.5">
            {viewMode === 'day'
              ? todayTimeboxes.length > 0 ? `${todayTimeboxes.length}개 블록` : '태스크를 드래그해 시간 배정'
              : '주간 뷰'}
          </p>
        </div>

        {/* 뷰 전환 */}
        <div className="flex items-center gap-0.5 bg-overlay rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('day')}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              viewMode === 'day' ? 'bg-surface text-text' : 'text-muted hover:text-text'
            }`}
          >
            일
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              viewMode === 'week' ? 'bg-surface text-text' : 'text-muted hover:text-text'
            }`}
          >
            주
          </button>
        </div>

        {/* 버퍼 추가 */}
        <button
          onClick={addBufferBlock}
          className="text-xs px-2 py-1 rounded-lg border border-muted/40 text-muted hover:text-text hover:border-muted transition-colors"
          title="여유 시간 블록 추가"
        >
          + 버퍼
        </button>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={!canZoomOut}
            className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-text hover:bg-overlay transition-colors disabled:opacity-30 text-sm"
          >
            −
          </button>
          <button
            onClick={zoomIn}
            disabled={!canZoomIn}
            className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-text hover:bg-overlay transition-colors disabled:opacity-30 text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* 주간 뷰 */}
      {viewMode === 'week' && <WeekView />}

      {/* 일간 뷰 */}
      {viewMode === 'day' && (
        <div id="calendar-scroll" className="flex-1 overflow-y-auto">
          <div className="flex" style={{ height: totalHeight }}>
            {/* 시간 레이블 */}
            <div className="relative flex-shrink-0" style={{ width: LABEL_WIDTH }}>
              {slotTimes.map((time, i) => (
                <div
                  key={time}
                  className="absolute flex items-start justify-end pr-2 pointer-events-none"
                  style={{ top: i * slotHeight, height: slotHeight, width: LABEL_WIDTH }}
                >
                  <span className="text-[10px] text-muted leading-none -mt-1.5">{time}</span>
                </div>
              ))}
            </div>

            {/* 블록 영역 */}
            <div id="timeline-container" className="relative flex-1 border-l border-overlay">
              {slotTimes.map((time, i) => (
                <div
                  key={time}
                  className={`absolute w-full border-t pointer-events-none ${
                    i % 2 === 0 ? 'border-overlay' : 'border-overlay/30'
                  }`}
                  style={{ top: i * slotHeight }}
                />
              ))}

              {slotTimes.map((time, i) => (
                <TimeSlot key={time} time={time} index={i} slotHeight={slotHeight} />
              ))}

              <CurrentTimeLine slotHeight={slotHeight} />

              {todayTimeboxes.map((tb) => (
                <TimeBlock
                  key={tb.id}
                  timebox={tb}
                  task={getTask(tb.taskId)}
                  columnInfo={columnMap.get(tb.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
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
        <div className="w-2 h-2 rounded-full bg-red flex-shrink-0 -ml-1" />
        <div className="flex-1 h-px bg-red/60" />
      </div>
    </div>
  )
}
