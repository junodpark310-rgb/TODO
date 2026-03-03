import { useState, useRef } from 'react'
import { useTaskStore } from '../../stores/useTaskStore'

export function BrainDumpInput() {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const addTask = useTaskStore((s) => s.addTask)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) {
      addTask(value)
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-overlay rounded-lg border border-muted focus-within:border-primary transition-colors">
      <span className="text-muted text-lg select-none">+</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="할 일 입력 후 Enter..."
        autoFocus
        className="flex-1 bg-transparent text-text placeholder-muted outline-none text-sm"
      />
    </div>
  )
}
