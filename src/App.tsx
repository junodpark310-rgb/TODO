import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, useRef } from 'react'
import { useTaskStore } from './stores/useTaskStore'
import { useCalendarStore } from './stores/useCalendarStore'
import { CalendarUIProvider } from './contexts/CalendarContext'
import { BrainDumpPanel } from './components/brain-dump/BrainDumpPanel'
import { BigThreePanel } from './components/big-three/BigThreePanel'
import { TimelineView } from './components/calendar/TimelineView'
import { DateNav } from './components/layout/DateNav'
import { StatsModal } from './components/stats/StatsModal'
import { addMinutesToTime } from './utils/timeUtils'
import type { Task } from './types/task'

function DragPreview({ task }: { task: Task }) {
  return (
    <div className="px-3 py-2 bg-surface border border-primary/50 rounded-lg shadow-xl text-sm text-text max-w-[200px] truncate rotate-1 pointer-events-none">
      {task.title}
    </div>
  )
}

function AppInner() {
  const { tasks, setBigThree, removeBigThree, selectedDate } = useTaskStore()
  const { addTimebox } = useCalendarStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showStats, setShowStats] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    const overType = over.data.current?.type as string

    if (overType === 'big-three') {
      setBigThree(taskId, over.data.current?.slot as number)
      return
    }

    if (overType === 'brain-dump') {
      const task = tasks.find((t) => t.id === taskId)
      if (task && !task.isBigThree) removeBigThree(taskId)
      return
    }

    if (overType === 'time-slot') {
      const startTime = over.data.current?.time as string
      const targetDate = (over.data.current?.date as string | undefined) ?? selectedDate
      const task = tasks.find((t) => t.id === taskId)
      const durationMin = task?.estimatedMin ?? 60
      addTimebox({ taskId, date: targetDate, startTime, endTime: addMinutesToTime(startTime, durationMin) })
    }
  }

  // Export
  function handleExport() {
    const taskStore = useTaskStore.getState()
    const calendarStore = useCalendarStore.getState()
    const data = {
      version: '1',
      exportedAt: new Date().toISOString(),
      tasks: taskStore.tasks,
      timeboxes: calendarStore.timeboxes,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timebox-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.tasks || !data.timeboxes) {
          alert('올바른 백업 파일이 아닙니다.')
          return
        }
        if (!window.confirm('현재 데이터를 덮어씁니까? 이 작업은 되돌릴 수 없습니다.')) return

        useTaskStore.setState({ tasks: data.tasks })
        useCalendarStore.setState({ timeboxes: data.timeboxes })
      } catch {
        alert('파일을 읽을 수 없습니다.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-base">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-overlay bg-surface flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱</span>
            <span className="text-sm font-bold text-text">Timebox</span>
          </div>

          <DateNav />

          {/* 우측 액션 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowStats(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg text-muted hover:text-text hover:bg-overlay transition-colors"
            >
              통계
            </button>
            <button
              onClick={handleExport}
              className="text-xs px-2.5 py-1.5 rounded-lg text-muted hover:text-text hover:bg-overlay transition-colors"
              title="JSON으로 백업"
            >
              내보내기
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="text-xs px-2.5 py-1.5 rounded-lg text-muted hover:text-text hover:bg-overlay transition-colors"
              title="JSON 백업 불러오기"
            >
              가져오기
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </header>

        {/* 3컬럼 메인 */}
        <main className="flex flex-1 overflow-hidden">
          <div className="w-64 flex-shrink-0 border-r border-overlay overflow-hidden">
            <BrainDumpPanel />
          </div>
          <div className="w-60 flex-shrink-0 border-r border-overlay overflow-hidden">
            <BigThreePanel />
          </div>
          <div className="flex-1 overflow-hidden">
            <TimelineView />
          </div>
        </main>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <DragPreview task={activeTask} /> : null}
      </DragOverlay>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </DndContext>
  )
}

export default function App() {
  return (
    <CalendarUIProvider>
      <AppInner />
    </CalendarUIProvider>
  )
}
