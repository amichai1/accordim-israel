'use client'

import { useCallback } from 'react'
import type { ChordWord as ChordWordType } from '@/lib/chordpro/types'

interface ChordWordProps {
  word: ChordWordType
  onChordClick?: (chord: string, rect: DOMRect) => void
}

export default function ChordWord({ word, onChordClick }: ChordWordProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (word.chord && onChordClick) {
      const rect = e.currentTarget.getBoundingClientRect()
      onChordClick(word.chord, rect)
    }
  }, [word.chord, onChordClick])

  if (!word.chord) {
    return <span className="lyric">{word.text}</span>
  }

  return (
    <span className="chord-word">
      <span
        className="chord cursor-pointer hover:underline"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            const rect = e.currentTarget.getBoundingClientRect()
            onChordClick?.(word.chord!, rect)
          }
        }}
        aria-label={`הצג דיאגרמה עבור ${word.chord}`}
      >
        {word.chord}
      </span>
      <span className="lyric">{word.text}</span>
    </span>
  )
}
