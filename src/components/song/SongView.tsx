'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { parseChordPro } from '@/lib/chordpro/parser'
import { transposeChord } from '@/lib/chordpro/transpose'
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

  const currentKey = useMemo(() => {
    const key = originalKey || parsed.meta.key || '?'
    return transpose !== 0 ? transposeChord(key, transpose) : key
  }, [originalKey, parsed.meta.key, transpose])

  const sections = useMemo(
    () => parsed.sections.map(s => transposeSectionWords(s, transpose)),
    [parsed.sections, transpose]
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
    <div className="mx-auto max-w-3xl px-4 py-6" ref={containerRef}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 text-[var(--muted)] text-sm mt-1">
          <span>{artist}</span>
          <span>•</span>
          <span>סולם: <strong className="text-[var(--chord)]">{currentKey}</strong></span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <SongControls
          currentKey={currentKey}
          transpose={transpose}
          fontSize={fontSize}
          autoScroll={autoScroll}
          scrollSpeed={scrollSpeed}
          onTranspose={(dir) => setTranspose(prev => prev + dir)}
          onFontSizeChange={(dir) => setFontSize(prev => Math.max(0, Math.min(2, prev + dir)))}
          onAutoScrollToggle={() => setAutoScroll(prev => !prev)}
          onScrollSpeedChange={setScrollSpeed}
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
