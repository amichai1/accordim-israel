declare module '@tombatossals/react-chords/lib/Chord' {
  import { FC } from 'react'

  interface ChordProps {
    chord: {
      frets: number[]
      fingers: number[]
      baseFret: number
      barres: number[]
      capo?: boolean
    }
    instrument: {
      strings: number
      fretsOnChord: number
      tunings: { standard: string[] }
    }
    lite?: boolean
  }

  const Chord: FC<ChordProps>
  export default Chord
}

declare module '@tombatossals/chords-db/lib/guitar.json' {
  const data: {
    main: { strings: number; fretsOnChord: number; name: string; numberOfChords: number }
    tunings: { standard: string[] }
    keys: string[]
    suffixes: string[]
    chords: Record<string, Array<{
      key: string
      suffix: string
      positions: Array<{
        frets: number[]
        fingers: number[]
        baseFret: number
        barres: number[]
        capo?: boolean
        midi?: number[]
      }>
    }>>
  }
  export default data
}

declare module '@tombatossals/chords-db/lib/ukulele.json' {
  const data: {
    main: { strings: number; fretsOnChord: number; name: string; numberOfChords: number }
    tunings: { standard: string[] }
    keys: string[]
    suffixes: string[]
    chords: Record<string, Array<{
      key: string
      suffix: string
      positions: Array<{
        frets: number[]
        fingers: number[]
        baseFret: number
        barres: number[]
        capo?: boolean
        midi?: number[]
      }>
    }>>
  }
  export default data
}
