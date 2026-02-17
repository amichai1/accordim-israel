import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Edit, Music, Users } from 'lucide-react'
import type { Metadata } from 'next'
import DeleteSongButton from './DeleteSongButton'

export const metadata: Metadata = {
  title: 'ניהול | אקורדים ישראל',
}

export default async function AdminPage() {
  const supabase = await createClient()

  // בדיקת הרשאות - רק אדמין
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const [{ data: songs }, { data: artists }] = await Promise.all([
    supabase.from('songs').select('*, artist:artists(name)').order('created_at', { ascending: false }),
    supabase.from('artists').select('*').order('name'),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ניהול</h1>
        <Link
          href="/admin/songs/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          שיר חדש
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
            <Music size={18} />
            <span className="text-sm font-medium">שירים</span>
          </div>
          <span className="text-2xl font-bold">{songs?.length || 0}</span>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
            <Users size={18} />
            <span className="text-sm font-medium">אמנים</span>
          </div>
          <span className="text-2xl font-bold">{artists?.length || 0}</span>
        </div>
      </div>

      {/* Songs table */}
      <h2 className="text-lg font-bold mb-3">שירים</h2>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)]">
        <table className="w-full">
          <thead className="bg-[var(--background)] text-sm text-[var(--muted)]">
            <tr>
              <th className="text-right px-4 py-2">שיר</th>
              <th className="text-right px-4 py-2">אמן</th>
              <th className="text-right px-4 py-2">סולם</th>
              <th className="text-right px-4 py-2">צפיות</th>
              <th className="px-4 py-2 w-24">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {songs?.map((song: { id: string; title: string; artist?: { name: string }; original_key: string | null; views: number }) => (
              <tr key={song.id} className="hover:bg-[var(--background)]/50">
                <td className="px-4 py-2 font-medium">{song.title}</td>
                <td className="px-4 py-2 text-sm text-[var(--muted)]">{song.artist?.name}</td>
                <td className="px-4 py-2 text-sm text-[var(--chord)]">{song.original_key}</td>
                <td className="px-4 py-2 text-sm">{song.views}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/songs/${song.id}/edit`}
                      className="p-1.5 rounded hover:bg-[var(--border)] transition-colors text-[var(--primary)]"
                    >
                      <Edit size={14} />
                    </Link>
                    <DeleteSongButton songId={song.id} songTitle={song.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
