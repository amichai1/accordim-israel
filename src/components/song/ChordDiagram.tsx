'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Guitar } from 'lucide-react'
import { lookupChord, type InstrumentType, type ChordLookupResult } from '@/lib/chordpro/chordLookup'

// Dynamic import for the CommonJS react-chords library
import ChordSvg from '@tombatossals/react-chords/lib/Chord'

interface ChordDiagramProps {
  chordName: string
  onClose: () => void
}

const INSTRUMENTS: { key: InstrumentType; label: string }[] = [
  { key: 'guitar', label: 'גיטרה' },
  { key: 'ukulele', label: 'יוקללה' },
]

export default function ChordDiagram({ chordName, onClose }: ChordDiagramProps) {
  const [instrument, setInstrument] = useState<InstrumentType>('guitar')
  const [voicingIndex, setVoicingIndex] = useState(0)
  const popupRef = useRef<HTMLDivElement>(null)

  const result: ChordLookupResult | null = lookupChord(chordName, instrument)

  // Reset voicing index when instrument changes
  useEffect(() => {
    setVoicingIndex(0)
  }, [instrument])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const positions = result?.chord.positions ?? []
  const totalVoicings = positions.length

  const goNext = useCallback(() => {
    setVoicingIndex((i) => (i + 1) % totalVoicings)
  }, [totalVoicings])

  const goPrev = useCallback(() => {
    setVoicingIndex((i) => (i - 1 + totalVoicings) % totalVoicings)
  }, [totalVoicings])

  const currentPosition = positions[voicingIndex]

  return (
    <div className="chord-diagram-popup" ref={popupRef}>
      <div className="chord-diagram-header">
        <span className="chord-diagram-title">{chordName}</span>
        <button className="chord-diagram-close" onClick={onClose} aria-label="סגור">
          <X size={16} />
        </button>
      </div>

      <div className="chord-diagram-tabs">
        {INSTRUMENTS.map((inst) => (
          <button
            key={inst.key}
            className={`chord-diagram-tab ${instrument === inst.key ? 'active' : ''}`}
            onClick={() => setInstrument(inst.key)}
          >
            {inst.label}
          </button>
        ))}
      </div>

      <div className="chord-diagram-body">
        {result && currentPosition ? (
          <>
            <div className="chord-diagram-svg">
              <ChordSvg
                chord={currentPosition}
                instrument={{
                  strings: result.instrument.strings,
                  fretsOnChord: result.instrument.fretsOnChord,
                  tunings: result.instrument.tunings,
                }}
                lite={false}
              />
            </div>

            {totalVoicings > 1 && (
              <div className="chord-diagram-nav">
                <button onClick={goPrev} aria-label="תצורה קודמת">
                  <ChevronRight size={18} />
                </button>
                <span className="chord-diagram-voicing-info">
                  {voicingIndex + 1} / {totalVoicings}
                </span>
                <button onClick={goNext} aria-label="תצורה הבאה">
                  <ChevronLeft size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="chord-diagram-not-found">
            <Guitar size={24} />
            <span>לא נמצאה דיאגרמה עבור {chordName}</span>
          </div>
        )}
      </div>
    </div>
  )
}
