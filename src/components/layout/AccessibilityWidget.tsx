'use client'

import { useState, useEffect, useRef } from 'react'
import { Accessibility, Plus, Minus, RotateCcw, Contrast } from 'lucide-react'

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontScale, setFontScale] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('a11y')
      if (saved) {
        const { fontScale: fs, highContrast: hc } = JSON.parse(saved)
        if (fs) {
          setFontScale(fs)
          document.documentElement.style.fontSize = `${fs}%`
        }
        if (hc) {
          setHighContrast(true)
          document.documentElement.classList.add('high-contrast')
        }
      }
    } catch {}
  }, [])

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem('a11y', JSON.stringify({ fontScale, highContrast }))
    } catch {}
  }, [fontScale, highContrast])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function changeFontSize(delta: number) {
    const newScale = Math.max(80, Math.min(150, fontScale + delta))
    setFontScale(newScale)
    document.documentElement.style.fontSize = `${newScale}%`
  }

  function toggleHighContrast() {
    setHighContrast(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
      return next
    })
  }

  function resetAll() {
    setFontScale(100)
    setHighContrast(false)
    document.documentElement.style.fontSize = '100%'
    document.documentElement.classList.remove('high-contrast')
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="הגדרות נגישות"
          className="absolute bottom-14 left-0 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-4 w-64"
        >
          <h2 className="font-bold text-sm mb-3">הגדרות נגישות</h2>

          {/* Font size */}
          <div className="mb-3">
            <div className="text-xs text-[var(--muted)] mb-1">גודל גופן ({fontScale}%)</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeFontSize(-10)}
                disabled={fontScale <= 80}
                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-30"
                aria-label="הקטנת גופן"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 bg-[var(--border)] rounded-full h-2">
                <div
                  className="bg-[var(--primary)] rounded-full h-2 transition-all"
                  style={{ width: `${((fontScale - 80) / 70) * 100}%` }}
                />
              </div>
              <button
                onClick={() => changeFontSize(10)}
                disabled={fontScale >= 150}
                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-30"
                aria-label="הגדלת גופן"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* High contrast */}
          <button
            onClick={toggleHighContrast}
            className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-colors mb-3 text-sm ${
              highContrast
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'border-[var(--border)] hover:bg-[var(--border)]'
            }`}
            aria-pressed={highContrast}
          >
            <Contrast size={16} />
            <span>ניגודיות גבוהה</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetAll}
            className="w-full flex items-center gap-2 p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-sm text-[var(--muted)]"
          >
            <RotateCcw size={16} />
            <span>איפוס הגדרות</span>
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className="w-12 h-12 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Accessibility size={24} />
      </button>
    </div>
  )
}
