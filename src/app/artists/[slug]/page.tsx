import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import SongCard from '@/components/SongCard'
import { User } from 'lucide-react'
import type { Metadata } from 'next'
import type { SongWithArtist } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()
  const { data: artist } = await supabase
    .from('artists')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!artist) return { title: 'אמן לא נמצא' }
  return {
    title: `${artist.name} - אקורדים | אקורדים ישראל`,
    description: `אקורדים לשירים של ${artist.name}`,
  }
}

export default async function ArtistPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: artist } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!artist) notFound()

  const { data: songs } = await supabase
    .from('songs')
    .select('*, artist:artists(*)')
    .eq('artist_id', artist.id)
    .order('title')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Artist header */}
      <div className="flex items-center gap-4 mb-8">
        {artist.image_url ? (
          <Image
            src={artist.image_url}
            alt={artist.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <User size={32} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{artist.name}</h1>
          <p className="text-sm text-[var(--muted)]">{songs?.length || 0} שירים</p>
        </div>
      </div>

      {/* Songs list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {songs?.map((song: SongWithArtist) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
      {(!songs || songs.length === 0) && (
        <p className="text-center text-[var(--muted)] py-12">אין שירים עדיין</p>
      )}
    </div>
  )
}
