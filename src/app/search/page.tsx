import { createClient } from '@/lib/supabase/server'
import SongCard from '@/components/SongCard'
import ArtistCard from '@/components/ArtistCard'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'
import type { SongWithArtist, Artist } from '@/lib/supabase/types'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `חיפוש: ${q} | אקורדים ישראל` : 'חיפוש | אקורדים ישראל',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams

  if (!q || q.length < 2) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Search size={48} className="mx-auto mb-4 text-[var(--muted)]" />
        <p className="text-[var(--muted)]">הקלד לפחות 2 תווים לחיפוש</p>
      </div>
    )
  }

  const supabase = await createClient()

  const [{ data: songs }, { data: artists }] = await Promise.all([
    supabase
      .from('songs')
      .select('*, artist:artists(*)')
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(20),
    supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(10),
  ])

  const hasSongs = songs && songs.length > 0
  const hasArtists = artists && artists.length > 0
  const hasResults = hasSongs || hasArtists

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">תוצאות חיפוש</h1>
      <p className="text-sm text-[var(--muted)] mb-6">{`"${q}"`}</p>

      {!hasResults && (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto mb-4 text-[var(--muted)]" />
          <p className="text-[var(--muted)]">לא נמצאו תוצאות</p>
        </div>
      )}

      {hasArtists && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">אמנים</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {artists.map((artist: Artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {hasSongs && (
        <section>
          <h2 className="text-lg font-bold mb-3">שירים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(songs as unknown as SongWithArtist[]).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
