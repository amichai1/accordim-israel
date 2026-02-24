/**
 * Capo position calculator.
 *
 * Given a target key (after transpose), suggests the best capo position
 * so the guitarist can use easy open chord shapes.
 *
 * The math is simple: capo_fret = (target_note - easy_note) mod 12
 * where easy_note is from one of the "easy" open-chord keys.
 */

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Easy open-chord keys for guitar (shapes most players know well)
const EASY_MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E']
const EASY_MINOR_KEYS = ['Am', 'Em', 'Dm']

function noteIndex(note: string): number {
  let idx = NOTES.indexOf(note)
  if (idx !== -1) return idx
  idx = NOTES_FLAT.indexOf(note)
  return idx
}

function parseKeyRoot(key: string): { root: string; isMinor: boolean } {
  const match = key.match(/^([A-G][#b]?)(m)?/)
  if (!match) return { root: key, isMinor: false }
  return { root: match[1], isMinor: !!match[2] }
}

export interface CapoSuggestion {
  fret: number
  shapesKey: string  // The key shapes to play (e.g. "Am", "G")
}

/**
 * Calculate the best capo suggestions for a given target key.
 * Returns an array of suggestions sorted by lowest fret first.
 * Only returns frets 1-7 (practical range for capo).
 */
export function getCapoSuggestions(targetKey: string): CapoSuggestion[] {
  const { root, isMinor } = parseKeyRoot(targetKey)
  const targetIdx = noteIndex(root)
  if (targetIdx === -1) return []

  const easyKeys = isMinor ? EASY_MINOR_KEYS : EASY_MAJOR_KEYS
  const suggestions: CapoSuggestion[] = []

  for (const easyKey of easyKeys) {
    const { root: easyRoot } = parseKeyRoot(easyKey)
    const easyIdx = noteIndex(easyRoot)
    if (easyIdx === -1) continue

    const fret = ((targetIdx - easyIdx) % 12 + 12) % 12
    // Only suggest practical capo positions (1-7), skip 0 (no capo needed)
    if (fret >= 1 && fret <= 7) {
      suggestions.push({ fret, shapesKey: easyKey })
    }
  }

  // Sort by lowest fret
  suggestions.sort((a, b) => a.fret - b.fret)
  return suggestions
}

/**
 * Get the single best capo suggestion (lowest fret).
 * Returns null if no useful capo position exists (i.e. already easy key).
 */
export function getBestCapo(targetKey: string): CapoSuggestion | null {
  const suggestions = getCapoSuggestions(targetKey)
  return suggestions.length > 0 ? suggestions[0] : null
}

/**
 * Given an original key and the number of transpose steps,
 * compute the transposed key name.
 */
export function getTransposedKeyName(originalKey: string, steps: number): string {
  const { root, isMinor } = parseKeyRoot(originalKey)
  const idx = noteIndex(root)
  if (idx === -1) return originalKey

  const newIdx = ((idx + steps) % 12 + 12) % 12
  const useFlats = root.includes('b')
  const notes = useFlats ? NOTES_FLAT : NOTES
  return notes[newIdx] + (isMinor ? 'm' : '')
}
