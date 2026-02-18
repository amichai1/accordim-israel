import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeSearchQuery } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q')
  const q = raw ? sanitizeSearchQuery(raw) : ''
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
