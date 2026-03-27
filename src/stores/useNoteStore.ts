import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Note, NoteColor } from '../types/note'
import { generateId } from '../utils/id'

interface NoteStore {
  notes: Note[]
  /** AI API 키 (OpenAI) */
  aiApiKey: string
  /** 레거시 마이그레이션 완료 여부 */
  _migrated: boolean

  addNote: (content?: string, color?: NoteColor) => string
  updateNote: (id: string, updates: Partial<Pick<Note, 'content' | 'color'>>) => void
  deleteNote: (id: string) => void
  setAiApiKey: (key: string) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      aiApiKey: '',
      _migrated: false,

      addNote: (content = '', color = 'yellow') => {
        const id = generateId()
        const now = new Date().toISOString()
        const newNote: Note = { id, content, createdAt: now, updatedAt: now, color }
        set((state) => ({ notes: [newNote, ...state.notes] }))
        return id
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
      },

      setAiApiKey: (key) => set({ aiApiKey: key }),
    }),
    {
      name: 'timebox-notes',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // 레거시 마이그레이션: 단일 globalNote → 개별 Note 변환
        const raw = JSON.parse(localStorage.getItem('timebox-notes') ?? '{}')
        const legacyGlobal = raw?.state?.globalNote
        if (!state._migrated && typeof legacyGlobal === 'string' && legacyGlobal.trim()) {
          const now = new Date().toISOString()
          const migratedNote: Note = {
            id: generateId(),
            content: legacyGlobal,
            createdAt: now,
            updatedAt: now,
            color: 'yellow',
          }
          useNoteStore.setState({ notes: [migratedNote], _migrated: true })
        } else if (!state._migrated) {
          useNoteStore.setState({ _migrated: true })
        }
      },
    }
  )
)
