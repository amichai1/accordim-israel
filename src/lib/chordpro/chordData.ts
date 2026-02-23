// Chord voicing data for guitar, ukulele, and piano

export type InstrumentType = 'guitar' | 'ukulele' | 'piano'

// Guitar: [E, A, D, G, B, e] low to high, -1 = muted, 0 = open
export interface GuitarChord {
  frets: number[]
  barreAt?: number
  startFret?: number // for chords higher up the neck
}

// Ukulele: [G, C, E, A] low to high
export interface UkuleleChord {
  frets: number[]
}

// Piano: array of semitone offsets from C (0=C, 1=C#, 2=D, ..., 11=B)
export interface PianoChord {
  keys: number[]
}

export const guitarChords: Record<string, GuitarChord> = {
  'C':    { frets: [-1, 3, 2, 0, 1, 0] },
  'Cm':   { frets: [-1, 3, 1, 0, 1, 3], barreAt: 3, startFret: 3 },
  'C7':   { frets: [-1, 3, 2, 3, 1, 0] },
  'Cmaj7':{ frets: [-1, 3, 2, 0, 0, 0] },
  'Cm7':  { frets: [-1, 3, 1, 3, 1, 3], barreAt: 3, startFret: 3 },
  'Cdim': { frets: [-1, 3, 4, 2, 4, 2] },
  'Caug': { frets: [-1, 3, 2, 1, 1, 0] },
  'Csus4':{ frets: [-1, 3, 3, 0, 1, 1] },
  'Csus2':{ frets: [-1, 3, 0, 0, 1, 0] },

  'C#':   { frets: [-1, 4, 3, 1, 2, 1], barreAt: 1, startFret: 1 },
  'C#m':  { frets: [-1, 4, 2, 1, 2, 0] },
  'Db':   { frets: [-1, 4, 3, 1, 2, 1], barreAt: 1, startFret: 1 },
  'Dbm':  { frets: [-1, 4, 2, 1, 2, 0] },

  'D':    { frets: [-1, -1, 0, 2, 3, 2] },
  'Dm':   { frets: [-1, -1, 0, 2, 3, 1] },
  'D7':   { frets: [-1, -1, 0, 2, 1, 2] },
  'Dmaj7':{ frets: [-1, -1, 0, 2, 2, 2] },
  'Dm7':  { frets: [-1, -1, 0, 2, 1, 1] },
  'Ddim': { frets: [-1, -1, 0, 1, 3, 1] },
  'Dsus4':{ frets: [-1, -1, 0, 2, 3, 3] },
  'Dsus2':{ frets: [-1, -1, 0, 2, 3, 0] },

  'D#':   { frets: [-1, -1, 1, 3, 4, 3], startFret: 1 },
  'D#m':  { frets: [-1, -1, 1, 3, 4, 2], startFret: 1 },
  'Eb':   { frets: [-1, -1, 1, 3, 4, 3], startFret: 1 },
  'Ebm':  { frets: [-1, -1, 1, 3, 4, 2], startFret: 1 },

  'E':    { frets: [0, 2, 2, 1, 0, 0] },
  'Em':   { frets: [0, 2, 2, 0, 0, 0] },
  'E7':   { frets: [0, 2, 0, 1, 0, 0] },
  'Emaj7':{ frets: [0, 2, 1, 1, 0, 0] },
  'Em7':  { frets: [0, 2, 0, 0, 0, 0] },
  'Edim': { frets: [0, 1, 2, 0, -1, -1] },
  'Esus4':{ frets: [0, 2, 2, 2, 0, 0] },

  'F':    { frets: [1, 3, 3, 2, 1, 1], barreAt: 1 },
  'Fm':   { frets: [1, 3, 3, 1, 1, 1], barreAt: 1 },
  'F7':   { frets: [1, 3, 1, 2, 1, 1], barreAt: 1 },
  'Fmaj7':{ frets: [1, -1, 2, 2, 1, 0] },
  'Fm7':  { frets: [1, 3, 1, 1, 1, 1], barreAt: 1 },
  'Fdim': { frets: [1, 2, 3, 1, -1, -1] },
  'Fsus4':{ frets: [1, 3, 3, 3, 1, 1], barreAt: 1 },

  'F#':   { frets: [2, 4, 4, 3, 2, 2], barreAt: 2, startFret: 2 },
  'F#m':  { frets: [2, 4, 4, 2, 2, 2], barreAt: 2, startFret: 2 },
  'F#7':  { frets: [2, 4, 2, 3, 2, 2], barreAt: 2, startFret: 2 },
  'Gb':   { frets: [2, 4, 4, 3, 2, 2], barreAt: 2, startFret: 2 },
  'Gbm':  { frets: [2, 4, 4, 2, 2, 2], barreAt: 2, startFret: 2 },

  'G':    { frets: [3, 2, 0, 0, 0, 3] },
  'Gm':   { frets: [3, 5, 5, 3, 3, 3], barreAt: 3, startFret: 3 },
  'G7':   { frets: [3, 2, 0, 0, 0, 1] },
  'Gmaj7':{ frets: [3, 2, 0, 0, 0, 2] },
  'Gm7':  { frets: [3, 5, 3, 3, 3, 3], barreAt: 3, startFret: 3 },
  'Gdim': { frets: [3, 4, 5, 3, -1, -1] },
  'Gsus4':{ frets: [3, 2, 0, 0, 1, 3] },

  'G#':   { frets: [4, 6, 6, 5, 4, 4], barreAt: 4, startFret: 4 },
  'G#m':  { frets: [4, 6, 6, 4, 4, 4], barreAt: 4, startFret: 4 },
  'Ab':   { frets: [4, 6, 6, 5, 4, 4], barreAt: 4, startFret: 4 },
  'Abm':  { frets: [4, 6, 6, 4, 4, 4], barreAt: 4, startFret: 4 },

  'A':    { frets: [-1, 0, 2, 2, 2, 0] },
  'Am':   { frets: [-1, 0, 2, 2, 1, 0] },
  'A7':   { frets: [-1, 0, 2, 0, 2, 0] },
  'Amaj7':{ frets: [-1, 0, 2, 1, 2, 0] },
  'Am7':  { frets: [-1, 0, 2, 0, 1, 0] },
  'Adim': { frets: [-1, 0, 1, 2, 1, -1] },
  'Asus4':{ frets: [-1, 0, 2, 2, 3, 0] },
  'Asus2':{ frets: [-1, 0, 2, 2, 0, 0] },

  'A#':   { frets: [-1, 1, 3, 3, 3, 1], barreAt: 1, startFret: 1 },
  'A#m':  { frets: [-1, 1, 3, 3, 2, 1], barreAt: 1, startFret: 1 },
  'Bb':   { frets: [-1, 1, 3, 3, 3, 1], barreAt: 1, startFret: 1 },
  'Bbm':  { frets: [-1, 1, 3, 3, 2, 1], barreAt: 1, startFret: 1 },
  'Bb7':  { frets: [-1, 1, 3, 1, 3, 1], barreAt: 1, startFret: 1 },

  'B':    { frets: [-1, 2, 4, 4, 4, 2], barreAt: 2, startFret: 2 },
  'Bm':   { frets: [-1, 2, 4, 4, 3, 2], barreAt: 2, startFret: 2 },
  'B7':   { frets: [-1, 2, 1, 2, 0, 2] },
  'Bmaj7':{ frets: [-1, 2, 4, 3, 4, 2], barreAt: 2, startFret: 2 },
  'Bm7':  { frets: [-1, 2, 0, 2, 0, 2] },
  'Bdim': { frets: [-1, 2, 3, 4, 3, -1] },
}

