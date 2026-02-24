'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { parseChordPro } from '@/lib/chordpro/parser'
import { transposeChord } from '@/lib/chordpro/transpose'
import { simplifyChord } from '@/lib/chordpro/simplify'
import { getCapoSuggestions, type CapoSuggestion } from '@/lib/chordpro/capo'
import ChordLine from './ChordLine'
import SongControls from './SongControls'
import type { SongSection, ChordWord } from '@/lib/chordpro/types'

interface SongViewProps {
  content: string
  title: string
  artist: string
  originalKey: string | null
  slug?: string
  language?: string
}

const FONT_SIZES = ['text-sm', 'text-base', 'text-lg']

function transformSectionWords(
  section: SongSection,
  steps: number,
  simplified: boolean,
): SongSection {
  if (steps === 0 && !simplified) return section
  return {
    ...section,
    lines: section.lines.map(line => ({
      ...line,
      words: line.words.map((word: ChordWord) => {
        if (!word.chord) return word
        let chord = steps !== 0 ? transposeChord(word.chord, steps) : word.chord
        if (simplified) chord = simplifyChord(chord)
        return { ...word, chord }
      }),
    })),
  }
}

export default function SongView({ content, title, artist, originalKey, language = 'he' }: SongViewProps) {
  const [transpose, setTranspose] = useState(0)
  const [fontSize, setFontSize] = useState(1)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(50)
  const [simplified, setSimplified] = useState(false)
  const scrollRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = useMemo(() => parseChordPro(content), [content])

  const currentKey = useMemo(() => {
    const key = originalKey || parsed.meta.key || '?'
    let result = transpose !== 0 ? transposeChord(key, transpose) : key
    if (simplified) result = simplifyChord(result)
    return result
  }, [originalKey, parsed.meta.key, transpose, simplified])

  const sections = useMemo(
    () => parsed.sections.map(s => transformSectionWords(s, transpose, simplified)),
    [parsed.sections, transpose, simplified]
  )

  const capoSuggestions: CapoSuggestion[] = useMemo(
    () => getCapoSuggestions(currentKey),
    [currentKey]
  )

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll) {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current)
      return
    }

    const speed = scrollSpeed / 1000

    function tick() {
      window.scrollBy(0, speed)
      scrollRef.current = requestAnimationFrame(tick)
    }

    scrollRef.current = requestAnimationFrame(tick)
    return () => {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current)
    }
  }, [autoScroll, scrollSpeed])

  const dir = language === 'he' ? 'rtl' : 'ltr'

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 animate-fade-in" ref={containerRef}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 text-[var(--muted)] text-sm mt-1">
          <span>{artist}</span>
          <span>•</span>
          <span>סולם: <strong className="text-[var(--chord)]">{currentKey}</strong></span>
        </div>
      </div>

      {/* Controls - sticky below header */}
      <div className="sticky top-14 z-40 -mx-4 px-4 py-2 mb-4 bg-[var(--background)]/80 backdrop-blur-md border-b border-transparent transition-shadow [&:not(:first-child)]:border-[var(--border)]/50 shadow-sm">
        <SongControls
          currentKey={currentKey}
          transpose={transpose}
          fontSize={fontSize}
          autoScroll={autoScroll}
          scrollSpeed={scrollSpeed}
          simplified={simplified}
          onTranspose={(dir) => setTranspose(prev => prev + dir)}
          onFontSizeChange={(dir) => setFontSize(prev => Math.max(0, Math.min(2, prev + dir)))}
          onAutoScrollToggle={() => setAutoScroll(prev => !prev)}
          onScrollSpeedChange={setScrollSpeed}
          onSimplifiedToggle={() => setSimplified(prev => !prev)}
          capoSuggestions={capoSuggestions}
        />
      </div>

      {/* Song content */}
      <div className={`${FONT_SIZES[fontSize]} leading-relaxed`} dir={dir}>
        {sections.map((section, si) => (
          <div key={si} className="mb-4">
            {section.label && (
              <div className="section-label">
                {section.type === 'comment' ? section.label : `── ${section.label} ──`}
              </div>
            )}
            {section.lines.map((line, li) => (
              <ChordLine key={li} line={line} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
