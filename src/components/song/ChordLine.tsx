import type { SongLine } from '@/lib/chordpro/types'
import ChordWord from './ChordWord'

interface ChordLineProps {
  line: SongLine
  onChordClick?: (chord: string, rect: DOMRect) => void
}

export default function ChordLine({ line, onChordClick }: ChordLineProps) {
  return (
    <div className="song-line my-0.5">
      {line.words.map((word, i) => (
        <ChordWord key={i} word={word} onChordClick={onChordClick} />
      ))}
    </div>
  )
}
