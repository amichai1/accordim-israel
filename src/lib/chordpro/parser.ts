import type { ChordWord, SongLine, SongSection, SongMeta, ParsedSong } from './types'

export function parseChordLine(line: string): ChordWord[] {
  const words: ChordWord[] = []
  const regex = /\[([^\]]+)\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(line)) !== null) {
    // Text before this chord (if any, and if it's not at the very start)
    if (match.index > lastIndex) {
      const textBefore = line.slice(lastIndex, match.index)
      if (words.length > 0) {
        // Append to the previous word's text
        words[words.length - 1].text += textBefore
      } else {
        // Text before the first chord
        words.push({ text: textBefore })
      }
    }

    const chord = match[1]
    words.push({ chord, text: '' })
    lastIndex = regex.lastIndex
  }

  // Remaining text after last chord
  if (lastIndex < line.length) {
    const remaining = line.slice(lastIndex)
    if (words.length > 0) {
      words[words.length - 1].text += remaining
    } else {
      words.push({ text: remaining })
    }
  }

  // If line is empty
  if (words.length === 0) {
    words.push({ text: '' })
  }

  return words
}

function isChordOnlyLine(words: ChordWord[]): boolean {
  return words.every(w => {
    const text = w.text.trim()
    return (w.chord && text === '') || (!w.chord && text === '')
  })
}

function parseDirective(line: string): { name: string; value: string } | null {
  const match = line.match(/^\{(\w+)(?::?\s*(.*))?\}$/)
  if (!match) return null
  return { name: match[1], value: (match[2] || '').trim() }
}

export function parseChordPro(input: string): ParsedSong {
  const lines = input.split('\n')
  const meta: SongMeta = {}
  const sections: SongSection[] = []
  let currentSection: SongSection | null = null

  function pushCurrentSection() {
    if (currentSection && currentSection.lines.length > 0) {
      sections.push(currentSection)
      currentSection = null
    }
  }

  function ensureSection(type: SongSection['type'] = 'none') {
    if (!currentSection) {
      currentSection = { type, lines: [] }
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Empty line
    if (line === '') {
      if (currentSection && currentSection.type === 'none') {
        pushCurrentSection()
      }
      continue
    }

    // Directive
    const directive = parseDirective(line)
    if (directive) {
      switch (directive.name) {
        case 'title':
          meta.title = directive.value
          break
        case 'artist':
          meta.artist = directive.value
          break
        case 'key':
          meta.key = directive.value
          break
        case 'soc':
          pushCurrentSection()
          currentSection = { type: 'chorus', label: directive.value || undefined, lines: [] }
          break
        case 'eoc':
          pushCurrentSection()
          break
        case 'sov':
          pushCurrentSection()
          currentSection = { type: 'verse', label: directive.value || undefined, lines: [] }
          break
        case 'eov':
          pushCurrentSection()
          break
        case 'comment':
          pushCurrentSection()
          currentSection = { type: 'comment', label: directive.value, lines: [] }
          break
      }
      continue
    }

    // Content line
    ensureSection()
    const words = parseChordLine(line)
    const hasChords = words.some(w => w.chord)
    const lineType: SongLine['type'] = hasChords && isChordOnlyLine(words) ? 'chord-only' : hasChords ? 'line' : 'line'

    currentSection!.lines.push({ type: lineType, words })
  }

  pushCurrentSection()

  return { meta, sections }
}
