import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SongView from '@/components/song/SongView'

const sampleChordPro = `{title: הללויה}
{artist: Leonard Cohen}
{key: C}

[Am]שמעתי שיש [C]אקורד סודי

{soc: פזמון}
[F]הללויה [Am]הללויה
{eoc}`

describe('SongView', () => {
  it('renders song title as heading', () => {
    render(<SongView content={sampleChordPro} title="הללויה" artist="Leonard Cohen" originalKey="C" />)
    expect(screen.getByRole('heading', { name: 'הללויה' })).toBeInTheDocument()
  })

  it('renders artist name', () => {
    render(<SongView content={sampleChordPro} title="הללויה" artist="Leonard Cohen" originalKey="C" />)
    expect(screen.getByText('Leonard Cohen')).toBeInTheDocument()
  })

  it('renders chords', () => {
    render(<SongView content={sampleChordPro} title="הללויה" artist="Leonard Cohen" originalKey="C" />)
    const chords = screen.getAllByText('Am', { selector: '.chord' })
    expect(chords.length).toBeGreaterThan(0)
  })

  it('renders lyrics', () => {
    render(<SongView content={sampleChordPro} title="הללויה" artist="Leonard Cohen" originalKey="C" />)
    expect(screen.getByText(/שמעתי שיש/)).toBeInTheDocument()
  })

  it('renders section labels', () => {
    render(<SongView content={sampleChordPro} title="הללויה" artist="Leonard Cohen" originalKey="C" />)
    expect(screen.getByText(/פזמון/)).toBeInTheDocument()
  })

  it('renders key display', () => {
    render(<SongView content={sampleChordPro} title="הללויה" artist="Leonard Cohen" originalKey="C" />)
    expect(screen.getByText(/סולם/)).toBeInTheDocument()
  })
})
