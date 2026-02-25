'use client'

import { useEffect, useRef } from 'react'
import ChordDiagram from './ChordDiagram'
import type { InstrumentType } from '@/lib/chordpro/chordData'

interface ChordPopupProps {
  chord: string
  instrument: InstrumentType
  anchorRect: DOMRect | null
  onClose: () => void
}

export default function ChordPopup({ chord, instrument, anchorRect, onClose }: ChordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Position popup near the clicked chord
  useEffect(() => {
    if (!popupRef.current || !anchorRect) return
    const popup = popupRef.current
    const popupRect = popup.getBoundingClientRect()

    let top = anchorRect.bottom + 8
    let left = anchorRect.left + anchorRect.width / 2 - popupRect.width / 2

    // Keep within viewport
    if (left < 8) left = 8
    if (left + popupRect.width > window.innerWidth - 8) {
      left = window.innerWidth - popupRect.width - 8
    }
    if (top + popupRect.height > window.innerHeight - 8) {
      top = anchorRect.top - popupRect.height - 8
    }

    popup.style.position = 'fixed'
    popup.style.top = `${top}px`
    popup.style.left = `${left}px`
  }, [anchorRect])

  const diagramSize = instrument === 'piano' ? 'w-36 h-20' : 'w-24 h-28'

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-3"
      style={{ top: 0, left: 0 }}
    >
      <div className="text-center font-bold text-[var(--chord)] mb-1 text-sm">{chord}</div>
      <div className={diagramSize}>
        <ChordDiagram chord={chord} instrument={instrument} />
      </div>
    </div>
  )
}
