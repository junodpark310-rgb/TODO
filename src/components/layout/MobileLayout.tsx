import { useState } from 'react'
import { BrainDumpPanel } from '../brain-dump/BrainDumpPanel'
import { BigThreePanel } from '../big-three/BigThreePanel'
import { TimelineView } from '../calendar/TimelineView'

type Tab = 'dump' | 'timeline'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dump', label: '덤프', icon: '📋' },
  { id: 'timeline', label: '타임라인', icon: '⏱' },
]

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')

  return (
    <>
      <main className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'dump' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Big 3 — 자연 높이 (3슬롯 고정) */}
            <BigThreePanel compact />
            <div className="border-t border-overlay flex-shrink-0" />
            {/* Brain Dump — 나머지 공간 */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <BrainDumpPanel />
            </div>
          </div>
        )}
        {activeTab === 'timeline' && <TimelineView />}
      </main>

      {/* 하단 탭 바 */}
      <nav className="flex items-center border-t border-overlay bg-surface flex-shrink-0 safe-bottom">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
              activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-subtext'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
