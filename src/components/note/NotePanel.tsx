import { useState, useEffect, useCallback } from 'react'
import { useNoteStore } from '../../stores/useNoteStore'
import { NoteCard } from './NoteCard'

/** 48시간 경과 메모 수를 반환 */
function countStaleNotes(notes: { createdAt: string }[]): number {
  const threshold = Date.now() - 48 * 60 * 60 * 1000
  return notes.filter((n) => new Date(n.createdAt).getTime() < threshold).length
}

export function NotePanel() {
  const notes = useNoteStore((s) => s.notes)
  const addNote = useNoteStore((s) => s.addNote)
  const aiApiKey = useNoteStore((s) => s.aiApiKey)
  const setAiApiKey = useNoteStore((s) => s.setAiApiKey)

  const [isOpen, setIsOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(aiApiKey)

  // 48시간 경과 메모 브라우저 알림
  useEffect(() => {
    const staleCount = countStaleNotes(notes)
    if (staleCount === 0) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timebox 메모 알림', {
        body: `${staleCount}개의 메모가 48시간 이상 경과했습니다. 확인해주세요!`,
        icon: '⏱',
      })
    }
  }, []) // 앱 시작 시 1회

  const handleAddNote = useCallback(() => {
    addNote()
  }, [addNote])

  const handleSaveApiKey = useCallback(() => {
    setAiApiKey(apiKeyInput.trim())
    setShowSettings(false)
  }, [apiKeyInput, setAiApiKey])

  const staleCount = countStaleNotes(notes)

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-overlay">
      {/* 헤더 */}
      <div className="flex items-center px-4 py-2.5 flex-shrink-0">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-left hover:bg-overlay/30 transition-colors flex-1 min-w-0"
        >
          <span className="text-xs text-muted">{isOpen ? '▾' : '▸'}</span>
          <span className="text-sm font-semibold text-subtext uppercase tracking-wider">
            메모장
          </span>
          {!isOpen && notes.length > 0 && (
            <span className="text-xs text-muted ml-auto">
              {notes.length}개
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 ml-2">
          {/* 48시간 경과 배지 */}
          {staleCount > 0 && (
            <span className="text-[10px] bg-red/20 text-red px-1.5 py-0.5 rounded-full font-medium">
              {staleCount} 오래됨
            </span>
          )}

          {/* AI 설정 */}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`text-xs px-1.5 py-1 rounded transition-colors ${
              aiApiKey ? 'text-green' : 'text-muted hover:text-text hover:bg-overlay/50'
            }`}
            title="AI API 키 설정"
          >
            {aiApiKey ? '⚡' : '⚙'}
          </button>

          {/* 새 메모 추가 */}
          {isOpen && (
            <button
              onClick={handleAddNote}
              className="text-xs px-2 py-1 rounded text-muted hover:text-text hover:bg-overlay/50 transition-colors flex-shrink-0"
              title="새 메모 추가"
            >
              + 메모
            </button>
          )}
        </div>
      </div>

      {/* AI API 키 설정 패널 */}
      {showSettings && (
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 items-center">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="OpenAI API Key (sk-...)"
              className="flex-1 text-xs px-2 py-1.5 bg-overlay/30 border border-overlay rounded text-text placeholder:text-muted/50 outline-none focus:border-primary"
            />
            <button
              onClick={handleSaveApiKey}
              className="text-xs px-2 py-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
            >
              저장
            </button>
          </div>
          <p className="text-[9px] text-muted mt-1">
            AI 정리 기능에 사용됩니다. 키는 로컬에만 저장됩니다.
          </p>
        </div>
      )}

      {/* 메모 목록 */}
      {isOpen && (
        <div className="flex-1 min-h-0 px-3 pb-3 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted/60 mb-2">메모가 없습니다</p>
              <button
                onClick={handleAddNote}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                + 첫 메모 작성하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  noteId={note.id}
                  onClose={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