export const ukuleleChords: Record<string, UkuleleChord> = {
  'C':    { frets: [0, 0, 0, 3] },
  'Cm':   { frets: [0, 3, 3, 3] },
  'C7':   { frets: [0, 0, 0, 1] },
  'Cmaj7':{ frets: [0, 0, 0, 2] },
  'Cm7':  { frets: [3, 3, 3, 3] },

  'C#':   { frets: [1, 1, 1, 4] },
  'C#m':  { frets: [1, 4, 4, 4] },
  'Db':   { frets: [1, 1, 1, 4] },
  'Dbm':  { frets: [1, 4, 4, 4] },

  'D':    { frets: [2, 2, 2, 0] },
  'Dm':   { frets: [2, 2, 1, 0] },
  'D7':   { frets: [2, 2, 2, 3] },
  'Dmaj7':{ frets: [2, 2, 2, 4] },
  'Dm7':  { frets: [2, 2, 1, 3] },

  'D#':   { frets: [3, 3, 3, 1] },
  'D#m':  { frets: [3, 3, 2, 1] },
  'Eb':   { frets: [3, 3, 3, 1] },
  'Ebm':  { frets: [3, 3, 2, 1] },

  'E':    { frets: [1, 4, 0, 2] },
  'Em':   { frets: [0, 4, 3, 2] },
  'E7':   { frets: [1, 2, 0, 2] },
  'Em7':  { frets: [0, 2, 0, 2] },

  'F':    { frets: [2, 0, 1, 0] },
  'Fm':   { frets: [1, 0, 1, 3] },
  'F7':   { frets: [2, 3, 1, 0] },
  'Fmaj7':{ frets: [2, 4, 1, 0] },
  'Fm7':  { frets: [1, 3, 1, 3] },

  'F#':   { frets: [3, 1, 2, 1] },
  'F#m':  { frets: [2, 1, 2, 0] },
  'Gb':   { frets: [3, 1, 2, 1] },
  'Gbm':  { frets: [2, 1, 2, 0] },

  'G':    { frets: [0, 2, 3, 2] },
  'Gm':   { frets: [0, 2, 3, 1] },
  'G7':   { frets: [0, 2, 1, 2] },
  'Gmaj7':{ frets: [0, 2, 2, 2] },
  'Gm7':  { frets: [0, 2, 1, 1] },

  'G#':   { frets: [5, 3, 4, 3] },
  'G#m':  { frets: [4, 3, 4, 2] },
  'Ab':   { frets: [5, 3, 4, 3] },
  'Abm':  { frets: [4, 3, 4, 2] },

  'A':    { frets: [2, 1, 0, 0] },
  'Am':   { frets: [2, 0, 0, 0] },
  'A7':   { frets: [0, 1, 0, 0] },
  'Amaj7':{ frets: [1, 1, 0, 0] },
  'Am7':  { frets: [0, 0, 0, 0] },

  'A#':   { frets: [3, 2, 1, 1] },
  'A#m':  { frets: [3, 1, 1, 1] },
  'Bb':   { frets: [3, 2, 1, 1] },
  'Bbm':  { frets: [3, 1, 1, 1] },
  'Bb7':  { frets: [1, 2, 1, 1] },

  'B':    { frets: [4, 3, 2, 2] },
  'Bm':   { frets: [4, 2, 2, 2] },
  'B7':   { frets: [2, 3, 2, 2] },
  'Bm7':  { frets: [2, 2, 2, 2] },
}

