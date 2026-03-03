import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types/task'
import { useTaskStore } from '../../stores/useTaskStore'

interface Props {
  slot: number
  task: Task | null
}

const SLOT_LABELS = ['첫 번째', '두 번째', '세 번째']
const SLOT_COLORS = [
  'border-yellow/40 hover:border-yellow/70',
  'border-blue/40 hover:border-blue/70',
  'border-green/40 hover:border-green/70',
]
const SLOT_DOT_COLORS = ['bg-yellow', 'bg-blue', 'bg-green']

export function BigThreeSlot({ slot, task }: Props) {
  const { removeBigThree, toggleDone } = useTaskStore()

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `big-three-${slot}`,
    data: { type: 'big-three', slot },
  })

  // 태스크가 있을 때만 드래그 가능 (캘린더로 드래그)
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: task?.id ?? `big3-empty-${slot}`,
    disabled: !task,
    data: { type: 'task', task },
  })

  const dragStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setDropRef}
      className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all min-h-[80px] ${
        isOver
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : task
            ? `${SLOT_COLORS[slot]} bg-overlay`
            : 'border-muted/30 border-dashed hover:border-muted/60'
      }`}
    >
      {/* 슬롯 번호 */}
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${SLOT_DOT_COLORS[slot]}`} />
        <span className="text-xs text-muted">{SLOT_LABELS[slot]}</span>
      </div>

      {task ? (
        <div
          ref={setDragRef}
          style={dragStyle}
          {...listeners}
          {...attributes}
          className="flex items-start gap-2 cursor-grab active:cursor-grabbing"
        >
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => toggleDone(task.id)}
            className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 transition-colors ${
              task.status === 'done' ? 'bg-green border-green' : 'border-muted hover:border-subtext'
            }`}
          />
          <span
            className={`flex-1 text-sm leading-snug ${
              task.status === 'done' ? 'line-through text-muted' : 'text-text'
            }`}
          >
            {task.title}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => removeBigThree(task.id)}
            className="text-muted hover:text-red text-xs flex-shrink-0 transition-colors"
            title="빅3에서 제거"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <p className="text-xs text-muted/60 text-center">
            {isOver ? '여기에 놓기' : '왼쪽에서 드래그'}
          </p>
        </div>
      )}
    </div>
  )
}
