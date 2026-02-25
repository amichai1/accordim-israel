'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Minus, Plus, Play, Pause, Sparkles, Settings2 } from 'lucide-react'
import type { CapoSuggestion } from '@/lib/chordpro/capo'

interface SongControlsProps {
  currentKey: string
  transpose: number
  fontSize: number
  autoScroll: boolean
  scrollSpeed: number
  hasEasyKey: boolean
  isEasyKeyActive: boolean
  capoSuggestions?: CapoSuggestion[]
  onTranspose: (direction: 1 | -1) => void
  onFontSizeChange: (direction: 1 | -1) => void
  onAutoScrollToggle: () => void
  onScrollSpeedChange: (speed: number) => void
  onEasyKey: () => void
}

export default function SongControls({
  currentKey,
  fontSize,
  autoScroll,
  scrollSpeed,
  hasEasyKey,
  isEasyKeyActive,
  capoSuggestions = [],
  onTranspose,
  onFontSizeChange,
  onAutoScrollToggle,
  onScrollSpeedChange,
  onEasyKey,
}: SongControlsProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const bestCapo = capoSuggestions.length > 0 ? capoSuggestions[0] : null

  // Shared button style with min 44px touch target
  const btnBase = "min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded transition-colors"
  const btnDefault = `${btnBase} p-2 sm:p-1 hover:bg-[var(--border)]`
  const btnActive = `${btnBase} p-2 sm:p-1 bg-[var(--primary)] text-white`

  return (
    <div className="space-y-2">
      {/* Desktop controls — inline sticky bar */}
      <div className="hidden sm:flex flex-wrap items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm text-sm">
        {/* Font size */}
        <div className="flex items-center gap-1">
          <button onClick={() => onFontSizeChange(-1)} aria-label="הקטן פונט" disabled={fontSize <= 0} className={`${btnDefault} disabled:opacity-30`}>
            <Minus size={16} />
          </button>
          <span className="w-5 text-center font-bold">A</span>
          <button onClick={() => onFontSizeChange(1)} aria-label="הגדל פונט" disabled={fontSize >= 2} className={`${btnDefault} disabled:opacity-30`}>
            <Plus size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Transpose */}
        <div className="flex items-center gap-1">
          <button onClick={() => onTranspose(-1)} aria-label="הורד חצי טון" className={btnDefault}>
            <ChevronDown size={16} />
          </button>
          <span className="min-w-[2.5rem] text-center font-bold text-[var(--chord)]">{currentKey}</span>
          <button onClick={() => onTranspose(1)} aria-label="העלה חצי טון" className={btnDefault}>
            <ChevronUp size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Easy key */}
        {hasEasyKey && (
          <button
            onClick={onEasyKey}
            aria-label={isEasyKeyActive ? 'חזור לטון מקורי' : 'טון קל'}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${isEasyKeyActive ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'}`}
          >
            <Sparkles size={14} />
            <span className="text-xs font-medium">טון קל</span>
          </button>
        )}

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Auto scroll */}
        <div className="flex items-center gap-2">
          <button onClick={onAutoScrollToggle} aria-label="גלילה אוטומטית" className={autoScroll ? btnActive : btnDefault}>
            {autoScroll ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {autoScroll && (
            <input type="range" min={10} max={100} value={scrollSpeed} onChange={(e) => onScrollSpeedChange(Number(e.target.value))} className="w-20 accent-[var(--primary)]" aria-label="מהירות גלילה" />
          )}
        </div>
      </div>

      {/* Mobile controls — fixed bottom bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md safe-bottom">
        {/* Expanded tray (secondary controls) */}
        {mobileExpanded && (
          <div className="px-4 py-3 border-b border-[var(--border)] animate-slide-down">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--muted)]">גודל פונט</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onFontSizeChange(-1)} disabled={fontSize <= 0} className={`${btnDefault} disabled:opacity-30`}>
                  <Minus size={18} />
                </button>
                <span className="w-6 text-center font-bold text-sm">A</span>
                <button onClick={() => onFontSizeChange(1)} disabled={fontSize >= 2} className={`${btnDefault} disabled:opacity-30`}>
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted)]">מהירות גלילה</span>
              <input type="range" min={10} max={100} value={scrollSpeed} onChange={(e) => onScrollSpeedChange(Number(e.target.value))} className="w-32 accent-[var(--primary)]" aria-label="מהירות גלילה" />
            </div>
          </div>
        )}

        {/* Main bottom bar */}
        <div className="flex items-center justify-around px-2 py-1">
          {/* Transpose down */}
          <button onClick={() => onTranspose(-1)} aria-label="הורד חצי טון" className={btnDefault}>
            <ChevronDown size={20} />
          </button>

          {/* Current key */}
          <span className="min-w-[3rem] text-center font-bold text-[var(--chord)] text-base">{currentKey}</span>

          {/* Transpose up */}
          <button onClick={() => onTranspose(1)} aria-label="העלה חצי טון" className={btnDefault}>
            <ChevronUp size={20} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[var(--border)]" />

          {/* Easy key */}
          {hasEasyKey && (
            <button
              onClick={onEasyKey}
              aria-label={isEasyKeyActive ? 'חזור לטון מקורי' : 'טון קל'}
              className={isEasyKeyActive ? btnActive : btnDefault}
            >
              <Sparkles size={18} />
            </button>
          )}

          {/* Auto scroll */}
          <button onClick={onAutoScrollToggle} aria-label="גלילה אוטומטית" className={autoScroll ? btnActive : btnDefault}>
            {autoScroll ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Expand/collapse secondary controls */}
          <button
            onClick={() => setMobileExpanded(prev => !prev)}
            aria-label={mobileExpanded ? 'סגור הגדרות' : 'עוד הגדרות'}
            className={mobileExpanded ? btnActive : btnDefault}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Capo indicator */}
      {bestCapo && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-xs" role="status">
          <span className="font-semibold text-[var(--primary)]">
            קאפו על שריג {bestCapo.fret}
          </span>
          <span className="text-[var(--muted)]">
            (נגן צורות {bestCapo.shapesKey})
          </span>
          {capoSuggestions.length > 1 && (
            <span className="text-[var(--muted)] hidden sm:inline">
              {' | '}
              {capoSuggestions.slice(1, 3).map((s, i) => (
                <span key={i}>
                  {i > 0 && ', '}שריג {s.fret} ({s.shapesKey})
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
