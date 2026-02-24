import { describe, it, expect } from 'vitest'
import { findEasyTranspose, hasEasierKey } from '@/lib/chordpro/simplify'

describe('findEasyTranspose', () => {
  it('returns 0 for already-easy chords (Am, C, G, F)', () => {
    expect(findEasyTranspose(['Am', 'C', 'G', 'F'])).toBe(0)
  })

  it('returns 0 for empty chord list', () => {
    expect(findEasyTranspose([])).toBe(0)
  })

  it('finds easier key for sharp-heavy songs', () => {
    // F#m, B, C#m, G#m — lots of sharps
    const steps = findEasyTranspose(['F#m', 'B', 'C#m', 'G#m'])
    expect(steps).not.toBe(0)
    expect(steps).toBeGreaterThanOrEqual(1)
    expect(steps).toBeLessThan(12)
  })

  it('finds easier key for flat-heavy songs', () => {
    // Bbm, Eb, Ab, Db — all flats
    const steps = findEasyTranspose(['Bbm', 'Eb', 'Ab', 'Db'])
    expect(steps).not.toBe(0)
  })

  it('prefers keys with more open chords', () => {
    // Bb, Eb, F — would be easier as G, C, D (transpose +9 = -3)
    const steps = findEasyTranspose(['Bb', 'Eb', 'F'])
    expect(steps).not.toBe(0)
  })

  it('handles songs with only one chord', () => {
    expect(findEasyTranspose(['G'])).toBe(0) // already easy
    const steps = findEasyTranspose(['Gb'])
    expect(steps).not.toBe(0) // Gb is not easy
  })

  it('strips slash bass notes for scoring', () => {
    // Am/E, C/G, G — all easy, slash notes should not affect
    expect(findEasyTranspose(['Am/E', 'C/G', 'G'])).toBe(0)
  })
})

describe('hasEasierKey', () => {
  it('returns false for already-easy songs', () => {
    expect(hasEasierKey(['Am', 'C', 'G', 'Em'])).toBe(false)
  })

  it('returns true for hard-key songs', () => {
    expect(hasEasierKey(['F#m', 'B', 'C#m', 'G#m'])).toBe(true)
  })
})
