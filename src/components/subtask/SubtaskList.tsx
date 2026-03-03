import { useState } from 'react'
import type { Task } from '../../types/task'
import { useTaskStore } from '../../stores/useTaskStore'

interface Props {
  task: Task
}

export function SubtaskList({ task }: Props) {
  const [input, setInput] = useState('')
  const { addSubtask, toggleSubtask, deleteSubtask } = useTaskStore()

  const done = task.subtasks.filter((s) => s.isDone).length
  const total = task.subtasks.length

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input.trim()) {
      addSubtask(task.id, input)
      setInput('')
    }
  }

  return (
    <div className="mt-2 ml-6 flex flex-col gap-1">
      {/* 진행률 바 */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1 bg-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-green/70 rounded-full transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted flex-shrink-0">{done}/{total}</span>
        </div>
      )}

      {/* 서브태스크 목록 */}
      {task.subtasks.map((sub) => (
        <div key={sub.id} className="group flex items-center gap-1.5">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => toggleSubtask(task.id, sub.id)}
            className={`w-3 h-3 rounded-sm border flex-shrink-0 transition-colors ${
              sub.isDone ? 'bg-green/70 border-green/70' : 'border-muted hover:border-subtext'
            }`}
          />
          <span className={`flex-1 text-xs ${sub.isDone ? 'line-through text-muted' : 'text-subtext'}`}>
            {sub.title}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => deleteSubtask(task.id, sub.id)}
            className="text-muted hover:text-red text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}

      {/* 서브태스크 입력 */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="+ 세부 작업 추가..."
        className="text-xs bg-transparent text-subtext placeholder-muted/50 outline-none py-0.5"
      />
    </div>
  )
}
