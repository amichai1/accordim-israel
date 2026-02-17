import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ favorites: [] }, { status: 401 })
  }

  const { data } = await supabase
    .from('favorites')
    .select('song_id')
    .eq('user_id', user.id)

  return NextResponse.json({ favorites: data?.map(f => f.song_id) || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
  }

  const { song_id } = await request.json()

  // Toggle: check if exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('song_id', song_id)
    .single()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    return NextResponse.json({ favorited: false })
  }

  await supabase.from('favorites').insert({ user_id: user.id, song_id })
  return NextResponse.json({ favorited: true })
}
