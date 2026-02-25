import { describe, it, expect } from 'vitest'
import { getCapoSuggestions, getBestCapo, getTransposedKeyName } from '@/lib/chordpro/capo'

describe('getCapoSuggestions', () => {
  it('returns empty for already-easy major keys', () => {
    const cSuggestions = getCapoSuggestions('C')
    expect(cSuggestions.every(s => s.fret >= 1 && s.fret <= 7)).toBe(true)
  })

  it('suggests capo for F major (barre chord key)', () => {
    const suggestions = getCapoSuggestions('F')
    const eShapes = suggestions.find(s => s.shapesKey === 'E')
    expect(eShapes).toBeDefined()
    expect(eShapes!.fret).toBe(1)
  })

  it('suggests capo for Bb major', () => {
    const suggestions = getCapoSuggestions('Bb')
    const aShapes = suggestions.find(s => s.shapesKey === 'A')
    expect(aShapes).toBeDefined()
    expect(aShapes!.fret).toBe(1)
  })

  it('suggests capo for F#m (minor key)', () => {
    const suggestions = getCapoSuggestions('F#m')
    const emShapes = suggestions.find(s => s.shapesKey === 'Em')
    expect(emShapes).toBeDefined()
    expect(emShapes!.fret).toBe(2)
  })

  it('suggests capo for Bm', () => {
    const suggestions = getCapoSuggestions('Bm')
    const amShapes = suggestions.find(s => s.shapesKey === 'Am')
    expect(amShapes).toBeDefined()
    expect(amShapes!.fret).toBe(2)
  })

  it('suggests capo for Cm', () => {
    const suggestions = getCapoSuggestions('Cm')
    const amShapes = suggestions.find(s => s.shapesKey === 'Am')
    expect(amShapes).toBeDefined()
    expect(amShapes!.fret).toBe(3)
  })

  it('sorts suggestions by lowest fret', () => {
    const suggestions = getCapoSuggestions('Bb')
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i].fret).toBeGreaterThanOrEqual(suggestions[i - 1].fret)
    }
  })

  it('only returns frets 1-7', () => {
    for (const key of ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'Ab']) {
      const suggestions = getCapoSuggestions(key)
      for (const s of suggestions) {
        expect(s.fret).toBeGreaterThanOrEqual(1)
        expect(s.fret).toBeLessThanOrEqual(7)
      }
    }
  })
})

describe('getBestCapo', () => {
  it('returns lowest fret suggestion', () => {
    const best = getBestCapo('F')
    expect(best).not.toBeNull()
    expect(best!.fret).toBe(1)
    expect(best!.shapesKey).toBe('E')
  })

  it('returns null for unknown key', () => {
    expect(getBestCapo('??')).toBeNull()
  })
})

describe('getTransposedKeyName', () => {
  it('transposes major key up', () => {
    expect(getTransposedKeyName('C', 2)).toBe('D')
    expect(getTransposedKeyName('G', 5)).toBe('C')
  })

  it('transposes minor key up', () => {
    expect(getTransposedKeyName('Am', 3)).toBe('Cm')
    expect(getTransposedKeyName('Em', 2)).toBe('F#m')
  })

  it('transposes down (negative steps)', () => {
    expect(getTransposedKeyName('D', -2)).toBe('C')
    expect(getTransposedKeyName('Am', -3)).toBe('F#m')
  })

  it('handles flats', () => {
    expect(getTransposedKeyName('Bb', 2)).toBe('C')
    expect(getTransposedKeyName('Eb', 1)).toBe('E')
  })

  it('returns 0 steps unchanged', () => {
    expect(getTransposedKeyName('Am', 0)).toBe('Am')
  })
})
