import { useTaskStore } from '../../stores/useTaskStore'
import { BigThreeSlot } from './BigThreeSlot'
import type { Task } from '../../types/task'

export function BigThreePanel({ compact = false }: { compact?: boolean }) {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)

  const slots: (Task | null)[] = [null, null, null]
  tasks
    .filter((t) => t.date === selectedDate && t.isBigThree)
    .forEach((t) => {
      if (t.bigThreeOrder !== null) slots[t.bigThreeOrder] = t
    })

  const filled = slots.filter(Boolean).length

  return (
    <div className={`flex flex-col ${compact ? '' : 'flex-shrink-0'}`}>
      <div className="px-4 py-3 border-b border-overlay">
        <h2 className="text-sm font-semibold text-subtext uppercase tracking-wider">
          Big 3
        </h2>
        <p className="text-xs text-muted mt-0.5">오늘의 핵심 {filled}/3</p>
      </div>

      <div className={`${compact ? '' : 'flex-1'} overflow-y-auto px-3 py-3 flex flex-col gap-3`}>
        {[0, 1, 2].map((slot) => (
          <BigThreeSlot key={slot} slot={slot} task={slots[slot]} />
        ))}

        {filled === 0 && (
          <p className="text-xs text-muted/50 text-center mt-2 px-2">
            왼쪽 목록에서 오늘 꼭 할 3가지를 드래그해 오세요
          </p>
        )}
        {filled === 3 && (
          <p className="text-xs text-green/70 text-center mt-2">
            오늘의 빅 3 완성! 집중하세요 🎯
          </p>
        )}
      </div>
    </div>
  )
}
