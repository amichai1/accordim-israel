'use client'

import type { InstrumentType } from '@/lib/chordpro/chordData'
import { guitarChords, ukuleleChords, pianoChords } from '@/lib/chordpro/chordData'

interface ChordDiagramProps {
  chord: string
  instrument: InstrumentType
}

function GuitarDiagram({ chord }: { chord: string }) {
  const data = guitarChords[chord]
  if (!data) return <NoData chord={chord} instrument="גיטרה" />

  const { frets, barreAt, startFret = 0 } = data
  const numStrings = 6
  const numFrets = 4
  const w = 100
  const h = 120
  const padTop = 28
  const padLeft = 20
  const padRight = 10
  const fretH = (h - padTop - 10) / numFrets
  const stringSpacing = (w - padLeft - padRight) / (numStrings - 1)

  // Normalize frets for display
  const displayStart = startFret > 0 ? startFret : 0
  const displayFrets = frets.map(f => {
    if (f <= 0) return f
    return f - displayStart
  })

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {/* Nut or fret number */}
      {displayStart === 0 ? (
        <rect x={padLeft - 2} y={padTop - 3} width={stringSpacing * (numStrings - 1) + 4} height={3} rx={1} fill="currentColor" />
      ) : (
        <text x={padLeft - 14} y={padTop + fretH / 2 + 4} fontSize="9" fill="currentColor" textAnchor="middle" fontWeight="bold">
          {displayStart}
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={padLeft}
          y1={padTop + i * fretH}
          x2={padLeft + stringSpacing * (numStrings - 1)}
          y2={padTop + i * fretH}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeOpacity={0.4}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`str-${i}`}
          x1={padLeft + i * stringSpacing}
          y1={padTop}
          x2={padLeft + i * stringSpacing}
          y2={padTop + numFrets * fretH}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeOpacity={0.5}
        />
      ))}

      {/* Barre */}
      {barreAt !== undefined && (
        <rect
          x={padLeft - 3}
          y={padTop + (barreAt - displayStart - 1) * fretH + fretH / 2 - 4}
          width={stringSpacing * (numStrings - 1) + 6}
          height={8}
          rx={4}
          fill="currentColor"
          opacity={0.8}
        />
      )}

      {/* Finger dots and mute/open markers */}
      {frets.map((fret, i) => {
        const x = padLeft + i * stringSpacing
        if (fret === -1) {
          return (
            <text key={`m-${i}`} x={x} y={padTop - 8} fontSize="10" fill="currentColor" textAnchor="middle" opacity={0.6}>
              ✕
            </text>
          )
        }
        if (fret === 0) {
          return (
            <circle key={`o-${i}`} cx={x} cy={padTop - 10} r={3.5} fill="none" stroke="currentColor" strokeWidth={1.2} />
          )
        }
        const displayFret = displayFrets[i]
        const y = padTop + (displayFret - 1) * fretH + fretH / 2
        return (
          <circle key={`d-${i}`} cx={x} cy={y} r={4} fill="currentColor" />
        )
      })}
    </svg>
  )
}

function UkuleleDiagram({ chord }: { chord: string }) {
  const data = ukuleleChords[chord]
  if (!data) return <NoData chord={chord} instrument="יוקלילה" />

  const { frets } = data
  const numStrings = 4
  const numFrets = 4
  const w = 80
  const h = 120
  const padTop = 28
  const padLeft = 18
  const padRight = 18
  const fretH = (h - padTop - 10) / numFrets
  const stringSpacing = (w - padLeft - padRight) / (numStrings - 1)

  const maxFret = Math.max(...frets.filter(f => f > 0))
  const startFret = maxFret > 4 ? Math.min(...frets.filter(f => f > 0)) - 1 : 0
  const displayFrets = frets.map(f => (f <= 0 ? f : f - startFret))

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {/* Nut or fret number */}
      {startFret === 0 ? (
        <rect x={padLeft - 2} y={padTop - 3} width={stringSpacing * (numStrings - 1) + 4} height={3} rx={1} fill="currentColor" />
      ) : (
        <text x={padLeft - 12} y={padTop + fretH / 2 + 4} fontSize="9" fill="currentColor" textAnchor="middle" fontWeight="bold">
          {startFret}
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={padLeft}
          y1={padTop + i * fretH}
          x2={padLeft + stringSpacing * (numStrings - 1)}
          y2={padTop + i * fretH}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeOpacity={0.4}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`str-${i}`}
          x1={padLeft + i * stringSpacing}
          y1={padTop}
          x2={padLeft + i * stringSpacing}
          y2={padTop + numFrets * fretH}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeOpacity={0.5}
        />
      ))}

      {/* Finger dots and open markers */}
      {frets.map((fret, i) => {
        const x = padLeft + i * stringSpacing
        if (fret === 0) {
          return (
            <circle key={`o-${i}`} cx={x} cy={padTop - 10} r={3.5} fill="none" stroke="currentColor" strokeWidth={1.2} />
          )
        }
        const displayFret = displayFrets[i]
        const y = padTop + (displayFret - 1) * fretH + fretH / 2
        return (
          <circle key={`d-${i}`} cx={x} cy={y} r={4} fill="currentColor" />
        )
      })}
    </svg>
  )
}

function PianoDiagram({ chord }: { chord: string }) {
  const data = pianoChords[chord]
  if (!data) return <NoData chord={chord} instrument="פסנתר" />

  const { keys: activeKeys } = data
  const w = 140
  const h = 80
  const whiteKeyW = w / 7
  const blackKeyW = whiteKeyW * 0.6
  const whiteKeyH = h - 10
  const blackKeyH = whiteKeyH * 0.6

  // Map semitones to white/black positions
  // C=0, D=2, E=4, F=5, G=7, A=9, B=11 are white
  // C#=1, D#=3, F#=6, G#=8, A#=10 are black
  const whiteNotes = [0, 2, 4, 5, 7, 9, 11]
  const blackNotes = [1, 3, 6, 8, 10]
  const blackPositions = [0.7, 1.7, 3.7, 4.7, 5.7] // relative to white key index

  const isActive = (note: number) => activeKeys.includes(note)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {/* White keys */}
      {whiteNotes.map((note, i) => (
        <rect
          key={`w-${i}`}
          x={i * whiteKeyW + 1}
          y={5}
          width={whiteKeyW - 2}
          height={whiteKeyH}
          rx={2}
          fill={isActive(note) ? 'var(--chord)' : 'white'}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeOpacity={0.4}
        />
      ))}

      {/* Black keys */}
      {blackNotes.map((note, i) => (
        <rect
          key={`b-${i}`}
          x={blackPositions[i] * whiteKeyW - blackKeyW / 2 + whiteKeyW / 2}
          y={5}
          width={blackKeyW}
          height={blackKeyH}
          rx={1.5}
          fill={isActive(note) ? 'var(--chord)' : '#1a1a2e'}
          stroke={isActive(note) ? 'var(--chord)' : 'currentColor'}
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />
      ))}
    </svg>
  )
}

function NoData({ chord, instrument }: { chord: string; instrument: string }) {
  return (
    <div className="flex items-center justify-center h-full text-xs text-[var(--muted)] text-center px-2">
      אין דיאגרמה עבור {chord} ב{instrument}
    </div>
  )
}

export default function ChordDiagram({ chord, instrument }: ChordDiagramProps) {
  switch (instrument) {
    case 'guitar':
      return <GuitarDiagram chord={chord} />
    case 'ukulele':
      return <UkuleleDiagram chord={chord} />
    case 'piano':
      return <PianoDiagram chord={chord} />
  }
}
