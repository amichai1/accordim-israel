import type { ChordWord as ChordWordType } from '@/lib/chordpro/types'

interface ChordWordProps {
  word: ChordWordType
}

export default function ChordWord({ word }: ChordWordProps) {
  if (!word.chord) {
    return <span className="lyric">{word.text}</span>
  }

  return (
    <span className="chord-word">
      <span className="chord">{word.chord}</span>
      <span className="lyric">{word.text}</span>
    </span>
  )
}
