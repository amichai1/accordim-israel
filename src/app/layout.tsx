import type { Metadata } from 'next'
import { Heebo, Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AccessibilityWidget from '@/components/layout/AccessibilityWidget'
import './globals.css'

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['hebrew', 'latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'אקורדים ישראל - אקורדים לשירים ישראליים',
  description: 'אקורדים לשירים ישראליים ובינלאומיים. חפשו שירים, אמנים ואקורדים בקלות.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
              try {
                const a = localStorage.getItem('a11y');
                if (a) {
                  const p = JSON.parse(a);
                  if (p.fontScale && p.fontScale !== 100) document.documentElement.style.fontSize = p.fontScale + '%';
                  if (p.highContrast) document.documentElement.classList.add('high-contrast');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${heebo.variable} ${inter.variable} font-[family-name:var(--font-heebo)] antialiased min-h-screen flex flex-col`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:bg-[var(--primary)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          דלג לתוכן
        </a>
        <Header />
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <Footer />
        <AccessibilityWidget />
      </body>
    </html>
  )
}
