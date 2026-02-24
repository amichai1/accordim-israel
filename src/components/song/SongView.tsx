'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { parseChordPro } from '@/lib/chordpro/parser'
import { transposeChord } from '@/lib/chordpro/transpose'
import { findEasyTranspose } from '@/lib/chordpro/simplify'
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

function transposeSectionWords(section: SongSection, steps: number): SongSection {
  if (steps === 0) return section
  return {
    ...section,
    lines: section.lines.map(line => ({
      ...line,
      words: line.words.map((word: ChordWord) => ({
        ...word,
        chord: word.chord ? transposeChord(word.chord, steps) : undefined,
      })),
    })),
  }
}

export default function SongView({ content, title, artist, originalKey, language = 'he' }: SongViewProps) {
  const [transpose, setTranspose] = useState(0)
  const [fontSize, setFontSize] = useState(1)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(50)
  const scrollRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = useMemo(() => parseChordPro(content), [content])

  // Collect all chords from the song for easy-key analysis
  const allChords = useMemo(() => {
    const chords: string[] = []
    for (const section of parsed.sections) {
      for (const line of section.lines) {
        for (const word of line.words) {
          if (word.chord) chords.push(word.chord)
        }
      }
    }
    return chords
  }, [parsed.sections])

  // Calculate the easy transpose offset
  const easyTranspose = useMemo(() => findEasyTranspose(allChords), [allChords])

  const currentKey = useMemo(() => {
    const key = originalKey || parsed.meta.key || '?'
    return transpose !== 0 ? transposeChord(key, transpose) : key
  }, [originalKey, parsed.meta.key, transpose])

  const sections = useMemo(
    () => parsed.sections.map(s => transposeSectionWords(s, transpose)),
    [parsed.sections, transpose]
  )

  // Capo suggestions — only when transposed away from original
  const capoSuggestions: CapoSuggestion[] = useMemo(
    () => transpose !== 0 ? getCapoSuggestions(currentKey) : [],
    [currentKey, transpose]
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

  function handleEasyKey() {
    if (easyTranspose === 0) return
    // Toggle: if already at easy key, go back to original
    setTranspose(prev => prev === easyTranspose ? 0 : easyTranspose)
  }

  const dir = language === 'he' ? 'rtl' : 'ltr'
  const isEasyKeyActive = easyTranspose !== 0 && transpose === easyTranspose

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

      {/* Controls - sticky on desktop, fixed bottom on mobile (handled inside SongControls) */}
      <div className="sm:sticky sm:top-14 sm:z-40 sm:-mx-4 sm:px-4 sm:py-2 mb-4 sm:bg-[var(--background)]/80 sm:backdrop-blur-md sm:shadow-sm">
        <SongControls
          currentKey={currentKey}
          transpose={transpose}
          fontSize={fontSize}
          autoScroll={autoScroll}
          scrollSpeed={scrollSpeed}
          hasEasyKey={easyTranspose !== 0}
          isEasyKeyActive={isEasyKeyActive}
          onTranspose={(dir) => setTranspose(prev => prev + dir)}
          onFontSizeChange={(dir) => setFontSize(prev => Math.max(0, Math.min(2, prev + dir)))}
          onAutoScrollToggle={() => setAutoScroll(prev => !prev)}
          onScrollSpeedChange={setScrollSpeed}
          onEasyKey={handleEasyKey}
          capoSuggestions={capoSuggestions}
        />
      </div>

      {/* Song content — extra bottom padding on mobile for fixed bottom bar */}
      <div className={`${FONT_SIZES[fontSize]} leading-relaxed pb-20 sm:pb-0`} dir={dir}>
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
