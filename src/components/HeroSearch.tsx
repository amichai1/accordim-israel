'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import SearchResults from './layout/SearchResults'
import type { Song, Artist } from '@/lib/supabase/types'

interface SearchResult {
  songs: (Song & { artist: Artist })[]
  artists: Artist[]
}

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
        setIsOpen(true)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => search(value), 300)
  }

  function goToSearchPage() {
    if (query.trim().length >= 2) {
      setIsOpen(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      goToSearchPage()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative max-w-lg mx-auto">
      <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results && setIsOpen(true)}
        placeholder="חפש שיר, אמן או מילים..."
        className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
      />
      {isOpen && results && (
        <SearchResults
          results={results}
          loading={loading}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
