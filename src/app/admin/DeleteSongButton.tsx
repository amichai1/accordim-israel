'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteSongButtonProps {
  songId: string
  songTitle: string
}

export default function DeleteSongButton({ songId, songTitle }: DeleteSongButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`למחוק את "${songTitle}"?`)) return

    const supabase = createClient()
    await supabase.from('songs').delete().eq('id', songId)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-500"
    >
      <Trash2 size={14} />
    </button>
  )
}
