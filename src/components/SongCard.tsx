import Link from 'next/link'
import { Music } from 'lucide-react'
import type { Song, Artist } from '@/lib/supabase/types'

interface SongCardProps {
  song: Song & { artist: Artist }
}

export default function SongCard({ song }: SongCardProps) {
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Music size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold truncate">{song.title}</h3>
          <p className="text-sm text-[var(--muted)] truncate">{song.artist?.name}</p>
          {song.original_key && (
            <span className="text-xs text-[var(--chord)] font-medium mt-1 inline-block">
              {song.original_key}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
