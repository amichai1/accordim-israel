'use client'

import Link from 'next/link'
import { Music } from 'lucide-react'
import type { SongWithArtist } from '@/lib/supabase/types'

interface SuggestedSongsProps {
  songs: SongWithArtist[]
}

export default function SuggestedSongs({ songs }: SuggestedSongsProps) {
  if (songs.length === 0) return null

  return (
    <section className="mt-10 mb-8">
      <h2 className="text-lg font-bold mb-4">שירים נוספים</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {songs.map((song) => (
          <Link
            key={song.id}
            href={`/songs/${song.slug}`}
            className="flex-shrink-0 w-48 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 snap-start"
          >
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                <Music size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm truncate">{song.title}</h3>
                <p className="text-xs text-[var(--muted)] truncate">{song.artist?.name}</p>
                {song.original_key && (
                  <span className="text-xs text-[var(--chord)] font-semibold mt-1 inline-block">
                    {song.original_key}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
