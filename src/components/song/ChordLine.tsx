'use client'

import type { SongLine, ChordWord as ChordWordType } from '@/lib/chordpro/types'

interface ChordLineProps {
  line: SongLine
  onChordClick?: (chord: string, rect: DOMRect) => void
}

type Segment =
  | { type: 'text'; text: string }
  | { type: 'group'; words: ChordWordType[] }

/**
 * Groups chord-words into segments that respect word boundaries.
 *
 * 1. Splits chord-words whose text contains spaces so the chord stays
 *    only above the first word.
 * 2. Groups consecutive items with no space between them into a
 *    "word-group" that won't break across lines.
 * 3. Plain text between groups wraps normally at spaces.
 */
function buildSegments(words: ChordWordType[]): Segment[] {
  // Step 1 — split chord-words with internal spaces
  const atoms: ChordWordType[] = []
  for (const w of words) {
    const text = w.text || ''
    if (w.chord && text.includes(' ')) {
      const idx = text.indexOf(' ')
      atoms.push({ chord: w.chord, text: text.slice(0, idx) })
      atoms.push({ text: text.slice(idx) })
    } else {
      atoms.push(w)
    }
  }

  // Step 2 — group by word boundaries
  const segments: Segment[] = []
  let group: ChordWordType[] = []

  const flush = () => {
    if (group.length === 0) return
    if (!group.some(w => w.chord) && group.length === 1) {
      segments.push({ type: 'text', text: group[0].text })
    } else {
      segments.push({ type: 'group', words: [...group] })
    }
    group = []
  }

  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i]
    const text = atom.text || ''
    const next = atoms[i + 1]
    const connectsToNext =
      !!next && !/\s$/.test(text) && !/^\s/.test(next.text || '')

    // Plain text with spaces that connects to the next atom:
    // split at last space so only the tail joins the group.
    if (!atom.chord && text.includes(' ') && connectsToNext) {
      const lastSpace = text.lastIndexOf(' ')
      flush()
      segments.push({ type: 'text', text: text.slice(0, lastSpace + 1) })
      group = [{ text: text.slice(lastSpace + 1) }]
      continue
    }

    // Check space boundary with previous item in group
    if (group.length > 0) {
      const prev = group[group.length - 1]
      if (/\s$/.test(prev.text || '') || /^\s/.test(text)) {
        flush()
      }
    }
    group.push(atom)
  }
  flush()

  return segments
}

export default function ChordLine({ line, onChordClick }: ChordLineProps) {
  const segments = buildSegments(line.words)

  return (
    <div className="song-line my-0.5">
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return (
            <span key={i} className="lyric">
              {seg.text}
            </span>
          )
        }
        // Word-group: all items rendered as chord-words for consistent height.
        return (
          <span key={i} className="word-group">
            {seg.words.map((w, j) => (
              <span key={j} className="chord-word">
                {w.chord ? (
                  <span
                    className="chord chord-clickable"
                    onClick={(e) => {
                      if (onChordClick) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        onChordClick(w.chord!, rect)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        const rect = e.currentTarget.getBoundingClientRect()
                        onChordClick?.(w.chord!, rect)
                      }
                    }}
                    aria-label={`הצג דיאגרמה עבור ${w.chord}`}
                  >
                    {w.chord}
                  </span>
                ) : (
                  <span className="chord invisible">
                    {'\u00A0'}
                  </span>
                )}
                <span className="lyric">{w.text}</span>
              </span>
            ))}
          </span>
        )
      })}
    </div>
  )
}
