import { createClient } from '@/lib/supabase/server'
import SongCard from '@/components/SongCard'
import ArtistCard from '@/components/ArtistCard'
import { Search } from 'lucide-react'
import type { SongWithArtist, Artist } from '@/lib/supabase/types'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: popularSongs },
    { data: recentSongs },
    { data: artists },
  ] = await Promise.all([
    supabase
      .from('songs')
      .select('*, artist:artists(*)')
      .order('views', { ascending: false })
      .limit(6),
    supabase
      .from('songs')
      .select('*, artist:artists(*)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('artists')
      .select('*')
      .order('name')
      .limit(8),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      {/* Hero search */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">אקורדים ישראל</h1>
        <p className="text-[var(--muted)] mb-6">אקורדים לשירים ישראליים ובינלאומיים</p>
        <div className="relative max-w-lg mx-auto">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="חפש שיר, אמן או מילים..."
            className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
            readOnly
          />
        </div>
      </div>

      {/* Popular songs */}
      {popularSongs && popularSongs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">שירים פופולריים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {popularSongs.map((song: SongWithArtist) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Recent songs */}
      {recentSongs && recentSongs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">נוספו לאחרונה</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {recentSongs.map((song: SongWithArtist) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {artists && artists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">אמנים</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 stagger-children">
            {artists.map((artist: Artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
