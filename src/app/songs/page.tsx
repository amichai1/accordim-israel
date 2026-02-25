import { createClient } from '@/lib/supabase/server'
import SongCard from '@/components/SongCard'
import type { Metadata } from 'next'
import type { SongWithArtist } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'כל השירים | אקורדים ישראל',
  description: 'רשימת כל השירים עם אקורדים באתר אקורדים ישראל',
}

export default async function AllSongsPage() {
  const supabase = await createClient()

  const { data: songs } = await supabase
    .from('songs')
    .select('*, artist:artists(*)')
    .order('title')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">כל השירים</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {songs?.length || 0} שירים במאגר
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
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
