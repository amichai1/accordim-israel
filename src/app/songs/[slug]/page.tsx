import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SongView from '@/components/song/SongView'
import SuggestedSongs from '@/components/song/SuggestedSongs'
import type { Metadata } from 'next'
import type { SongWithArtist } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
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
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: song } = await supabase
    .from('songs')
    .select('*, artist:artists(*)')
    .eq('slug', slug)
    .single()

  if (!song) notFound()

  // Increment views via secure server function
  await supabase.rpc('increment_song_views', { song_slug: slug })

  // Fetch random suggested songs (excluding current song)
  const { data: suggestedSongs } = await supabase
    .from('songs')
    .select('*, artist:artists(*)')
    .neq('slug', slug)
    .order('views', { ascending: false })
    .limit(20)

  // Shuffle and take 8
  const shuffled = (suggestedSongs || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, 8) as SongWithArtist[]

  const artist = song.artist as unknown as { name: string; slug: string }

  return (
    <div className="mx-auto max-w-3xl px-4">
      <SongView
        content={song.content}
        title={song.title}
        artist={artist.name}
        artistSlug={artist.slug}
        originalKey={song.original_key}
        slug={song.slug}
        language={song.language}
      />
      <SuggestedSongs songs={shuffled} />
    </div>
  )
}
