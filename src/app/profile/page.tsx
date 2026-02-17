import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SongCard from '@/components/SongCard'
import { Heart } from 'lucide-react'
import type { Metadata } from 'next'
import type { SongWithArtist } from '@/lib/supabase/types'
import LogoutButton from './LogoutButton'

export const metadata: Metadata = {
  title: 'הפרופיל שלי | אקורדים ישראל',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: favorites } = await supabase
    .from('favorites')
    .select('song_id, song:songs(*, artist:artists(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">הפרופיל שלי</h1>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart size={20} className="text-[var(--chord)]" />
          <h2 className="text-xl font-bold">שירים מועדפים</h2>
        </div>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(favorites as unknown as { song_id: string; song: SongWithArtist }[]).map((fav) => (
              <SongCard key={fav.song_id} song={fav.song} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[var(--muted)] py-12">
            עדיין לא הוספת שירים למועדפים
          </p>
        )}
      </section>
    </div>
  )
}
