import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NoteStore {
  /** 날짜별 메모 { 'YYYY-MM-DD': 'content' } */
  notes: Record<string, string>

  getNote: (date: string) => string
  setNote: (date: string, content: string) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: {},

      getNote: (date) => get().notes[date] ?? '',

      setNote: (date, content) =>
        set((state) => ({
          notes: { ...state.notes, [date]: content },
        })),
    }),
    { name: 'timebox-notes' }
  )
)
