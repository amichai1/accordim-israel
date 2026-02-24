/**
 * Easy key finder.
 *
 * Analyzes all chords in a song and finds the transposition (0-11 semitones)
 * that results in the most "easy" open guitar chords — i.e. the key with
 * the fewest sharps, flats, and barre chords.
 *
 * Example: a song in F#m with chords F#m, B, C#, G#m → transposing -2 gives
 * Em, A, B, F#m — much simpler to play.
 */

import { transposeChord } from './transpose'

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

/** Chords that are easy to play on guitar (open position, no barre). */
const EASY_CHORDS = new Set([
  // Major open chords
  'C', 'G', 'D', 'A', 'E',
  // Minor open chords
  'Am', 'Em', 'Dm',
  // Very common / manageable
  'F', 'Bm',
])

/**
 * Score a chord: higher = easier to play.
 * - Easy open chords score 3
 * - Chords with only natural roots (no # or b) score 1
 * - Everything else scores 0
 */
function chordEaseScore(chord: string): number {
  // Extract root + basic quality for matching
  const match = chord.match(/^([A-G][#b]?)(m)?/)
  if (!match) return 0

  const root = match[1]
  const baseChord = root + (match[2] || '')

  if (EASY_CHORDS.has(baseChord)) return 3
  // Natural root (no sharp/flat) is still easier than sharp/flat
  if (!root.includes('#') && !root.includes('b')) return 1
  return 0
}

/**
 * Extract all unique chord roots+quality from parsed sections.
 * Returns an array of unique chord strings (e.g. ["Am", "F", "C", "G"]).
 */
function extractUniqueChords(chords: string[]): string[] {
  const seen = new Set<string>()
  for (const chord of chords) {
    // Normalize: strip slash bass notes for scoring
    const stripped = chord.replace(/\/[A-G][#b]?$/, '')
    seen.add(stripped)
  }
  return Array.from(seen)
}

/**
 * Score a transposition: sum of ease scores for all unique chords
 * when transposed by `steps` semitones.
 */
function scoreTransposition(uniqueChords: string[], steps: number): number {
  let total = 0
  for (const chord of uniqueChords) {
    const transposed = transposeChord(chord, steps)
    total += chordEaseScore(transposed)
  }
  return total
}

/**
 * Find the best transposition (number of semitones) for easiest playing.
 *
 * @param allChords - Array of all chord names used in the song
 * @returns The number of semitones to transpose (0-11), or 0 if already optimal
 */
export function findEasyTranspose(allChords: string[]): number {
  const unique = extractUniqueChords(allChords)
  if (unique.length === 0) return 0

  let bestSteps = 0
  let bestScore = scoreTransposition(unique, 0)

  for (let steps = 1; steps < 12; steps++) {
    const score = scoreTransposition(unique, steps)
    if (score > bestScore) {
      bestScore = score
      bestSteps = steps
    }
  }

  return bestSteps
}

/**
 * Check if there exists a better (easier) key than the current one.
 */
export function hasEasierKey(allChords: string[]): boolean {
  return findEasyTranspose(allChords) !== 0
}
