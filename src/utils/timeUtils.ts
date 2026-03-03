export const START_HOUR = 6
export const END_HOUR = 24
export const SLOT_MINUTES = 30
export const BASE_SLOT_HEIGHT = 48      // 기본값 (줌 1x)
export const SLOT_HEIGHT = BASE_SLOT_HEIGHT // 하위 호환
export const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES // 36
export const TOTAL_HEIGHT = TOTAL_SLOTS * BASE_SLOT_HEIGHT

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "HH:mm" → Y픽셀 (slotHeight 반영) */
export function timeToY(time: string, slotHeight = BASE_SLOT_HEIGHT): number {
  const [h, m] = time.split(':').map(Number)
  const minutesFromStart = (h - START_HOUR) * 60 + m
  return Math.max(0, (minutesFromStart / SLOT_MINUTES) * slotHeight)
}

/** Y픽셀 → "HH:mm" 30분 스냅 */
export function yToTime(y: number, slotHeight = BASE_SLOT_HEIGHT): string {
  const slotIndex = Math.max(0, Math.min(Math.round(y / slotHeight), TOTAL_SLOTS - 1))
  return minutesToTime(slotIndex * SLOT_MINUTES + START_HOUR * 60)
}

export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes
  const clamped = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, total))
  return minutesToTime(clamped)
}

export function timeDiffMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start)
}

/** 블록 높이(px) */
export function blockHeight(start: string, end: string, slotHeight = BASE_SLOT_HEIGHT): number {
  const minutes = timeDiffMinutes(start, end)
  return Math.max(slotHeight, (minutes / SLOT_MINUTES) * slotHeight)
}

export function getSlotTimes(): string[] {
  return Array.from({ length: TOTAL_SLOTS }, (_, i) =>
    minutesToTime(i * SLOT_MINUTES + START_HOUR * 60)
  )
}
