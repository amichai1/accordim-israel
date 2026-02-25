'use client'

import dynamic from 'next/dynamic'
import type { InstrumentType } from '@/lib/chordpro/chordData'
import { pianoChords } from '@/lib/chordpro/chordData'
import { lookupChord } from '@/lib/chordpro/chordLookup'
import type { ChordPosition } from '@/lib/chordpro/chordLookup'

const Chord = dynamic(() => import('@tombatossals/react-chords/lib/Chord'), { ssr: false })

interface ChordDiagramProps {
  chord: string
  instrument: InstrumentType
  voicingIndex?: number
}

function StringedDiagram({ chord, instrument, voicingIndex = 0 }: { chord: string; instrument: 'guitar' | 'ukulele'; voicingIndex: number }) {
  const result = lookupChord(chord, instrument)
  if (!result) return <NoData chord={chord} instrument={instrument === 'guitar' ? 'גיטרה' : 'יוקלילה'} />

  const positions = result.chord.positions
  const idx = voicingIndex % positions.length
  const position: ChordPosition = positions[idx]

  return (
    <Chord
      chord={{
        frets: position.frets,
        fingers: position.fingers,
        baseFret: position.baseFret,
        barres: position.barres,
        capo: position.capo,
      }}
      instrument={{
        strings: result.instrument.strings,
        fretsOnChord: result.instrument.fretsOnChord,
        tunings: result.instrument.tunings,
      }}
      lite={false}
    />
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

  const whiteNotes = [0, 2, 4, 5, 7, 9, 11]
  const blackNotes = [1, 3, 6, 8, 10]
  const blackPositions = [0.7, 1.7, 3.7, 4.7, 5.7]

  const isActive = (note: number) => activeKeys.includes(note)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
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

export function getVoicingCount(chord: string, instrument: InstrumentType): number {
  if (instrument === 'piano') return 1
  const result = lookupChord(chord, instrument)
  return result ? result.chord.positions.length : 0
}

export default function ChordDiagram({ chord, instrument, voicingIndex = 0 }: ChordDiagramProps) {
  switch (instrument) {
    case 'guitar':
    case 'ukulele':
      return <StringedDiagram chord={chord} instrument={instrument} voicingIndex={voicingIndex} />
    case 'piano':
      return <PianoDiagram chord={chord} />
  }
}
