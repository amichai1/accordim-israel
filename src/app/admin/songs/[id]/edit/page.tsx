'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseChordPro } from '@/lib/chordpro/parser'
import ChordLine from '@/components/song/ChordLine'
import { Save, Eye } from 'lucide-react'
import { slugify } from '@/lib/utils'
import type { Artist } from '@/lib/supabase/types'

export default function EditSongPage() {
  const { id } = useParams<{ id: string }>()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [artistId, setArtistId] = useState('')
  const [originalKey, setOriginalKey] = useState('')
  const [language, setLanguage] = useState('he')
  const [genre, setGenre] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: song }, { data: artistList }] = await Promise.all([
        supabase.from('songs').select('*').eq('id', id).single(),
        supabase.from('artists').select('*').order('name'),
      ])

      if (song) {
        setTitle(song.title)
        setContent(song.content)
        setArtistId(song.artist_id || '')
        setOriginalKey(song.original_key || '')
        setLanguage(song.language)
        setGenre(song.genre || '')
      }
      if (artistList) setArtists(artistList)
      setLoading(false)
    }
    load()
  }, [id])

  const parsed = parseChordPro(content)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('songs')
      .update({
        title: title.trim(),
        slug: slugify(title),
        artist_id: artistId || null,
        content,
        original_key: originalKey || null,
        language,
        genre: genre || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError('שגיאה בשמירה: ' + error.message)
      setSaving(false)
      return
    }

    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-[var(--muted)]">
        טוען...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">עריכת שיר</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">שם השיר</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">אמן</label>
                <select
                  value={artistId}
                  onChange={(e) => setArtistId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">ללא</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">סולם</label>
                <input
                  type="text"
                  value={originalKey}
                  onChange={(e) => setOriginalKey(e.target.value)}
                  placeholder="Am"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">שפה</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="he">עברית</option>
                  <option value="en">אנגלית</option>
                  <option value="fr">צרפתית</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ז&apos;אנר</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="פופ"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">תוכן (ChordPro)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                dir="ltr"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] font-mono text-sm focus:outline-none focus:border-[var(--primary)] resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye size={18} className="text-[var(--primary)]" />
              <span className="text-sm font-medium">תצוגה מקדימה</span>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] min-h-[400px]">
              {parsed.meta.title && (
                <h2 className="text-xl font-bold mb-1">{parsed.meta.title}</h2>
              )}
              {parsed.meta.artist && (
                <p className="text-sm text-[var(--muted)] mb-4">{parsed.meta.artist}</p>
              )}
              <div dir={language === 'he' ? 'rtl' : 'ltr'}>
                {parsed.sections.map((section, si) => (
                  <div key={si} className="mb-3">
                    {section.label && (
                      <div className="section-label">
                        {section.type === 'comment' ? section.label : `── ${section.label} ──`}
                      </div>
                    )}
                    {section.lines.map((line, li) => (
                      <ChordLine key={li} line={line} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
