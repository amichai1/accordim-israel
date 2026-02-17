import { describe, it, expect } from 'vitest'
import { transposeChord, transposeSong } from '@/lib/chordpro/transpose'

describe('transposeChord', () => {
  it('transposes C up by 1 half step', () => {
    expect(transposeChord('C', 1)).toBe('C#')
  })

  it('transposes C up by 2 half steps', () => {
    expect(transposeChord('C', 2)).toBe('D')
  })

  it('transposes B up by 1 (wraps to C)', () => {
    expect(transposeChord('B', 1)).toBe('C')
  })

  it('transposes C down by 1 half step', () => {
    expect(transposeChord('C', -1)).toBe('B')
  })

  it('transposes Am up by 1', () => {
    expect(transposeChord('Am', 1)).toBe('A#m')
  })

  it('transposes F#m up by 1', () => {
    expect(transposeChord('F#m', 1)).toBe('Gm')
  })

  it('transposes Bb down by 1', () => {
    expect(transposeChord('Bb', -1)).toBe('A')
  })

  it('transposes Dm7 up by 2', () => {
    expect(transposeChord('Dm7', 2)).toBe('Em7')
  })

  it('transposes Cmaj7 up by 1', () => {
    expect(transposeChord('Cmaj7', 1)).toBe('C#maj7')
  })

  it('transposes G#dim up by 1', () => {
    expect(transposeChord('G#dim', 1)).toBe('Adim')
  })

  it('transposes by 0 returns same chord', () => {
    expect(transposeChord('Am', 0)).toBe('Am')
  })

  it('transposes by full octave (12) returns same chord', () => {
    expect(transposeChord('Am', 12)).toBe('Am')
  })

  it('transposes Eb up by 1', () => {
    expect(transposeChord('Eb', 1)).toBe('E')
  })

  it('transposes A# up by 1', () => {
    expect(transposeChord('A#', 1)).toBe('B')
  })
})

describe('transposeSong', () => {
  it('transposes all chords in ChordPro text', () => {
    const input = '[Am]שמעתי שיש [C]אקורד סודי'
    const result = transposeSong(input, 2)
    expect(result).toBe('[Bm]שמעתי שיש [D]אקורד סודי')
  })

  it('preserves directives', () => {
    const input = `{title: שיר}
{key: Am}
[Am]שורה`
    const result = transposeSong(input, 2)
    expect(result).toContain('{title: שיר}')
    expect(result).toContain('[Bm]שורה')
  })

  it('transposes key directive', () => {
    const input = `{key: Am}
[Am]שורה`
    const result = transposeSong(input, 2)
    expect(result).toContain('{key: Bm}')
  })

  it('handles empty input', () => {
    expect(transposeSong('', 1)).toBe('')
  })
})
