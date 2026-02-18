# Accordim Israel 🎸

**A modern chord & lyrics platform for Israeli and international music.**

Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. Displays chords above lyrics with full RTL/LTR support, real-time transpose, auto-scroll, dark mode, and an admin panel for content management.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-54_passing-brightgreen)]()

---

## Features

| Feature | Description |
|---|---|
| **Chord Rendering** | ChordPro format — chords displayed inline above lyrics using CSS flex |
| **Transpose** | Shift chords up/down by semitone, displays current key |
| **Auto-Scroll** | Adjustable speed scroll for hands-free playing |
| **Font Size** | 3 levels (small / medium / large) |
| **Search** | Debounced dropdown with instant results + full search page |
| **Dark / Light Mode** | Theme toggle with localStorage persistence |
| **Auth** | Email sign-up & login via Supabase Auth |
| **Favorites** | Save songs to personal favorites list |
| **Admin Panel** | Add / edit / delete songs with live ChordPro preview |
| **RTL + LTR** | Full bidirectional support (Hebrew, English, French) |
| **Security** | Row Level Security, SECURITY DEFINER functions, input sanitization |

---

## Tech Stack

```
Frontend       Next.js 15 (App Router) · React 18 · TypeScript
Styling        Tailwind CSS 4
Database       Supabase (PostgreSQL + Auth + RLS)
Testing        Vitest + React Testing Library (54 tests)
Icons          Lucide React
Fonts          Heebo (Hebrew) · Inter (Latin)
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Home — popular songs, recent, artists
│   ├── songs/[slug]/           # Song page — chords, transpose, controls
│   ├── artists/                # Artist listing + individual artist pages
│   ├── search/                 # Search results page
│   ├── auth/                   # Login & registration
│   ├── profile/                # User profile + favorites
│   ├── admin/                  # Admin dashboard, song editor
│   └── api/                    # API routes (search, favorites)
├── components/
│   ├── layout/                 # Header, Footer, SearchBar, ThemeToggle
│   └── song/                   # SongView, ChordLine, ChordWord, Controls
├── lib/
│   ├── chordpro/               # Parser + transpose engine
│   └── supabase/               # Client, server, types, schema
└── __tests__/                  # Unit & component tests
```

---

## ChordPro Format

Songs are stored in [ChordPro](https://www.chordpro.org/) format — chords embedded in square brackets within lyrics:

```
{title: הללויה}
{artist: Leonard Cohen}
{key: C}

[Am]שמעתי שיש [C]אקורד סודי
[Am]שדוד היה מנגן [C]וזה מצא חן בעיני

{soc: פזמון}
[F]הללויה [Am]הללויה
[F]הללויה [C]הללו[G]יה
{eoc}
```

**Supported directives:** `{title}`, `{artist}`, `{key}`, `{soc}`/`{eoc}` (chorus), `{sov}`/`{eov}` (verse), `{comment}`.

Transpose is computed client-side — no database changes needed.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/amichai1/accordim-israel.git
cd accordim-israel
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **Settings > API** and copy the URL, anon key, and service role key
3. Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx
```

4. Open **SQL Editor** in Supabase and run the contents of `src/lib/supabase/schema.sql` — this creates all tables, RLS policies, and sample data

5. *(Optional)* For local development, disable "Confirm email" in **Authentication > Providers > Email**

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Promote a user to admin

After registering, run in the Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

---

## Security

- **Row Level Security (RLS)** — public read, admin-only write, user-scoped favorites
- **SECURITY DEFINER functions** — song view counter incremented via server function, not direct UPDATE
- **Input sanitization** — search queries stripped of special characters (`%`, `_`, `\`)
- **No secrets in code** — all credentials stored in `.env.local` (gitignored)

---

## Deploy

Ready for [Vercel](https://vercel.com):

1. Connect the repository
2. Set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy

---

## License

MIT
