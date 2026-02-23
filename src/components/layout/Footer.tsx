import Link from 'next/link'
import { Music } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-12">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--primary)] font-bold">
            <Music size={20} />
            <span>אקורדים ישראל</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-[var(--muted)]" aria-label="ניווט תחתון">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">
              דף הבית
            </Link>
            <Link href="/artists" className="hover:text-[var(--primary)] transition-colors">
              אמנים
            </Link>
            <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">
              תקנון
            </Link>
            <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">
              מדיניות פרטיות
            </Link>
            <Link href="/accessibility" className="hover:text-[var(--primary)] transition-colors">
              הצהרת נגישות
            </Link>
          </nav>
          <div className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} אקורדים ישראל
          </div>
        </div>
      </div>
    </footer>
  )
}
