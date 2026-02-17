import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import type { Artist } from '@/lib/supabase/types'

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-colors"
    >
      {artist.image_url ? (
        <Image
          src={artist.image_url}
          alt={artist.name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
          <User size={24} />
        </div>
      )}
      <span className="font-medium text-sm text-center">{artist.name}</span>
    </Link>
  )
}
