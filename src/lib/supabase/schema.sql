-- ========================================
-- סכמת מסד נתונים - אקורדים ישראל
-- להריץ ב-Supabase SQL Editor
-- ========================================

-- אמנים
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- שירים
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  artist_id UUID REFERENCES artists(id),
  content TEXT NOT NULL,
  original_key TEXT,
  language TEXT DEFAULT 'he',
  genre TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- מועדפים
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- אינדקס חיפוש
CREATE INDEX songs_search_idx ON songs
  USING gin(to_tsvector('simple', title || ' ' || content));

-- פרופילים עם תפקיד (user / admin)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- טריגר - יוצר פרופיל אוטומטית בהרשמה
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- פונקציה שבודקת אם המשתמש הנוכחי אדמין
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- הרשאות RLS (Row Level Security)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- כולם יכולים לקרוא שירים ואמנים
CREATE POLICY "Public read artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read songs" ON songs FOR SELECT USING (true);
-- עדכון צפיות דרך פונקציה בלבד (לא דרך UPDATE ישיר)
CREATE OR REPLACE FUNCTION public.increment_song_views(song_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE songs SET views = views + 1 WHERE slug = song_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- פרופילים - כל משתמש קורא רק את שלו
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- מועדפים - רק המשתמש שלו
CREATE POLICY "Users read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- שירים ואמנים - רק אדמין יכול לנהל
CREATE POLICY "Admin insert songs" ON songs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update songs" ON songs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete songs" ON songs FOR DELETE USING (public.is_admin());
CREATE POLICY "Admin insert artists" ON artists FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update artists" ON artists FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete artists" ON artists FOR DELETE USING (public.is_admin());

-- ========================================
-- נתוני דוגמה
-- ========================================

-- אמנים
INSERT INTO artists (id, name, slug) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Leonard Cohen', 'leonard-cohen'),
  ('a1000000-0000-0000-0000-000000000002', 'שלמה ארצי', 'shlomo-artzi'),
  ('a1000000-0000-0000-0000-000000000003', 'אריק איינשטיין', 'arik-einstein'),
  ('a1000000-0000-0000-0000-000000000004', 'עידן רייכל', 'idan-raichel');

-- שירים
INSERT INTO songs (id, title, slug, artist_id, content, original_key, language, genre, views) VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  'הללויה',
  'hallelujah',
  'a1000000-0000-0000-0000-000000000001',
  '{title: הללויה}
{artist: Leonard Cohen}
{key: C}

[Am]שמעתי שיש [C]אקורד סודי
[Am]שדוד היה מנגן [C]וזה מצא חן בעיני
[F]אבל אתה לא [G]ממש בעניין של [C]מוזיקה [G]נכון
[C]לא משנה [F]אז ככה זה [G]הולך
[Am]הרביעית [F]החמישית
[Am]מינור יורד [F]מז''ור עולה
[G]והמלך הנבוך [E7]מלחין הללו[Am]יה

{soc: פזמון}
[F]הללויה [Am]הללויה
[F]הללויה [C]הללו[G]יה
{eoc}',
  'C', 'he', 'פופ', 1250
),
(
  'b1000000-0000-0000-0000-000000000002',
  'לא עוזב את העיר הזאת',
  'lo-ozev-et-hair-hazot',
  'a1000000-0000-0000-0000-000000000002',
  '{title: לא עוזב את העיר הזאת}
{artist: שלמה ארצי}
{key: Em}

{sov: בית 1}
[Em]לא עוזב את העיר ה[Am]זאת
[C]לא עוזב את הרח[G]בות
[Em]את הלילות [Am]הגדולים
[B7]את האורות והחש[Em]בות
{eov}

{soc: פזמון}
[C]עיר [G]עיר [Am]שלי
[Em]לא [B7]אעזוב [Em]אותך
[C]עיר [G]עיר [Am]שלי
[Em]לא [B7]אשכח [Em]אותך
{eoc}',
  'Em', 'he', 'רוק', 980
),
(
  'b1000000-0000-0000-0000-000000000003',
  'אני ואתה',
  'ani-veata',
  'a1000000-0000-0000-0000-000000000003',
  '{title: אני ואתה}
{artist: אריק איינשטיין}
{key: G}

[G]אני ואתה [C]נשנה את העו[G]לם
[G]אני ואתה [D]אז יבואו כבר כו[G]לם
[Em]אמרו את [C]זה קודם לפ[G]ני
[Em]זה לא [C]משנה כי [D]אני מתחיל [G]מהתחלה

{soc: פזמון}
[C]אני ואתה [G]נשנה את העולם
[C]אני ואתה [D]אז יבואו כבר כו[G]לם
{eoc}',
  'G', 'he', 'פופ', 2100
),
(
  'b1000000-0000-0000-0000-000000000004',
  'מילים יפות',
  'milim-yafot',
  'a1000000-0000-0000-0000-000000000004',
  '{title: מילים יפות}
{artist: עידן רייכל}
{key: Am}

{comment: פתיח}
[Am] [G] [F] [E7]

{sov: בית 1}
[Am]מילים יפות [G]אמרת לי
[F]מילים שלא [E7]שמעתי
[Am]נגעת בי [G]בלי לגעת
[F]ולא הרפ[E7]ית
{eov}

{soc: פזמון}
[F]את לי [C]מילים יפות
[Dm]את לי [Am]שמש חדשה
[F]את לי [C]מילים יפות
[E7]את לי [Am]הכל
{eoc}',
  'Am', 'he', 'פופ-אתני', 750
);
