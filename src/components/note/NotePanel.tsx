import { useState, useRef, useEffect, useCallback } from 'react'
import { useNoteStore } from '../../stores/useNoteStore'
import { useTaskStore } from '../../stores/useTaskStore'

function getSelectedOrCurrentLine(textarea: HTMLTextAreaElement): string | null {
  const { selectionStart, selectionEnd, value } = textarea

  // 텍스트가 선택된 경우: 선택된 텍스트 사용
  if (selectionStart !== selectionEnd) {
    return value.slice(selectionStart, selectionEnd).trim()
  }

  // 선택 없으면: 커서가 위치한 줄 전체 사용
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const lineEnd = value.indexOf('\n', selectionStart)
  return value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd).trim()
}

export function NotePanel() {
  const addTask = useTaskStore((s) => s.addTask)
  const getNote = useNoteStore((s) => s.getNote)
  const setNote = useNoteStore((s) => s.setNote)

  const [isOpen, setIsOpen] = useState(true)
  const [flash, setFlash] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const content = getNote()

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [content, isOpen])

  const handleAddTask = useCallback(() => {
    if (!textareaRef.current) return
    const text = getSelectedOrCurrentLine(textareaRef.current)
    if (!text) return

    addTask(text)

    // 추가 성공 피드백
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
  }, [addTask])

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-overlay">
      <div className="flex items-center px-4 py-2.5 flex-shrink-0">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-left hover:bg-overlay/30 transition-colors flex-1 min-w-0"
        >
          <span className="text-xs text-muted">{isOpen ? '▾' : '▸'}</span>
          <span className="text-sm font-semibold text-subtext uppercase tracking-wider">
            메모장
          </span>
          {!isOpen && content.length > 0 && (
            <span className="text-xs text-muted ml-auto truncate max-w-[100px]">
              {content.split('\n')[0]}
            </span>
          )}
        </button>

        {isOpen && (
          <button
            onClick={handleAddTask}
            className={`ml-2 text-xs px-2 py-1 rounded transition-colors flex-shrink-0 ${
              flash
                ? 'bg-green/20 text-green'
                : 'text-muted hover:text-text hover:bg-overlay/50'
            }`}
            title="선택한 텍스트 또는 현재 줄을 태스크로 추가"
          >
            {flash ? '✓ 추가됨' : '+ 태스크'}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="flex-1 min-h-0 px-3 pb-3 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setNote(e.target.value)}
            placeholder="미팅 노트, 메모 등을 자유롭게 작성하세요..."
            className="w-full min-h-[200px] h-full bg-transparent text-text text-sm leading-relaxed resize-none outline-none placeholder:text-muted/50"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  )
}
