'use client'

import Link from 'next/link'
import { Music, User } from 'lucide-react'
import type { Song, Artist } from '@/lib/supabase/types'

interface SearchResultsProps {
  results: {
    songs: (Song & { artist: Artist })[]
    artists: Artist[]
  }
  loading: boolean
  onClose: () => void
}

export default function SearchResults({ results, loading, onClose }: SearchResultsProps) {
  const hasSongs = results.songs.length > 0
  const hasArtists = results.artists.length > 0
  const hasResults = hasSongs || hasArtists

  return (
    <div className="absolute top-full mt-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      {loading && (
        <div className="p-3 text-center text-sm text-[var(--muted)]">מחפש...</div>
      )}

      {!loading && !hasResults && (
        <div className="p-3 text-center text-sm text-[var(--muted)]">לא נמצאו תוצאות</div>
      )}

      {hasSongs && (
        <div>
          <div className="px-3 py-1.5 text-xs font-bold text-[var(--muted)] bg-[var(--background)]">
            שירים
          </div>
          {results.songs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--background)] transition-colors"
            >
              <Music size={14} className="text-[var(--primary)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{song.title}</div>
                <div className="text-xs text-[var(--muted)] truncate">{song.artist?.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasArtists && (
        <div>
          <div className="px-3 py-1.5 text-xs font-bold text-[var(--muted)] bg-[var(--background)]">
            אמנים
          </div>
          {results.artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--background)] transition-colors"
            >
              <User size={14} className="text-[var(--primary)] shrink-0" />
              <div className="text-sm font-medium truncate">{artist.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
