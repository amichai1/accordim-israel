import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SongControls from '@/components/song/SongControls'

describe('SongControls', () => {
  const defaultProps = {
    currentKey: 'Am',
    transpose: 0,
    fontSize: 1,
    autoScroll: false,
    scrollSpeed: 50,
    simplified: false,
    onTranspose: () => {},
    onFontSizeChange: () => {},
    onAutoScrollToggle: () => {},
    onScrollSpeedChange: () => {},
    onSimplifiedToggle: () => {},
  }

  it('renders transpose buttons (desktop + mobile)', () => {
    render(<SongControls {...defaultProps} />)
    // Both desktop and mobile render these buttons
    expect(screen.getAllByLabelText('הורד חצי טון').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByLabelText('העלה חצי טון').length).toBeGreaterThanOrEqual(1)
  })

  it('displays current key', () => {
    render(<SongControls {...defaultProps} />)
    // Key shown in both desktop and mobile
    expect(screen.getAllByText('Am').length).toBeGreaterThanOrEqual(1)
  })

  it('calls onTranspose when clicking up', async () => {
    const user = userEvent.setup()
    let called = 0
    render(<SongControls {...defaultProps} onTranspose={() => called++} />)
    // Click the first instance (desktop)
    await user.click(screen.getAllByLabelText('העלה חצי טון')[0])
    expect(called).toBe(1)
  })

  it('renders font size controls', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getAllByLabelText('הקטן פונט').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByLabelText('הגדל פונט').length).toBeGreaterThanOrEqual(1)
  })

  it('renders auto-scroll toggle', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getAllByLabelText('גלילה אוטומטית').length).toBeGreaterThanOrEqual(1)
  })

  it('renders simplify toggle', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getAllByLabelText('פשט אקורדים').length).toBeGreaterThanOrEqual(1)
  })

  it('shows capo indicator when suggestions exist', () => {
    const capoSuggestions = [{ fret: 2, shapesKey: 'Am' }]
    render(<SongControls {...defaultProps} capoSuggestions={capoSuggestions} />)
    expect(screen.getByText(/קאפו על שריג 2/)).toBeInTheDocument()
  })
})
