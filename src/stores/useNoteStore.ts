import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NoteStore {
  /** 글로벌 메모 (모든 날짜에서 공유) */
  globalNote: string
  /** 마이그레이션 완료 여부 */
  _migrated: boolean

  setNote: (content: string) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      globalNote: '',
      _migrated: false,

      setNote: (content) =>
        set({ globalNote: content }),
    }),
    {
      name: 'timebox-notes',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // 마이그레이션: 레거시 날짜별 notes → globalNote 병합
        const raw = JSON.parse(localStorage.getItem('timebox-notes') ?? '{}')
        const legacyNotes = raw?.state?.notes
        if (!state._migrated && legacyNotes && Object.keys(legacyNotes).length > 0 && !state.globalNote) {
          const merged = Object.entries(legacyNotes as Record<string, string>)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, content]) => `[${date}]\n${content}`)
            .join('\n\n')
          useNoteStore.setState({ globalNote: merged, _migrated: true })
        } else if (!state._migrated) {
          useNoteStore.setState({ _migrated: true })
        }
      },
    }
  )
)
