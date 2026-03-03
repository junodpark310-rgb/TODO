import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Timebox } from '../types/timebox'
import { generateId } from '../utils/id'
import { timeToMinutes, minutesToTime, addMinutesToTime } from '../utils/timeUtils'

interface AddTimeboxParams {
  taskId: string | null
  date: string
  startTime: string
  endTime: string
  isBuffer?: boolean
  bufferLabel?: string
}

interface CalendarStore {
  timeboxes: Timebox[]
  addTimebox: (params: AddTimeboxParams) => void
  updateTimebox: (id: string, updates: Partial<Omit<Timebox, 'id'>>, pushSubsequent?: boolean) => void
  deleteTimebox: (id: string) => void
  startTracking: (id: string) => void
  stopTracking: (id: string) => void
}

/** 특정 블록 이후에 겹치는 블록들을 순차적으로 뒤로 밀기 */
function pushSubsequentBlocks(timeboxes: Timebox[], updatedId: string, date: string): Timebox[] {
  const others = timeboxes.filter((tb) => tb.date !== date)
  const dayBoxes = timeboxes
    .filter((tb) => tb.date === date)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const updatedIdx = dayBoxes.findIndex((tb) => tb.id === updatedId)
  if (updatedIdx === -1) return timeboxes

  const result = [...dayBoxes]
  for (let i = updatedIdx + 1; i < result.length; i++) {
    const prev = result[i - 1]
    const curr = result[i]
    const prevEnd = timeToMinutes(prev.endTime)
    const currStart = timeToMinutes(curr.startTime)

    if (prevEnd > currStart) {
      const overlap = prevEnd - currStart
      result[i] = {
        ...curr,
        startTime: addMinutesToTime(curr.startTime, overlap),
        endTime: addMinutesToTime(curr.endTime, overlap),
      }
    }
  }

  return [...others, ...result]
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      timeboxes: [],

      addTimebox: ({ taskId, date, startTime, endTime, isBuffer = false, bufferLabel = null }) => {
        const newTimebox: Timebox = {
          id: generateId(),
          taskId,
          date,
          startTime,
          endTime,
          actualStart: null,
          actualEnd: null,
          isBuffer,
          bufferLabel: bufferLabel ?? null,
        }
        set((state) => ({ timeboxes: [...state.timeboxes, newTimebox] }))
      },

      updateTimebox: (id, updates, pushSubsequent = false) => {
        set((state) => {
          const updated = state.timeboxes.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          )
          if (!pushSubsequent) return { timeboxes: updated }

          const timebox = updated.find((t) => t.id === id)
          if (!timebox) return { timeboxes: updated }
          return { timeboxes: pushSubsequentBlocks(updated, id, timebox.date) }
        })
      },

      deleteTimebox: (id) => {
        set((state) => ({ timeboxes: state.timeboxes.filter((t) => t.id !== id) }))
      },

      startTracking: (id) => {
        const now = new Date()
        const timeStr = minutesToTime(now.getHours() * 60 + now.getMinutes())
        set((state) => ({
          timeboxes: state.timeboxes.map((t) =>
            t.id === id ? { ...t, actualStart: timeStr } : t
          ),
        }))
      },

      stopTracking: (id) => {
        const now = new Date()
        const timeStr = minutesToTime(now.getHours() * 60 + now.getMinutes())
        set((state) => ({
          timeboxes: state.timeboxes.map((t) =>
            t.id === id ? { ...t, actualEnd: timeStr } : t
          ),
        }))
      },
    }),
    { name: 'timebox-calendar' }
  )
)
