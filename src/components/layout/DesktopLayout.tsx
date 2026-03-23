import { BrainDumpPanel } from '../brain-dump/BrainDumpPanel'
import { BigThreePanel } from '../big-three/BigThreePanel'
import { TimelineView } from '../calendar/TimelineView'
import { NotePanel } from '../note/NotePanel'

export function DesktopLayout() {
  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="w-64 flex-shrink-0 border-r border-overlay overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <BrainDumpPanel />
        </div>
        <NotePanel />
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
