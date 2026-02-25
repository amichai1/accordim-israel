'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { parseChordPro } from '@/lib/chordpro/parser'
import { transposeChord } from '@/lib/chordpro/transpose'
import { findEasyTranspose } from '@/lib/chordpro/simplify'
import { getCapoSuggestions, type CapoSuggestion } from '@/lib/chordpro/capo'
import ChordLine from './ChordLine'
import SongControls from './SongControls'
import InstrumentSelector from './InstrumentSelector'
import ChordPopup from './ChordPopup'
import type { SongSection, ChordWord } from '@/lib/chordpro/types'
import type { InstrumentType } from '@/lib/chordpro/chordData'

interface SongViewProps {
  content: string
  title: string
  artist: string
  artistSlug?: string
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

export default function SongView({ content, title, artist, artistSlug, originalKey, language = 'he' }: SongViewProps) {
  const [transpose, setTranspose] = useState(0)
  const [fontSize, setFontSize] = useState(1)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(50)
  const [instrument, setInstrument] = useState<InstrumentType>('guitar')
  const [popupChord, setPopupChord] = useState<string | null>(null)
  const [popupAnchor, setPopupAnchor] = useState<DOMRect | null>(null)
  const scrollRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const accumulatorRef = useRef<number>(0)
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

  // Auto-scroll with time-based accumulator for smooth sub-pixel scrolling
  useEffect(() => {
    if (!autoScroll) {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current)
      lastTimeRef.current = 0
      accumulatorRef.current = 0
      return
    }

    function tick(timestamp: number) {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp
      }
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Speed: scrollSpeed ranges 10-100, map to ~20-200 pixels per second
      const pixelsPerSecond = scrollSpeed * 2
      accumulatorRef.current += (pixelsPerSecond * delta) / 1000

      if (accumulatorRef.current >= 1) {
        const px = Math.floor(accumulatorRef.current)
        window.scrollBy(0, px)
        accumulatorRef.current -= px
      }

      scrollRef.current = requestAnimationFrame(tick)
    }

    scrollRef.current = requestAnimationFrame(tick)
    return () => {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current)
    }
  }, [autoScroll, scrollSpeed])

  const handleChordClick = useCallback((chord: string, rect: DOMRect) => {
    if (popupChord === chord) {
      setPopupChord(null)
      setPopupAnchor(null)
    } else {
      setPopupChord(chord)
      setPopupAnchor(rect)
    }
  }, [popupChord])

  const closePopup = useCallback(() => {
    setPopupChord(null)
    setPopupAnchor(null)
  }, [])

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
          {artistSlug ? (
            <a href={`/artists/${artistSlug}`} className="hover:text-[var(--primary)] hover:underline transition-colors">
              {artist}
            </a>
          ) : (
            <span>{artist}</span>
          )}
          <span>•</span>
          <span>סולם: <strong className="text-[var(--chord)]">{currentKey}</strong></span>
        </div>
      </div>

      {/* Instrument selector */}
      <div className="mb-3">
        <InstrumentSelector instrument={instrument} onChange={setInstrument} />
      </div>

      {/* Controls - sticky bar that follows scroll on all screen sizes */}
      <div className="sticky top-14 z-40 -mx-4 px-4 py-2 mb-4 bg-[var(--background)]/80 backdrop-blur-md">
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
              <ChordLine key={li} line={line} onChordClick={handleChordClick} />
            ))}
          </div>
        ))}
      </div>

      {/* Chord popup */}
      {popupChord && (
        <ChordPopup
          chord={popupChord}
          instrument={instrument}
          anchorRect={popupAnchor}
          onClose={closePopup}
        />
      )}
    </div>
  )
}
