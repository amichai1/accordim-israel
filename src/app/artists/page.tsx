import { createClient } from '@/lib/supabase/server'
import ArtistCard from '@/components/ArtistCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'אמנים | אקורדים ישראל',
  description: 'רשימת אמנים - אקורדים לשירים ישראליים ובינלאומיים',
}

export default async function ArtistsPage() {
  const supabase = await createClient()
  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .order('name')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">אמנים</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {artists?.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
      {(!artists || artists.length === 0) && (
        <p className="text-center text-[var(--muted)] py-12">אין אמנים עדיין</p>
      )}
    </div>
  )
}
