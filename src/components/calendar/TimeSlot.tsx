import { useDroppable } from '@dnd-kit/core'

interface Props {
  time: string
  index: number
  slotHeight: number
  date?: string // 주간뷰에서 날짜 구분용
}

export function TimeSlot({ time, index, slotHeight, date }: Props) {
  const id = date ? `slot-${date}-${time}` : `slot-${time}`

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'time-slot', time, date },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ position: 'absolute', top: index * slotHeight, left: 0, right: 0, height: slotHeight }}
      className={`transition-colors ${isOver ? 'bg-primary/20' : ''}`}
    />
  )
}
