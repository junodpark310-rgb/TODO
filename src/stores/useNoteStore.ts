import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Note, NoteColor } from '../types/note'
import { generateId } from '../utils/id'

interface NoteStore {
  notes: Note[]
  /** AI API 키 (Gemini) */
  aiApiKey: string

  addNote: (content?: string, color?: NoteColor) => string
  updateNote: (id: string, updates: Partial<Pick<Note, 'content' | 'color'>>) => void
  deleteNote: (id: string) => void
  reorderNotes: (fromIndex: number, toIndex: number) => void
  setAiApiKey: (key: string) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      aiApiKey: '',

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

      reorderNotes: (fromIndex, toIndex) => {
        set((state) => {
          const next = [...state.notes]
          const [moved] = next.splice(fromIndex, 1)
          next.splice(toIndex, 0, moved)
          return { notes: next }
        })
      },

      setAiApiKey: (key) => set({ aiApiKey: key }),
    }),
    {
      name: 'timebox-notes',
      version: 1,
      migrate: (persisted: unknown) => {
        const old = persisted as Record<string, unknown>
        const notes: Note[] = []

        // 레거시: globalNote (string) → 개별 Note 변환
        if (typeof old.globalNote === 'string' && old.globalNote.trim()) {
          const now = new Date().toISOString()
          notes.push({
            id: generateId(),
            content: old.globalNote,
            createdAt: now,
            updatedAt: now,
            color: 'yellow',
          })
        }

        // notes가 이미 배열이면 유지, 아니면 빈 배열
        const existingNotes = Array.isArray(old.notes) ? old.notes : notes

        return {
          notes: existingNotes.length > 0 ? existingNotes : notes,
          aiApiKey: typeof old.aiApiKey === 'string' ? old.aiApiKey : '',
        }
      },
    }
  )
)
