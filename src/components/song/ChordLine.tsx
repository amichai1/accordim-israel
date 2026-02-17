import type { SongLine } from '@/lib/chordpro/types'
import ChordWord from './ChordWord'

interface ChordLineProps {
  line: SongLine
}

export default function ChordLine({ line }: ChordLineProps) {
  return (
    <div className="song-line my-0.5">
      {line.words.map((word, i) => (
        <ChordWord key={i} word={word} />
      ))}
    </div>
  )
}
