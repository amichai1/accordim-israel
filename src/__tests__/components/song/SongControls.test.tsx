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
    onTranspose: () => {},
    onFontSizeChange: () => {},
    onAutoScrollToggle: () => {},
    onScrollSpeedChange: () => {},
  }

  it('renders transpose buttons', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getByLabelText('הורד חצי טון')).toBeInTheDocument()
    expect(screen.getByLabelText('העלה חצי טון')).toBeInTheDocument()
  })

  it('displays current key', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getByText('Am')).toBeInTheDocument()
  })

  it('calls onTranspose when clicking up', async () => {
    const user = userEvent.setup()
    let called = 0
    render(<SongControls {...defaultProps} onTranspose={() => called++} />)
    await user.click(screen.getByLabelText('העלה חצי טון'))
    expect(called).toBe(1)
  })

  it('renders font size controls', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getByLabelText('הקטן פונט')).toBeInTheDocument()
    expect(screen.getByLabelText('הגדל פונט')).toBeInTheDocument()
  })

  it('renders auto-scroll toggle', () => {
    render(<SongControls {...defaultProps} />)
    expect(screen.getByLabelText('גלילה אוטומטית')).toBeInTheDocument()
  })
})
