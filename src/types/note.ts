export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple'

export interface Note {
  readonly id: string
  readonly content: string
  readonly createdAt: string   // ISO string
  readonly updatedAt: string   // ISO string
  readonly color: NoteColor
}
