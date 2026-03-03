import { useDroppable } from '@dnd-kit/core'
import { useTaskStore } from '../../stores/useTaskStore'
import { BrainDumpInput } from './BrainDumpInput'
import { TaskCard } from './TaskCard'

export function BrainDumpPanel() {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)

  const inboxTasks = tasks.filter(
    (t) => t.date === selectedDate && t.status === 'inbox'
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
          <div className="flex flex-col items-center justify-center h-full py-8">
            <p className="text-muted text-sm">할 일을 입력해보세요</p>
            <p className="text-muted text-xs mt-1">Enter로 빠르게 추가됩니다</p>
          </div>
        ) : (
          inboxTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
