'use client'

import { ChevronUp, ChevronDown, Minus, Plus, Play, Pause, Sparkles } from 'lucide-react'

interface SongControlsProps {
  currentKey: string
  transpose: number
  fontSize: number
  autoScroll: boolean
  scrollSpeed: number
  simplified: boolean
  onTranspose: (direction: 1 | -1) => void
  onFontSizeChange: (direction: 1 | -1) => void
  onAutoScrollToggle: () => void
  onScrollSpeedChange: (speed: number) => void
  onSimplifiedToggle: () => void
}

export default function SongControls({
  currentKey,
  fontSize,
  autoScroll,
  scrollSpeed,
  simplified,
  onTranspose,
  onFontSizeChange,
  onAutoScrollToggle,
  onScrollSpeedChange,
  onSimplifiedToggle,
}: SongControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm text-sm">
      {/* Font size */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onFontSizeChange(-1)}
          aria-label="הקטן פונט"
          disabled={fontSize <= 0}
          className="p-1 rounded hover:bg-[var(--border)] transition-colors disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span className="w-5 text-center font-bold">A</span>
        <button
          onClick={() => onFontSizeChange(1)}
          aria-label="הגדל פונט"
          disabled={fontSize >= 2}
          className="p-1 rounded hover:bg-[var(--border)] transition-colors disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-[var(--border)]" />

      {/* Transpose */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onTranspose(-1)}
          aria-label="הורד חצי טון"
          className="p-1 rounded hover:bg-[var(--border)] transition-colors"
        >
          <ChevronDown size={16} />
        </button>
        <span className="min-w-[2.5rem] text-center font-bold text-[var(--chord)]">
          {currentKey}
        </span>
        <button
          onClick={() => onTranspose(1)}
          aria-label="העלה חצי טון"
          className="p-1 rounded hover:bg-[var(--border)] transition-colors"
        >
          <ChevronUp size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-[var(--border)]" />

      {/* Simplify toggle */}
      <button
        onClick={onSimplifiedToggle}
        aria-label={simplified ? 'הצג אקורדים מקוריים' : 'פשט אקורדים'}
        title={simplified ? 'אקורדים מקוריים' : 'גרסה קלה'}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          simplified
            ? 'bg-[var(--primary)] text-white'
            : 'hover:bg-[var(--border)]'
        }`}
      >
        <Sparkles size={14} />
        <span className="text-xs font-medium">קל</span>
      </button>

      <div className="w-px h-6 bg-[var(--border)]" />

      {/* Auto scroll */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAutoScrollToggle}
          aria-label="גלילה אוטומטית"
          className={`p-1 rounded transition-colors ${autoScroll ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'}`}
        >
          {autoScroll ? <Pause size={16} /> : <Play size={16} />}
        </button>
        {autoScroll && (
          <input
            type="range"
            min={10}
            max={100}
            value={scrollSpeed}
            onChange={(e) => onScrollSpeedChange(Number(e.target.value))}
            className="w-20 accent-[var(--primary)]"
            aria-label="מהירות גלילה"
          />
        )}
      </div>
    </div>
  )
}
