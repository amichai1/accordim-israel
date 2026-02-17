import { describe, it, expect } from 'vitest'
import { parseChordPro, parseChordLine } from '@/lib/chordpro/parser'

describe('parseChordLine', () => {
  it('parses a line with chords and Hebrew text', () => {
    const result = parseChordLine('[Am]שמעתי שיש [C]אקורד סודי')
    expect(result).toEqual([
      { chord: 'Am', text: 'שמעתי שיש ' },
      { chord: 'C', text: 'אקורד סודי' },
    ])
  })

  it('parses a line with chords and English text', () => {
    const result = parseChordLine('[G]Hello [Am]world')
    expect(result).toEqual([
      { chord: 'G', text: 'Hello ' },
      { chord: 'Am', text: 'world' },
    ])
  })

  it('parses text without chords', () => {
    const result = parseChordLine('שורה ללא אקורדים')
    expect(result).toEqual([
      { text: 'שורה ללא אקורדים' },
    ])
  })

  it('parses chord-only line', () => {
    const result = parseChordLine('[Am] [C] [G]')
    expect(result).toEqual([
      { chord: 'Am', text: ' ' },
      { chord: 'C', text: ' ' },
      { chord: 'G', text: '' },
    ])
  })

  it('handles text before first chord', () => {
    const result = parseChordLine('כן [Am]שמעתי')
    expect(result).toEqual([
      { text: 'כן ' },
      { chord: 'Am', text: 'שמעתי' },
    ])
  })

  it('handles complex chords like Dm7, F#m, Bb', () => {
    const result = parseChordLine('[Dm7]hello [F#m]world [Bb]!')
    expect(result).toEqual([
      { chord: 'Dm7', text: 'hello ' },
      { chord: 'F#m', text: 'world ' },
      { chord: 'Bb', text: '!' },
    ])
  })

  it('handles consecutive chords without text', () => {
    const result = parseChordLine('[C][G]שיר')
    expect(result).toEqual([
      { chord: 'C', text: '' },
      { chord: 'G', text: 'שיר' },
    ])
  })
})

describe('parseChordPro', () => {
  it('parses metadata directives', () => {
    const input = `{title: הללויה}
{artist: Leonard Cohen}
{key: Am}`
    const result = parseChordPro(input)
    expect(result.meta).toEqual({
      title: 'הללויה',
      artist: 'Leonard Cohen',
      key: 'Am',
    })
  })

  it('parses a simple song with one section', () => {
    const input = `{title: שיר}

[Am]שמעתי שיש [C]אקורד סודי
[Am]שדוד היה [C]מנגן`
    const result = parseChordPro(input)
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].type).toBe('none')
    expect(result.sections[0].lines).toHaveLength(2)
  })

  it('parses chorus sections', () => {
    const input = `{soc: פזמון}
[F]הללויה [Am]הללויה
{eoc}`
    const result = parseChordPro(input)
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].type).toBe('chorus')
    expect(result.sections[0].label).toBe('פזמון')
    expect(result.sections[0].lines).toHaveLength(1)
  })

  it('parses verse sections', () => {
    const input = `{sov: בית 1}
[Am]שורה ראשונה
[C]שורה שנייה
{eov}`
    const result = parseChordPro(input)
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].type).toBe('verse')
    expect(result.sections[0].label).toBe('בית 1')
  })

  it('parses comment directives', () => {
    const input = `{comment: פתיח}
[Am] [C] [G] [Am]`
    const result = parseChordPro(input)
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].type).toBe('comment')
    expect(result.sections[0].label).toBe('פתיח')
  })

  it('handles mixed sections', () => {
    const input = `{title: שיר מעורב}
{key: Am}

[Am]בית ראשון [C]שורה

{soc: פזמון}
[F]הללויה
{eoc}

[Am]בית שני`
    const result = parseChordPro(input)
    expect(result.meta.title).toBe('שיר מעורב')
    expect(result.sections.length).toBeGreaterThanOrEqual(3)
  })

  it('handles empty lines between sections', () => {
    const input = `[Am]שורה ראשונה

[C]שורה שנייה`
    const result = parseChordPro(input)
    // Empty lines should separate content but not create invalid data
    const allLines = result.sections.flatMap(s => s.lines)
    const nonEmptyLines = allLines.filter(l => l.type !== 'empty')
    expect(nonEmptyLines).toHaveLength(2)
  })

  it('identifies chord-only lines', () => {
    const input = `[Am] [C] [G]`
    const result = parseChordPro(input)
    const line = result.sections[0].lines[0]
    expect(line.type).toBe('chord-only')
  })

  it('handles soc/sov without labels', () => {
    const input = `{soc}
[Am]שורה
{eoc}`
    const result = parseChordPro(input)
    expect(result.sections[0].type).toBe('chorus')
  })

  it('parses a full song correctly', () => {
    const input = `{title: הללויה}
{artist: Leonard Cohen}
{key: C}

[Am]שמעתי שיש [C]אקורד סודי
[Am]שדוד היה מנגן [C]וזה מצא חן בעיני
[F]אבל אתה לא [G]ממש בעניין של [C]מוזיקה [G]נכון

{soc: פזמון}
[F]הללויה [Am]הללויה
[F]הללויה [C]הללו[G]יה
{eoc}`
    const result = parseChordPro(input)
    expect(result.meta.title).toBe('הללויה')
    expect(result.meta.artist).toBe('Leonard Cohen')
    expect(result.meta.key).toBe('C')

    const chorusSections = result.sections.filter(s => s.type === 'chorus')
    expect(chorusSections).toHaveLength(1)
    expect(chorusSections[0].lines).toHaveLength(2)
  })
})
