# אקורדים ישראל 🎸

אתר אקורדים לשירים ישראליים ובינלאומיים. מציג אקורדים מעל מילים, תומך בטרנספוז, מצב כהה/בהיר, וממשק ניהול לשירים.

## טכנולוגיות

| שכבה | טכנולוגיה |
|---|---|
| Frontend | Next.js 15 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS 4 |
| Database + Auth | Supabase (PostgreSQL + Auth + RLS) |
| Testing | Vitest + React Testing Library |
| Icons | Lucide React |
| Fonts | Heebo (עברית) + Inter (אנגלית) |

## תכונות

- **דף שיר** - אקורדים מעל מילים בפורמט ChordPro, תמיכה ב-RTL + LTR
- **טרנספוז** - העלאה/הורדה בחצי טון, מציג את הסולם הנוכחי
- **גודל פונט** - 3 רמות (קטן / בינוני / גדול)
- **גלילה אוטומטית** - עם בקרת מהירות
- **חיפוש** - dropdown מהיר בהקלדה + דף תוצאות ב-Enter
- **Dark / Light mode** - עם שמירת העדפה
- **הרשמה וכניסה** - דרך Supabase Auth
- **מועדפים** - שמירת שירים אהובים (למשתמשים רשומים)
- **ממשק Admin** - הוספה/עריכה/מחיקה של שירים עם תצוגה מקדימה חיה
- **RLS** - רק אדמין יכול לנהל תוכן, קריאה פתוחה לכולם

## מבנה הפרויקט

```
src/
├── app/                    # דפים (Next.js App Router)
│   ├── page.tsx            # דף הבית
│   ├── songs/[slug]/       # דף שיר
│   ├── artists/            # רשימת אמנים + דף אמן
│   ├── search/             # דף תוצאות חיפוש
│   ├── auth/               # כניסה + הרשמה
│   ├── profile/            # פרופיל + מועדפים
│   ├── admin/              # ניהול שירים ואמנים
│   └── api/                # API routes (search, favorites)
├── components/
│   ├── layout/             # Header, Footer, SearchBar, ThemeToggle
│   └── song/               # SongView, ChordLine, ChordWord, SongControls
├── lib/
│   ├── chordpro/           # Parser + Transpose
│   └── supabase/           # Client, Server, Types, Schema
└── __tests__/              # בדיקות (54 tests)
```

## התקנה והרצה

### דרישות מקדימות
- Node.js 18+
- חשבון [Supabase](https://supabase.com) (חינמי)

### 1. שכפול הפרויקט

```bash
git clone https://github.com/amichai1/accordim-israel.git
cd accordim-israel
npm install
```

### 2. הגדרת Supabase

1. צרו פרויקט חדש ב-[Supabase Dashboard](https://supabase.com/dashboard)
2. לכו ל-**Settings > API** והעתיקו את ה-URL וה-anon key
3. צרו קובץ `.env.local` בתיקיית הפרויקט:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx
```

4. לכו ל-**SQL Editor** ב-Supabase והריצו את התוכן של `src/lib/supabase/schema.sql` - זה יוצר את כל הטבלאות, ההרשאות, ונתוני דוגמה

5. (אופציונלי) ב-**Authentication > Providers > Email** - כבו "Confirm email" לפיתוח מקומי

### 3. הרצה

```bash
npm run dev
```

האתר יעלה ב-http://localhost:3000

### 4. הפיכת משתמש לאדמין

אחרי הרשמה, הריצו ב-SQL Editor של Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## פקודות

| פקודה | תיאור |
|---|---|
| `npm run dev` | הרצה מקומית (פורט 3000) |
| `npm run build` | בנייה לפרודקשן |
| `npm run start` | הרצת גרסת פרודקשן |
| `npm run test` | הרצת בדיקות |
| `npm run test:watch` | בדיקות במצב watch |
| `npm run lint` | בדיקת ESLint |

## פורמט ChordPro

השירים נשמרים בפורמט [ChordPro](https://www.chordpro.org/) - אקורדים בסוגריים מרובעים בתוך המילים:

```
{title: הללויה}
{artist: Leonard Cohen}
{key: C}

[Am]שמעתי שיש [C]אקורד סודי
[Am]שדוד היה מנגן [C]וזה מצא חן בעיני

{soc: פזמון}
[F]הללויה [Am]הללויה
{eoc}
```

**דירקטיבות נתמכות:**
- `{title}`, `{artist}`, `{key}` - מטאדאטה
- `{soc}` / `{eoc}` - תחילת/סוף פזמון
- `{sov}` / `{eov}` - תחילת/סוף בית
- `{comment: טקסט}` - הערה (פתיח, סולו, מעבר)

## Deploy

הפרויקט מוכן ל-deploy ב-[Vercel](https://vercel.com):

1. חברו את הריפו ב-Vercel
2. הגדירו את משתני הסביבה (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy!
