import { describe, it, expect } from 'vitest'
import { simplifyChord, isSimplifiable } from '@/lib/chordpro/simplify'

describe('simplifyChord', () => {
  it('keeps simple major chords unchanged', () => {
    expect(simplifyChord('C')).toBe('C')
    expect(simplifyChord('G')).toBe('G')
    expect(simplifyChord('F#')).toBe('F#')
  })

  it('keeps simple minor chords unchanged', () => {
    expect(simplifyChord('Am')).toBe('Am')
    expect(simplifyChord('Em')).toBe('Em')
    expect(simplifyChord('F#m')).toBe('F#m')
  })

  it('simplifies major 7th/9th/11th/13th to major', () => {
    expect(simplifyChord('Cmaj7')).toBe('C')
    expect(simplifyChord('Gmaj9')).toBe('G')
    expect(simplifyChord('Dmaj13')).toBe('D')
  })

  it('simplifies dominant 7th/9th/11th/13th to major', () => {
    expect(simplifyChord('G7')).toBe('G')
    expect(simplifyChord('C9')).toBe('C')
    expect(simplifyChord('A13')).toBe('A')
    expect(simplifyChord('D7b9')).toBe('D')
    expect(simplifyChord('E7#9')).toBe('E')
  })

  it('simplifies minor 7th/9th to minor', () => {
    expect(simplifyChord('Am7')).toBe('Am')
    expect(simplifyChord('Dm9')).toBe('Dm')
    expect(simplifyChord('F#m7')).toBe('F#m')
    expect(simplifyChord('Bm7')).toBe('Bm')
  })

  it('simplifies sus chords to major', () => {
    expect(simplifyChord('Dsus4')).toBe('D')
    expect(simplifyChord('Asus2')).toBe('A')
    expect(simplifyChord('Gsus4')).toBe('G')
  })

  it('simplifies add chords to base', () => {
    expect(simplifyChord('Cadd9')).toBe('C')
    expect(simplifyChord('Emadd9')).toBe('Em')
  })

  it('simplifies 6th chords', () => {
    expect(simplifyChord('C6')).toBe('C')
    expect(simplifyChord('Am6')).toBe('Am')
    expect(simplifyChord('G6/9')).toBe('G')
  })

  it('simplifies diminished 7th to dim', () => {
    expect(simplifyChord('Cdim7')).toBe('Cdim')
  })

  it('simplifies m7b5 to minor', () => {
    expect(simplifyChord('Bm7b5')).toBe('Bm')
  })

  it('simplifies slash chords by removing bass note', () => {
    expect(simplifyChord('C/G')).toBe('C')
    expect(simplifyChord('Am/E')).toBe('Am')
    expect(simplifyChord('D/F#')).toBe('D')
  })

  it('keeps dim and aug unchanged', () => {
    expect(simplifyChord('Cdim')).toBe('Cdim')
    expect(simplifyChord('Caug')).toBe('Caug')
  })

  it('keeps power chords unchanged', () => {
    expect(simplifyChord('A5')).toBe('A5')
    expect(simplifyChord('E5')).toBe('E5')
  })

  it('returns original for unrecognized patterns', () => {
    expect(simplifyChord('N.C.')).toBe('N.C.')
    expect(simplifyChord('X')).toBe('X')
  })
})

describe('isSimplifiable', () => {
  it('returns false for already simple chords', () => {
    expect(isSimplifiable('C')).toBe(false)
    expect(isSimplifiable('Am')).toBe(false)
    expect(isSimplifiable('E5')).toBe(false)
  })

  it('returns true for complex chords', () => {
    expect(isSimplifiable('Cmaj7')).toBe(true)
    expect(isSimplifiable('Am7')).toBe(true)
    expect(isSimplifiable('Dsus4')).toBe(true)
    expect(isSimplifiable('G/B')).toBe(true)
  })
})
