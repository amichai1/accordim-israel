import Link from 'next/link'
import { Music, Eye } from 'lucide-react'
import type { Song, Artist } from '@/lib/supabase/types'

interface SongCardProps {
  song: Song & { artist: Artist }
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return String(views)
}

export default function SongCard({ song }: SongCardProps) {
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Music size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold truncate">{song.title}</h3>
          {song.artist?.slug ? (
            <p
              className="text-sm text-[var(--muted)] truncate hover:text-[var(--primary)] hover:underline transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/artists/${song.artist.slug}`
              }}
              role="link"
            >
              {song.artist.name}
            </p>
          ) : (
            <p className="text-sm text-[var(--muted)] truncate">{song.artist?.name}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {song.original_key && (
              <span className="text-xs text-[var(--chord)] font-semibold bg-[var(--chord)]/10 px-1.5 py-0.5 rounded">
                {song.original_key}
              </span>
            )}
            {song.views > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                <Eye size={12} />
                {formatViews(song.views)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
