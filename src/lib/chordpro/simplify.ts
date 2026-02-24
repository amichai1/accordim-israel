/**
 * Chord simplification for beginners.
 *
 * Standard rules from music theory — strip extensions and keep the base quality:
 *   Cmaj7 → C,  Dm9 → Dm,  G13 → G,  Fsus4 → F,  Am7 → Am,  etc.
 *
 * The suffix is matched longest-first so "m7b5" beats "m7".
 */

// Maps complex suffix → simplified suffix.
// Order matters: longer suffixes first to avoid partial matches.
const SUFFIX_SIMPLIFICATION: [RegExp, string][] = [
  // Slash chords — strip the bass note
  [/\/[A-G][#b]?$/, ''],

  // Major extended (must come before minor to avoid "maj7" matching "m...")
  [/^maj(?:7|9|11|13)(?:#11|#5)?$/, ''],
  [/^(?:7|9|11|13)(?:sus[24]|b5|#5|b9|#9|b13|#11)?$/, ''],
  [/^6(?:\/9)?$/, ''],
  [/^add(?:9|11|13)$/, ''],
  [/^sus[24]$/, ''],

  // Minor extended
  [/^m(?:aj)?(?:7|9|11|13)(?:b5|#5|#9|b9|#11|b13)?$/, 'm'],
  [/^m7b5$/, 'm'],
  [/^m6$/, 'm'],
  [/^madd(?:9|11)$/, 'm'],
  [/^msus[24]$/, 'm'],

  // Diminished extended
  [/^dim7$/, 'dim'],

  // Augmented extended
  [/^aug7$/, ''],
  [/^\+7$/, ''],

  // Power chords — keep as-is (already simple)
  [/^5$/, '5'],
]

/**
 * Parse a chord string into root + suffix.
 * E.g. "F#m7" → { root: "F#", suffix: "m7" }
 */
function parseChord(chord: string): { root: string; suffix: string } | null {
  // Handle slash chords like "Am/E" — parse the whole thing
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return null
  return { root: match[1], suffix: match[2] }
}

/**
 * Simplify a single chord name for beginners.
 * Returns the simplified chord, or the original if no simplification applies.
 */
export function simplifyChord(chord: string): string {
  const parts = parseChord(chord)
  if (!parts) return chord

  let { root, suffix } = parts

  // Handle slash chords first: strip the bass note, then simplify the remainder
  const slashMatch = suffix.match(/^(.*)\/[A-G][#b]?$/)
  if (slashMatch) {
    suffix = slashMatch[1]
  }

  // Already simple (major or minor with no extensions)
  if (suffix === '' || suffix === 'm' || suffix === 'dim' || suffix === 'aug' || suffix === '5') {
    return root + suffix
  }

  for (const [pattern, replacement] of SUFFIX_SIMPLIFICATION) {
    if (pattern.test(suffix)) {
      return root + replacement
    }
  }

  // No rule matched — return original
  return chord
}

/**
 * Check if a chord would change when simplified.
 */
export function isSimplifiable(chord: string): boolean {
  return simplifyChord(chord) !== chord
}
