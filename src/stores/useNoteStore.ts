import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NoteStore {
  /** 글로벌 메모 (모든 날짜에서 공유) */
  globalNote: string
  /** 레거시 날짜별 메모 (마이그레이션용) */
  notes: Record<string, string>

  getNote: () => string
  setNote: (content: string) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      globalNote: '',
      notes: {},

      getNote: () => {
        const state = get()
        // 마이그레이션: globalNote가 비어있고 기존 날짜별 메모가 있으면 병합
        if (!state.globalNote && Object.keys(state.notes).length > 0) {
          const merged = Object.entries(state.notes)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, content]) => `[${date}]\n${content}`)
            .join('\n\n')
          set({ globalNote: merged, notes: {} })
          return merged
        }
        return state.globalNote
      },

      setNote: (content) =>
        set({ globalNote: content }),
    }),
    { name: 'timebox-notes' }
  )
)
