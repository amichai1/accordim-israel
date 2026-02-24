import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import type { Artist } from '@/lib/supabase/types'

interface ArtistCardProps {
  artist: Artist
  songCount?: number
}

export default function ArtistCard({ artist, songCount }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {artist.image_url ? (
        <Image
          src={artist.image_url}
          alt={artist.name}
          width={72}
          height={72}
          className="w-18 h-18 rounded-full object-cover ring-2 ring-[var(--border)]"
        />
      ) : (
        <div className="w-18 h-18 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center ring-2 ring-[var(--border)]">
          <User size={28} />
        </div>
      )}
      <span className="font-medium text-sm text-center">{artist.name}</span>
      {songCount !== undefined && songCount > 0 && (
        <span className="text-xs text-[var(--muted)]">
          {songCount} {songCount === 1 ? 'שיר' : 'שירים'}
        </span>
      )}
    </Link>
  )
}
