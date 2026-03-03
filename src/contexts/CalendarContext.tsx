import { createContext, useContext, useState, type ReactNode } from 'react'
import { BASE_SLOT_HEIGHT, TOTAL_SLOTS } from '../utils/timeUtils'

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
const DEFAULT_ZOOM_INDEX = 2 // 1.0x

interface CalendarUIContextValue {
  slotHeight: number
  totalHeight: number
  zoomLevel: number
  canZoomIn: boolean
  canZoomOut: boolean
  zoomIn: () => void
  zoomOut: () => void
  viewMode: 'day' | 'week'
  setViewMode: (mode: 'day' | 'week') => void
}

const CalendarUIContext = createContext<CalendarUIContextValue | null>(null)

export function CalendarUIProvider({ children }: { children: ReactNode }) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  const zoomLevel = ZOOM_LEVELS[zoomIndex]
  const slotHeight = BASE_SLOT_HEIGHT * zoomLevel
  const totalHeight = TOTAL_SLOTS * slotHeight

  return (
    <CalendarUIContext.Provider
      value={{
        slotHeight,
        totalHeight,
        zoomLevel,
        canZoomIn: zoomIndex < ZOOM_LEVELS.length - 1,
        canZoomOut: zoomIndex > 0,
        zoomIn: () => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1)),
        zoomOut: () => setZoomIndex((i) => Math.max(i - 1, 0)),
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </CalendarUIContext.Provider>
  )
}

export function useCalendarUI() {
  const ctx = useContext(CalendarUIContext)
  if (!ctx) throw new Error('useCalendarUI must be used within CalendarUIProvider')
  return ctx
}
