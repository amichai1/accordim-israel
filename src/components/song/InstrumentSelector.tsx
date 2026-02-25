'use client'

import { Guitar, Piano } from 'lucide-react'
import type { InstrumentType } from '@/lib/chordpro/chordData'

interface InstrumentSelectorProps {
  instrument: InstrumentType
  onChange: (instrument: InstrumentType) => void
}

function UkuleleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6" />
      <circle cx="12" cy="11" r="3" />
      <path d="M12 14v8" />
      <path d="M9 18h6" />
    </svg>
  )
}

const instruments: { type: InstrumentType; label: string; icon: React.ReactNode }[] = [
  { type: 'guitar', label: 'גיטרה', icon: <Guitar size={16} /> },
  { type: 'ukulele', label: 'יוקלילה', icon: <UkuleleIcon size={16} /> },
  { type: 'piano', label: 'פסנתר', icon: <Piano size={16} /> },
]

export default function InstrumentSelector({ instrument, onChange }: InstrumentSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {instruments.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          aria-label={label}
          title={label}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            instrument === type
              ? 'bg-[var(--primary)] text-white'
              : 'hover:bg-[var(--border)] text-[var(--muted)]'
          }`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
