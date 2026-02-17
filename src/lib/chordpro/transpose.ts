const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function noteToIndex(note: string): number {
  let idx = NOTES_SHARP.indexOf(note)
  if (idx !== -1) return idx
  idx = NOTES_FLAT.indexOf(note)
  return idx
}

function parseChordParts(chord: string): { root: string; suffix: string } | null {
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return null
  return { root: match[1], suffix: match[2] }
}

export function transposeChord(chord: string, steps: number): string {
  const parts = parseChordParts(chord)
  if (!parts) return chord

  const index = noteToIndex(parts.root)
  if (index === -1) return chord

  const newIndex = ((index + steps) % 12 + 12) % 12
  const useFlats = parts.root.includes('b')
  const notes = useFlats ? NOTES_FLAT : NOTES_SHARP
  return notes[newIndex] + parts.suffix
}

export function transposeSong(input: string, steps: number): string {
  if (!input) return ''

  return input
    .split('\n')
    .map(line => {
      // Handle key directive
      const keyMatch = line.match(/^\{key:\s*(.+)\}$/)
      if (keyMatch) {
        const transposedKey = transposeChord(keyMatch[1].trim(), steps)
        return `{key: ${transposedKey}}`
      }

      // Transpose chords in brackets
      return line.replace(/\[([^\]]+)\]/g, (_, chord) => {
        return `[${transposeChord(chord, steps)}]`
      })
    })
    .join('\n')
}
