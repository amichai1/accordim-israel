import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChordLine from '@/components/song/ChordLine'
import type { SongLine } from '@/lib/chordpro/types'

describe('ChordLine', () => {
  it('renders lyrics text', () => {
    const line: SongLine = {
      type: 'line',
      words: [
        { chord: 'Am', text: 'שמעתי שיש ' },
        { chord: 'C', text: 'אקורד סודי' },
      ],
    }
    render(<ChordLine line={line} />)
    expect(screen.getByText('שמעתי שיש')).toBeInTheDocument()
    expect(screen.getByText('אקורד סודי')).toBeInTheDocument()
  })

  it('renders chords above words', () => {
    const line: SongLine = {
      type: 'line',
      words: [
        { chord: 'Am', text: 'שמעתי' },
      ],
    }
    render(<ChordLine line={line} />)
    expect(screen.getByText('Am')).toBeInTheDocument()
    expect(screen.getByText('Am')).toHaveClass('chord')
  })

  it('renders text without chords', () => {
    const line: SongLine = {
      type: 'line',
      words: [{ text: 'שורה ללא אקורדים' }],
    }
    render(<ChordLine line={line} />)
    expect(screen.getByText('שורה ללא אקורדים')).toBeInTheDocument()
  })

  it('renders chord-only lines', () => {
    const line: SongLine = {
      type: 'chord-only',
      words: [
        { chord: 'Am', text: ' ' },
        { chord: 'C', text: ' ' },
        { chord: 'G', text: '' },
      ],
    }
    render(<ChordLine line={line} />)
    expect(screen.getByText('Am')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
  })
})
