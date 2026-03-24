import { useState, useRef, useEffect } from 'react'
import { useNoteStore } from '../../stores/useNoteStore'

export function NotePanel() {
  const getNote = useNoteStore((s) => s.getNote)
  const setNote = useNoteStore((s) => s.setNote)

  const [isOpen, setIsOpen] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const content = getNote()

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [content, isOpen])

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-overlay">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 text-left hover:bg-overlay/30 transition-colors flex-shrink-0"
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
