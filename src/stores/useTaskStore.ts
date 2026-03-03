import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, Subtask } from '../types/task'
import { generateId } from '../utils/id'
import { todayString } from '../utils/date'

interface TaskStore {
  tasks: Task[]
  selectedDate: string

  setSelectedDate: (date: string) => void
  addTask: (title: string) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  toggleDone: (id: string) => void

  setBigThree: (taskId: string, slot: number) => void
  removeBigThree: (taskId: string) => void

  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      selectedDate: todayString(),

      setSelectedDate: (date) => set({ selectedDate: date }),

      addTask: (title) => {
        set((state) => {
          const newTask: Task = {
            id: generateId(),
            title: title.trim(),
            status: 'inbox',
            estimatedMin: null,
            actualMin: null,
            isBigThree: false,
            bigThreeOrder: null,
            subtasks: [],
            date: state.selectedDate,
            createdAt: new Date().toISOString(),
          }
          return { tasks: [...state.tasks, newTask] }
        })
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
      },

      toggleDone: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t
            const wasDone = t.status === 'done'
            return {
              ...t,
              status: wasDone ? (t.isBigThree ? 'active' : 'inbox') : 'done',
            }
          }),
        }))
      },

      setBigThree: (taskId, slot) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.bigThreeOrder === slot && t.id !== taskId) {
              return { ...t, isBigThree: false, bigThreeOrder: null, status: 'inbox' as const }
            }
            if (t.id === taskId) {
              return { ...t, isBigThree: true, bigThreeOrder: slot, status: 'active' as const }
            }
            return t
          }),
        }))
      },

      removeBigThree: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, isBigThree: false, bigThreeOrder: null, status: 'inbox' as const }
              : t
          ),
        }))
      },

      addSubtask: (taskId, title) => {
        const newSubtask: Subtask = { id: generateId(), title: title.trim(), isDone: false }
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t
          ),
        }))
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, isDone: !s.isDone } : s
                  ),
                }
              : t
          ),
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
              : t
          ),
        }))
      },
    }),
    { name: 'timebox-tasks' }
  )
)
