export interface Timebox {
  readonly id: string
  readonly taskId: string | null   // null이면 버퍼 블록
  readonly date: string            // YYYY-MM-DD
  readonly startTime: string       // HH:mm
  readonly endTime: string         // HH:mm
  readonly actualStart: string | null
  readonly actualEnd: string | null
  readonly isBuffer: boolean
  readonly bufferLabel: string | null
}