// Piano keys: semitone offsets from C. 0=C, 1=C#/Db, 2=D, ...11=B
export const pianoChords: Record<string, PianoChord> = {
  'C':    { keys: [0, 4, 7] },
  'Cm':   { keys: [0, 3, 7] },
  'C7':   { keys: [0, 4, 7, 10] },
  'Cmaj7':{ keys: [0, 4, 7, 11] },
  'Cm7':  { keys: [0, 3, 7, 10] },
  'Cdim': { keys: [0, 3, 6] },
  'Caug': { keys: [0, 4, 8] },
  'Csus4':{ keys: [0, 5, 7] },
  'Csus2':{ keys: [0, 2, 7] },

  'C#':   { keys: [1, 5, 8] },
  'C#m':  { keys: [1, 4, 8] },
  'Db':   { keys: [1, 5, 8] },
  'Dbm':  { keys: [1, 4, 8] },

  'D':    { keys: [2, 6, 9] },
  'Dm':   { keys: [2, 5, 9] },
  'D7':   { keys: [2, 6, 9, 0] },
  'Dmaj7':{ keys: [2, 6, 9, 1] },
  'Dm7':  { keys: [2, 5, 9, 0] },
  'Ddim': { keys: [2, 5, 8] },
  'Dsus4':{ keys: [2, 7, 9] },
  'Dsus2':{ keys: [2, 4, 9] },

  'D#':   { keys: [3, 7, 10] },
  'D#m':  { keys: [3, 6, 10] },
  'Eb':   { keys: [3, 7, 10] },
  'Ebm':  { keys: [3, 6, 10] },

  'E':    { keys: [4, 8, 11] },
  'Em':   { keys: [4, 7, 11] },
  'E7':   { keys: [4, 8, 11, 2] },
  'Emaj7':{ keys: [4, 8, 11, 3] },
  'Em7':  { keys: [4, 7, 11, 2] },
  'Edim': { keys: [4, 7, 10] },
  'Esus4':{ keys: [4, 9, 11] },

  'F':    { keys: [5, 9, 0] },
  'Fm':   { keys: [5, 8, 0] },
  'F7':   { keys: [5, 9, 0, 3] },
  'Fmaj7':{ keys: [5, 9, 0, 4] },
  'Fm7':  { keys: [5, 8, 0, 3] },
  'Fdim': { keys: [5, 8, 11] },
  'Fsus4':{ keys: [5, 10, 0] },

  'F#':   { keys: [6, 10, 1] },
  'F#m':  { keys: [6, 9, 1] },
  'F#7':  { keys: [6, 10, 1, 4] },
  'Gb':   { keys: [6, 10, 1] },
  'Gbm':  { keys: [6, 9, 1] },

  'G':    { keys: [7, 11, 2] },
  'Gm':   { keys: [7, 10, 2] },
  'G7':   { keys: [7, 11, 2, 5] },
  'Gmaj7':{ keys: [7, 11, 2, 6] },
  'Gm7':  { keys: [7, 10, 2, 5] },
  'Gdim': { keys: [7, 10, 1] },
  'Gsus4':{ keys: [7, 0, 2] },

  'G#':   { keys: [8, 0, 3] },
  'G#m':  { keys: [8, 11, 3] },
  'Ab':   { keys: [8, 0, 3] },
  'Abm':  { keys: [8, 11, 3] },

  'A':    { keys: [9, 1, 4] },
  'Am':   { keys: [9, 0, 4] },
  'A7':   { keys: [9, 1, 4, 7] },
  'Amaj7':{ keys: [9, 1, 4, 8] },
  'Am7':  { keys: [9, 0, 4, 7] },
  'Adim': { keys: [9, 0, 3] },
  'Asus4':{ keys: [9, 2, 4] },
  'Asus2':{ keys: [9, 11, 4] },

  'A#':   { keys: [10, 2, 5] },
  'A#m':  { keys: [10, 1, 5] },
  'Bb':   { keys: [10, 2, 5] },
  'Bbm':  { keys: [10, 1, 5] },
  'Bb7':  { keys: [10, 2, 5, 8] },

  'B':    { keys: [11, 3, 6] },
  'Bm':   { keys: [11, 2, 6] },
  'B7':   { keys: [11, 3, 6, 9] },
  'Bmaj7':{ keys: [11, 3, 6, 10] },
  'Bm7':  { keys: [11, 2, 6, 9] },
  'Bdim': { keys: [11, 2, 5] },
}
