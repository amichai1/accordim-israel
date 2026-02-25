import guitarDb from '@tombatossals/chords-db/lib/guitar.json'
import ukuleleDb from '@tombatossals/chords-db/lib/ukulele.json'

export type InstrumentType = 'guitar' | 'ukulele'

export interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
  midi?: number[]
}

export interface ChordData {
  key: string
  suffix: string
  positions: ChordPosition[]
}

export interface InstrumentInfo {
  strings: number
  fretsOnChord: number
  name: string
  tunings: { standard: string[] }
}

export interface ChordLookupResult {
  chord: ChordData
  instrument: InstrumentInfo
}

// Map common chord suffix notations to DB suffix names
const SUFFIX_MAP: Record<string, string> = {
  '': 'major',
  'm': 'minor',
  'min': 'minor',
  'dim': 'dim',
  'dim7': 'dim7',
  'sus2': 'sus2',
  'sus4': 'sus4',
  '7sus4': '7sus4',
  'aug': 'aug',
  '+': 'aug',
  '6': '6',
  '69': '69',
  '7': '7',
  '7b5': '7b5',
  'aug7': 'aug7',
  '9': '9',
  '9b5': '9b5',
  'aug9': 'aug9',
  '7b9': '7b9',
  '7#9': '7#9',
  '11': '11',
  '9#11': '9#11',
  '13': '13',
  'maj7': 'maj7',
  'maj9': 'maj9',
  'maj11': 'maj11',
  'maj13': 'maj13',
  'm6': 'm6',
  'm69': 'm69',
  'm7': 'm7',
  'm7b5': 'm7b5',
  'm9': 'm9',
  'm11': 'm11',
  'mmaj7': 'mmaj7',
  'add9': 'add9',
  'madd9': 'madd9',
}

// Map note names to guitar DB key names
const GUITAR_KEY_MAP: Record<string, string> = {
  'C': 'C',
  'C#': 'Csharp',
  'Db': 'Csharp',
  'D': 'D',
  'D#': 'Eb',
  'Eb': 'Eb',
  'E': 'E',
  'F': 'F',
  'F#': 'Fsharp',
  'Gb': 'Fsharp',
  'G': 'G',
  'G#': 'Ab',
  'Ab': 'Ab',
  'A': 'A',
  'A#': 'Bb',
  'Bb': 'Bb',
  'B': 'B',
}

// Map note names to ukulele DB key names
const UKULELE_KEY_MAP: Record<string, string> = {
  'C': 'C',
  'C#': 'Db',
  'Db': 'Db',
  'D': 'D',
  'D#': 'Eb',
  'Eb': 'Eb',
  'E': 'E',
  'F': 'F',
  'F#': 'Gb',
  'Gb': 'Gb',
  'G': 'G',
  'G#': 'Ab',
  'Ab': 'Ab',
  'A': 'A',
  'A#': 'Bb',
  'Bb': 'Bb',
  'B': 'B',
}

/**
 * Parse a chord name like "Am", "F#m7", "Dsus4", "Bb7" into root note and suffix.
 */
export function parseChordName(chordName: string): { root: string; suffix: string } | null {
  const match = chordName.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return null
  return { root: match[1], suffix: match[2] }
}

/**
 * Look up chord data for a given chord name and instrument.
 */
export function lookupChord(
  chordName: string,
  instrument: InstrumentType
): ChordLookupResult | null {
  const parsed = parseChordName(chordName)
  if (!parsed) return null

  const { root, suffix } = parsed
  const dbSuffix = SUFFIX_MAP[suffix]
  if (dbSuffix === undefined) return null

  const db = instrument === 'guitar' ? guitarDb : ukuleleDb
  const keyMap = instrument === 'guitar' ? GUITAR_KEY_MAP : UKULELE_KEY_MAP
  const dbKey = keyMap[root]
  if (!dbKey) return null

  const chords = (db.chords as Record<string, ChordData[]>)[dbKey]
  if (!chords) return null

  const chord = chords.find((c) => c.suffix === dbSuffix)
  if (!chord) return null

  const instrumentInfo: InstrumentInfo = {
    strings: db.main.strings,
    fretsOnChord: db.main.fretsOnChord,
    name: db.main.name,
    tunings: db.tunings as { standard: string[] },
  }

  return { chord, instrument: instrumentInfo }
}
