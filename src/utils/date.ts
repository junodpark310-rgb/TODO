import { format, startOfWeek } from 'date-fns'
import { ko } from 'date-fns/locale'

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayString(): string {
  return toDateString(new Date())
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(date, 'M월 d일 (eee)', { locale: ko })
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(date, 'M/d', { locale: ko })
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(date, 'eee', { locale: ko })
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

/** 해당 날짜가 포함된 주의 월~일 날짜 배열 반환 */
export function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr + 'T00:00:00')
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return toDateString(d)
  })
}

/** 해당 월의 모든 날짜 반환 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

/** 해당 월 1일의 요일 (0=일, 1=월 ...) */
export function getMonthStartDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}
