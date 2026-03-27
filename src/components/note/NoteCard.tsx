import { useState, useRef, useEffect, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNoteStore } from '../../stores/useNoteStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { organizeNoteWithAi } from '../../services/aiService'
import type { NoteColor } from '../../types/note'

const COLOR_MAP: Record<NoteColor, string> = {
  yellow: 'bg-yellow/15 border-yellow/30',
  blue: 'bg-blue/15 border-blue/30',
  green: 'bg-green/15 border-green/30',
  pink: 'bg-red/15 border-red/30',
  purple: 'bg-primary/15 border-primary/30',
}

const COLOR_DOT: Record<NoteColor, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  green: 'bg-green',
  pink: 'bg-red',
  purple: 'bg-primary',
}

const ALL_COLORS: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'purple']

function getHoursAgo(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60)
}

interface Props {
  noteId: string
}

export function NoteCard({ noteId }: Props) {
  const note = useNoteStore((s) => s.notes.find((n) => n.id === noteId))
  const updateNote = useNoteStore((s) => s.updateNote)
  const deleteNote = useNoteStore((s) => s.deleteNote)
  const aiApiKey = useNoteStore((s) => s.aiApiKey)
  const addTask = useTaskStore((s) => s.addTask)

  const [collapsed, setCollapsed] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: noteId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // auto-resize textarea
  useEffect(() => {
    if (!collapsed && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [note?.content, collapsed])

  const handleAiOrganize = useCallback(async () => {
    if (!note || aiLoading) return
    if (!aiApiKey) {
      setAiError('Gemini API 키를 먼저 설정하세요 (설정 아이콘)')
      return
    }
    setAiLoading(true)
    setAiError('')
    try {
      const result = await organizeNoteWithAi(aiApiKey, note.content)
      updateNote(noteId, { content: result.organizedContent })
      for (const task of result.extractedTasks) {
        if (task.trim()) addTask(task.trim())
      }
      setCollapsed(false)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 요청 실패')
    } finally {
      setAiLoading(false)
    }
  }, [note, noteId, aiApiKey, aiLoading, updateNote, addTask])

  if (!note) return null

  const hoursAgo = getHoursAgo(note.createdAt)
  const isStale = hoursAgo >= 48
  const preview = note.content.split('\n')[0]?.slice(0, 40) || '빈 메모'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg border p-3 flex flex-col gap-2 transition-all ${COLOR_MAP[note.color]} ${
        isStale ? 'ring-2 ring-red/50' : ''
      }`}
    >
      {/* 48시간 경과 배지 */}
      {isStale && (
        <div className="absolute -top-2 -right-2 bg-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
          {Math.floor(hoursAgo / 24)}일 전
        </div>
      )}

      {/* 상단 바 */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* 드래그 핸들 */}
          <button
            {...attributes}
            {...listeners}
            className="text-muted/40 hover:text-muted cursor-grab active:cursor-grabbing text-xs px-0.5"
            title="드래그하여 순서 변경"
          >
            ⠿
          </button>

          {/* 접기/펼치기 */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs text-muted hover:text-text transition-colors"
            title={collapsed ? '펼치기' : '접기'}
          >
            {collapsed ? '▸' : '▾'}
          </button>

          {/* 색상 선택 */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker((v) => !v)}
              className={`w-3 h-3 rounded-full ${COLOR_DOT[note.color]}`}
              title="색상 변경"
            />
            {showColorPicker && (
              <div className="absolute top-5 left-0 flex gap-1 bg-surface border border-overlay rounded-lg p-1.5 z-10 shadow-lg">
                {ALL_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { updateNote(noteId, { color: c }); setShowColorPicker(false) }}
                    className={`w-4 h-4 rounded-full ${COLOR_DOT[c]} ${c === note.color ? 'ring-2 ring-text' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 접혀있을 때 미리보기 */}
          {collapsed && (
            <span className="text-xs text-muted truncate">{preview}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* AI 정리 버튼 */}
          <button
            onClick={handleAiOrganize}
            disabled={aiLoading || !note.content.trim()}
            className="text-[10px] px-1.5 py-0.5 rounded text-muted hover:text-text hover:bg-overlay/50 transition-colors disabled:opacity-40"
            title="AI로 메모 정리 + 태스크 추출"
          >
            {aiLoading ? '...' : 'AI'}
          </button>

          {/* 삭제 */}
          <button
            onClick={() => deleteNote(noteId)}
            className="text-[10px] px-1 py-0.5 rounded text-muted hover:text-red hover:bg-red/10 transition-colors"
            title="메모 삭제"
          >
            ×
          </button>
        </div>
      </div>

      {/* AI 에러 */}
      {aiError && (
        <div className="text-[10px] text-red bg-red/10 rounded px-2 py-1">{aiError}</div>
      )}

      {/* 메모 내용 — 접혀있으면 숨김 */}
      {!collapsed && (
        <>
          <textarea
            ref={textareaRef}
            value={note.content}
            onChange={(e) => updateNote(noteId, { content: e.target.value })}
            placeholder="메모를 작성하세요..."
            className="w-full bg-transparent text-text text-xs leading-relaxed resize-none outline-none placeholder:text-muted/50 min-h-[60px]"
            spellCheck={false}
          />

          {/* 시간 정보 */}
          <div className="text-[9px] text-muted/60">
            {new Date(note.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </>
      )}
    </div>
  )
}
