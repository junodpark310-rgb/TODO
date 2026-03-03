import { BrainDumpPanel } from '../brain-dump/BrainDumpPanel'
import { BigThreePanel } from '../big-three/BigThreePanel'
import { TimelineView } from '../calendar/TimelineView'

export function DesktopLayout() {
  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="w-64 flex-shrink-0 border-r border-overlay overflow-hidden">
        <BrainDumpPanel />
      </div>
      <div className="w-60 flex-shrink-0 border-r border-overlay overflow-hidden">
        <BigThreePanel />
      </div>
      <div className="flex-1 overflow-hidden">
        <TimelineView />
      </div>
    </main>
  )
}
