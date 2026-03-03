import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useTaskStore } from '../../stores/useTaskStore'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { BrainDumpInput } from './BrainDumpInput'
import { TaskCard } from './TaskCard'
import type { Task } from '../../types/task'
import {
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  SLOT_MINUTES,
} from '../../utils/timeUtils'

export function BrainDumpPanel() {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const timeboxes = useCalendarStore((s) => s.timeboxes)
  const addTimebox = useCalendarStore((s) => s.addTimebox)
  const [doneOpen, setDoneOpen] = useState(false)

  const scheduledTaskIds = new Set(
    timeboxes
      .filter((tb) => tb.date === selectedDate && tb.taskId !== null)
      .map((tb) => tb.taskId as string)
  )

  const inboxTasks = tasks.filter(
    (t) => t.date === selectedDate && t.status === 'inbox'
  )
  const doneTasks = tasks.filter(
    (t) => t.date === selectedDate && t.status === 'done'
  )

  /** 선택일 마지막 블록 다음에 태스크를 타임라인에 배치 */
  function handleAssign(task: Task) {
    const dayBoxes = timeboxes.filter((tb) => tb.date === selectedDate)
    let startTime: string

    if (dayBoxes.length > 0) {
      // 가장 늦게 끝나는 블록의 endTime에 이어서 배치
      const lastEnd = dayBoxes.reduce((max, tb) =>
        timeToMinutes(tb.endTime) > timeToMinutes(max) ? tb.endTime : max,
        '00:00'
      )
      startTime = lastEnd
    } else {
      // 타임박스 없으면 현재 시각을 30분 단위로 올림
      const now = new Date()
      const totalMin = now.getHours() * 60 + now.getMinutes()
      const rounded = Math.ceil(totalMin / SLOT_MINUTES) * SLOT_MINUTES
      startTime = minutesToTime(rounded)
    }

    const durationMin = task.estimatedMin ?? 60
    addTimebox({
      taskId: task.id,
      date: selectedDate,
      startTime,
      endTime: addMinutesToTime(startTime, durationMin),
    })
  }

  const { setNodeRef, isOver } = useDroppable({
    id: 'brain-dump',
    data: { type: 'brain-dump' },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-overlay">
        <h2 className="text-sm font-semibold text-subtext uppercase tracking-wider">
          Brain Dump
        </h2>
        <p className="text-xs text-muted mt-0.5">{inboxTasks.length}개</p>
      </div>

      <div className="px-3 pt-3">
        <BrainDumpInput />
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 transition-colors ${
          isOver ? 'bg-primary/5 rounded-lg' : ''
        }`}
      >
        {inboxTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted text-sm">할 일을 입력해보세요</p>
            <p className="text-muted text-xs mt-1">Enter로 빠르게 추가됩니다</p>
          </div>
        ) : (
          inboxTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isScheduled={scheduledTaskIds.has(task.id)}
              onAssign={() => handleAssign(task)}
            />
          ))
        )}

        {/* 완료됨 섹션 */}
        {doneTasks.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setDoneOpen((v) => !v)}
              className="flex items-center gap-1.5 w-full text-left px-1 py-1 text-xs text-muted hover:text-subtext transition-colors"
            >
              <span>{doneOpen ? '▾' : '▸'}</span>
              <span>완료됨 ({doneTasks.length})</span>
            </button>

            {doneOpen && (
              <div className="flex flex-col gap-1.5 mt-1">
                {doneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isScheduled={scheduledTaskIds.has(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
