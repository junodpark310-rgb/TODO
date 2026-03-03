import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types/task'
import { useTaskStore } from '../../stores/useTaskStore'
import { SubtaskList } from '../subtask/SubtaskList'

interface Props {
  task: Task
  isScheduled?: boolean
  onAssign?: () => void
}

export function TaskCard({ task, isScheduled = false, onAssign }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const { deleteTask, toggleDone, updateTask } = useTaskStore()

  function startEdit() {
    setEditValue(task.title)
    setIsEditing(true)
  }

  function commitEdit() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.title) updateTask(task.id, { title: trimmed })
    setIsEditing(false)
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : isScheduled ? 0.6 : 1,
  }

  const doneCount = task.subtasks.filter((s) => s.isDone).length
  const totalCount = task.subtasks.length
  const hasSubtasks = totalCount > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex flex-col px-3 py-2 bg-overlay rounded-lg border border-transparent hover:border-muted transition-all cursor-grab active:cursor-grabbing"
    >
      {/* 메인 행 */}
      <div className="flex items-center gap-2">
        {/* 완료 체크박스 */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => toggleDone(task.id)}
          className={`w-4 h-4 rounded-full border flex-shrink-0 transition-colors ${
            task.status === 'done' ? 'bg-green border-green' : 'border-muted hover:border-subtext'
          }`}
        />

        {/* 제목 */}
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={commitEdit}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 text-sm bg-base text-text border border-primary/50 rounded px-1 outline-none"
          />
        ) : (
          <span
            onDoubleClick={(e) => { e.stopPropagation(); startEdit() }}
            className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-muted' : 'text-text'}`}
          >
            {task.title}
          </span>
        )}

        {/* 캘린더 배치 뱃지 */}
        {isScheduled && (
          <span className="text-[10px] text-primary/70 flex-shrink-0" title="캘린더에 배치됨">
            📅
          </span>
        )}

        {/* 서브태스크 진행률 뱃지 */}
        {hasSubtasks && (
          <span className="text-[10px] text-muted flex-shrink-0">
            {doneCount}/{totalCount}
          </span>
        )}

        {/* 탭-투-어사인 버튼 — 터치 기기에서만 표시, 이미 배치된 경우 숨김 */}
        {onAssign && !isScheduled && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onAssign() }}
            className="hidden [@media(hover:none)]:flex text-muted hover:text-primary text-xs flex-shrink-0 transition-colors"
            title="타임라인에 추가"
          >
            ⏱
          </button>
        )}

        {/* 확장 버튼 */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setExpanded((v) => !v)}
          className="text-muted hover:text-subtext text-[10px] transition-colors flex-shrink-0"
          title="서브태스크"
        >
          {expanded ? '▾' : '▸'}
        </button>

        {/* 삭제 버튼 */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => deleteTask(task.id)}
          className="text-muted opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 hover:text-red transition-all text-xs flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* 서브태스크 (확장 시) */}
      {expanded && <SubtaskList task={task} />}
    </div>
  )
}
