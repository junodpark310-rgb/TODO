import { timeToMinutes } from './timeUtils'
import type { Timebox } from '../types/timebox'

export interface ColumnInfo {
  column: number
  totalColumns: number
}

/**
 * 같은 시간대에 겹치는 타임블록들에 컬럼 인덱스를 할당한다.
 * 겹치는 블록들은 가로로 분할되어 나란히 표시된다.
 */
export function assignColumns(timeboxes: Timebox[]): Map<string, ColumnInfo> {
  const sorted = [...timeboxes].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )

  // 각 컬럼의 현재 endTime(분) 추적
  const colEnds: number[] = []
  const colMap = new Map<string, number>()

  for (const tb of sorted) {
    const start = timeToMinutes(tb.startTime)
    const end = timeToMinutes(tb.endTime)

    // 끝난 컬럼이 있으면 재사용, 없으면 새 컬럼 추가
    let col = colEnds.findIndex((e) => e <= start)
    if (col === -1) {
      col = colEnds.length
      colEnds.push(end)
    } else {
      colEnds[col] = end
    }
    colMap.set(tb.id, col)
  }

  // 각 블록과 겹치는 그룹 내 최대 컬럼 수 계산
  const result = new Map<string, ColumnInfo>()
  for (const tb of timeboxes) {
    const tbStart = timeToMinutes(tb.startTime)
    const tbEnd = timeToMinutes(tb.endTime)

    const usedCols = new Set<number>()
    for (const other of timeboxes) {
      const oStart = timeToMinutes(other.startTime)
      const oEnd = timeToMinutes(other.endTime)
      if (oStart < tbEnd && tbStart < oEnd) {
        usedCols.add(colMap.get(other.id)!)
      }
    }

    result.set(tb.id, {
      column: colMap.get(tb.id)!,
      totalColumns: usedCols.size,
    })
  }

  return result
}
