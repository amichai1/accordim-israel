// Chord data - guitar/ukulele now come from @tombatossals/chords-db
// Piano data is kept here as custom SVG rendering

export type InstrumentType = 'guitar' | 'ukulele' | 'piano'

// Piano keys: semitone offsets from C. 0=C, 1=C#/Db, 2=D, ...11=B
export interface PianoChord {
  keys: number[]
}

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
