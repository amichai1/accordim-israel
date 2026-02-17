import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) {
    return NextResponse.json({ songs: [], artists: [] })
  }

  const supabase = await createClient()

  const [songsResult, artistsResult] = await Promise.all([
    supabase
      .from('songs')
      .select('*, artist:artists(*)')
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(5),
    supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(3),
  ])

  return NextResponse.json({
    songs: songsResult.data || [],
    artists: artistsResult.data || [],
  })
}
