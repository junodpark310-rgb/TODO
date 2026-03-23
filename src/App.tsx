import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from './stores/useTaskStore'
import { useCalendarStore } from './stores/useCalendarStore'
import { CalendarUIProvider } from './contexts/CalendarContext'
import { DateNav } from './components/layout/DateNav'
import { DesktopLayout } from './components/layout/DesktopLayout'
import { MobileLayout } from './components/layout/MobileLayout'
import { StatsModal } from './components/stats/StatsModal'
import { useMediaQuery } from './hooks/useMediaQuery'
import { hapticLight, hapticSuccess } from './hooks/useHaptic'
import { addMinutesToTime } from './utils/timeUtils'
import { todayString } from './utils/date'
import { useThemeStore } from './stores/useThemeStore'
import type { Task } from './types/task'

function DragPreview({ task }: { task: Task }) {
  return (
    <div className="px-3 py-2 bg-surface border border-primary/50 rounded-lg shadow-xl text-sm text-text max-w-[200px] truncate rotate-1 pointer-events-none">
      {task.title}
    </div>
  )
}

/** 타임라인을 현재 시각 위치로 즉시 스크롤 */
function scrollTimelineToNow() {
  const el = document.getElementById('calendar-scroll')
  if (!el) return
  const now = new Date()
  const h = now.getHours()
  if (h < 6 || h >= 24) return
  const fraction = ((h - 6) * 60 + now.getMinutes()) / ((24 - 6) * 60)
  el.scrollTo({ top: Math.max(0, fraction * el.scrollHeight - el.clientHeight * 0.3), behavior: 'instant' })
}

function AppInner() {
  const { tasks, setBigThree, removeBigThree, selectedDate, rolloverTasks } = useTaskStore()
  const { addTimebox } = useCalendarStore()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [mobileTab, setMobileTab] = useState<'dump' | 'timeline'>('timeline')
  const importRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery('(max-width: 767px)')

  // 테마 class를 html 요소에 적용
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // 앱 시작 시 이전 날짜 미완료 태스크를 오늘로 자동 이전
  useEffect(() => {
    rolloverTasks(todayString())
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
      // 모바일 + Brain Dump 출처: 타임라인 탭으로 자동 전환 + 현재 시각으로 스크롤
      if (isMobile && event.active.data.current?.source === 'brain-dump') {
        hapticLight()
        setMobileTab('timeline')
        // 탭 전환 후 렌더링 완료 시점에 스크롤
        requestAnimationFrame(() => requestAnimationFrame(scrollTimelineToNow))
      }
    }
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
      hapticSuccess()
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
        {/* 헤더 — safe-top: iOS 노치 영역 확보 */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-overlay bg-surface flex-shrink-0 safe-top">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱</span>
            <span className="text-sm font-bold text-text">Timebox</span>
          </div>

          <DateNav />

          {/* 우측 액션 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="text-xs px-2.5 py-1.5 rounded-lg text-muted hover:text-text hover:bg-overlay transition-colors"
              title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
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

        {/* 메인 — 모바일: 탭 네비게이션 / 데스크탑: 3컬럼 */}
        {isMobile
          ? <MobileLayout activeTab={mobileTab} onTabChange={setMobileTab} />
          : <DesktopLayout />
        }
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
