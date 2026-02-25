'use client'

import Link from 'next/link'
import { Music } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2 text-[var(--primary)] font-bold text-lg">
          <Music size={24} />
          <span>אקורדים ישראל</span>
        </Link>

        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="text-sm px-3 py-2.5 sm:py-1.5 rounded-lg hover:bg-[var(--border)] transition-colors min-h-[44px] sm:min-h-0 flex items-center"
          >
            כניסה
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-2">
        <SearchBar />
      </div>
    </header>
  )
}
