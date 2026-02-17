import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SongView from '@/components/song/SongView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: song } = await supabase
    .from('songs')
    .select('title, artist:artists(name)')
    .eq('slug', slug)
    .single()

  if (!song) return { title: 'שיר לא נמצא' }

  const artistName = (song.artist as unknown as { name: string })?.name
  return {
    title: `${song.title} - ${artistName} | אקורדים ישראל`,
    description: `אקורדים ל${song.title} של ${artistName}`,
  }
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: song } = await supabase
    .from('songs')
    .select('*, artist:artists(*)')
    .eq('slug', slug)
    .single()

  if (!song) notFound()

  // Increment views
  await supabase
    .from('songs')
    .update({ views: (song.views || 0) + 1 })
    .eq('id', song.id)

  const artist = song.artist as unknown as { name: string; slug: string }

  return (
    <SongView
      content={song.content}
      title={song.title}
      artist={artist.name}
      originalKey={song.original_key}
      slug={song.slug}
      language={song.language}
    />
  )
}
