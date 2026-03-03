import { useTaskStore } from '../../stores/useTaskStore'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { addDays, todayString, formatShortDate } from '../../utils/date'
import { timeDiffMinutes } from '../../utils/timeUtils'

interface Props {
  onClose: () => void
}

interface DayStat {
  date: string
  estimatedMin: number
  actualMin: number
  completedTasks: number
  totalTasks: number
}

export function StatsModal({ onClose }: Props) {
  const tasks = useTaskStore((s) => s.tasks)
  const timeboxes = useCalendarStore((s) => s.timeboxes)
  const today = todayString()

  // 최근 7일 통계 계산
  const days: DayStat[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, -6 + i)
    const dayTasks = tasks.filter((t) => t.date === date)
    const dayBoxes = timeboxes.filter((tb) => tb.date === date && !tb.isBuffer)

    const estimatedMin = dayBoxes.reduce(
      (sum, tb) => sum + timeDiffMinutes(tb.startTime, tb.endTime), 0
    )
    const actualMin = dayBoxes
      .filter((tb) => tb.actualStart && tb.actualEnd)
      .reduce((sum, tb) => sum + timeDiffMinutes(tb.actualStart!, tb.actualEnd!), 0)

    return {
      date,
      estimatedMin,
      actualMin,
      completedTasks: dayTasks.filter((t) => t.status === 'done').length,
      totalTasks: dayTasks.length,
    }
  })

  const todayStat = days[days.length - 1]
  const maxMin = Math.max(...days.map((d) => Math.max(d.estimatedMin, d.actualMin)), 60)

  // 전체 통계
  const allTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const trackedBoxes = timeboxes.filter((tb) => !tb.isBuffer && tb.actualStart && tb.actualEnd)
  const avgAccuracy = trackedBoxes.length > 0
    ? trackedBoxes.reduce((sum, tb) => {
        const planned = timeDiffMinutes(tb.startTime, tb.endTime)
        const actual = timeDiffMinutes(tb.actualStart!, tb.actualEnd!)
        return sum + Math.min(planned, actual) / Math.max(planned, actual)
      }, 0) / trackedBoxes.length
    : null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-overlay rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-overlay">
          <h2 className="text-base font-semibold text-text">통계</h2>
          <button onClick={onClose} className="text-muted hover:text-text text-lg transition-colors">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* 오늘 요약 */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">오늘 요약</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="완료 태스크"
                value={`${todayStat.completedTasks}/${todayStat.totalTasks}`}
                color="text-green"
              />
              <StatCard
                label="계획 시간"
                value={todayStat.estimatedMin > 0 ? `${Math.round(todayStat.estimatedMin / 60 * 10) / 10}h` : '-'}
                color="text-blue"
              />
              <StatCard
                label="실제 시간"
                value={todayStat.actualMin > 0 ? `${Math.round(todayStat.actualMin / 60 * 10) / 10}h` : '-'}
                color="text-primary"
              />
            </div>
          </div>

          {/* 7일 차트 */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">최근 7일 타임박스</h3>
            <div className="flex items-end gap-1.5 h-24">
              {days.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 flex-1">
                    {/* 계획 바 */}
                    <div
                      className="flex-1 bg-blue/30 rounded-t-sm transition-all"
                      style={{ height: `${maxMin > 0 ? (day.estimatedMin / maxMin) * 100 : 0}%` }}
                      title={`계획 ${day.estimatedMin}분`}
                    />
                    {/* 실제 바 */}
                    <div
                      className="flex-1 bg-green/40 rounded-t-sm transition-all"
                      style={{ height: `${maxMin > 0 ? (day.actualMin / maxMin) * 100 : 0}%` }}
                      title={`실제 ${day.actualMin}분`}
                    />
                  </div>
                  <span className={`text-[9px] ${day.date === today ? 'text-primary' : 'text-muted'}`}>
                    {formatShortDate(day.date)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue/50" /><span className="text-[10px] text-muted">계획</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green/50" /><span className="text-[10px] text-muted">실제</span></div>
            </div>
          </div>

          {/* 전체 요약 */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">전체</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="전체 완료율" value={allTasks > 0 ? `${Math.round(doneTasks / allTasks * 100)}%` : '-'} color="text-green" />
              <StatCard
                label="계획 정확도"
                value={avgAccuracy !== null ? `${Math.round(avgAccuracy * 100)}%` : '-'}
                color="text-yellow"
                sub="실제/계획 비율"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="bg-base rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted mt-1">{label}</p>
      {sub && <p className="text-[9px] text-muted/60 mt-0.5">{sub}</p>}
    </div>
  )
}
