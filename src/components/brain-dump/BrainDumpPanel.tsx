import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useTaskStore } from '../../stores/useTaskStore'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { BrainDumpInput } from './BrainDumpInput'
import { TaskCard } from './TaskCard'

export function BrainDumpPanel() {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const timeboxes = useCalendarStore((s) => s.timeboxes)
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
