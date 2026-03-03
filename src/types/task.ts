export interface Subtask {
  readonly id: string
  readonly title: string
  readonly isDone: boolean
}

export type TaskStatus = 'inbox' | 'active' | 'done'

export interface Task {
  readonly id: string
  readonly title: string
  readonly status: TaskStatus
  readonly estimatedMin: number | null
  readonly actualMin: number | null
  readonly isBigThree: boolean
  readonly bigThreeOrder: number | null  // 0, 1, 2
  readonly subtasks: readonly Subtask[]
  readonly date: string                   // YYYY-MM-DD
  readonly createdAt: string
}
