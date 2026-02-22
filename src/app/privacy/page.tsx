import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | אקורדים ישראל',
  description: 'מדיניות הפרטיות של אתר אקורדים ישראל',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">מדיניות פרטיות</h1>
      <p className="text-sm text-[var(--muted)] mb-8">עדכון אחרון: פברואר 2026</p>

      <div className="space-y-6 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">1. כללי</h2>
          <p>
            אתר &quot;אקורדים ישראל&quot; (להלן: &quot;האתר&quot;) מכבד את
            פרטיות המשתמשים. מדיניות פרטיות זו מפרטת כיצד אנו אוספים,
            משתמשים ומגנים על המידע האישי שלך, בהתאם לחוק הגנת הפרטיות,
            התשמ&quot;א-1981 ותקנותיו.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. מידע שאנו אוספים</h2>

          <h3 className="font-bold mt-3 mb-1">2.1 מידע שאתה מספק לנו</h3>
          <ul className="list-disc pr-6 space-y-1">
            <li>כתובת דואר אלקטרוני - בעת הרשמה לאתר</li>
            <li>שם משתמש - בעת הרשמה לאתר</li>
            <li>סיסמה - מאוחסנת בצורה מוצפנת</li>
          </ul>

          <h3 className="font-bold mt-3 mb-1">2.2 מידע שנאסף אוטומטית</h3>
          <ul className="list-disc pr-6 space-y-1">
            <li>כתובת IP</li>
            <li>סוג דפדפן ומערכת הפעלה</li>
            <li>דפים שנצפו ומשך הביקור</li>
            <li>העדפות שמירה מקומית (localStorage) כגון מצב תצוגה (בהיר/כהה)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. שימוש במידע</h2>
          <p>אנו משתמשים במידע שנאסף למטרות הבאות:</p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>אימות זהות והתחברות לחשבון</li>
            <li>שמירת רשימת שירים מועדפים</li>
            <li>שיפור חוויית השימוש באתר</li>
            <li>ניתוח סטטיסטי של שימוש באתר (אנונימי)</li>
            <li>יצירת קשר בנוגע לשירותי האתר</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. עוגיות (Cookies)</h2>
          <p>
            האתר משתמש בעוגיות למטרות הבאות:
          </p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>
              <strong>עוגיות הכרחיות:</strong> לניהול התחברות ואימות משתמשים
              (Supabase Auth).
            </li>
            <li>
              <strong>אחסון מקומי (localStorage):</strong> לשמירת העדפות תצוגה
              כגון מצב בהיר/כהה.
            </li>
          </ul>
          <p className="mt-2">
            ניתן לנהל או לחסום עוגיות דרך הגדרות הדפדפן שלך. חסימת עוגיות
            עלולה לפגוע ביכולת להשתמש בשירותים מסוימים באתר.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. אחסון ואבטחת מידע</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>
              המידע מאוחסן בשרתי Supabase המאובטחים בתקני אבטחה מתקדמים.
            </li>
            <li>
              הסיסמאות מוצפנות ואינן נגישות לצוות האתר.
            </li>
            <li>
              הגישה למסד הנתונים מוגבלת באמצעות מדיניות Row Level Security (RLS).
            </li>
            <li>
              אנו נוקטים באמצעי אבטחה סבירים, אך לא ניתן להבטיח אבטחה
              מוחלטת של מידע המועבר באינטרנט.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. שיתוף מידע עם צדדים שלישיים</h2>
          <p>
            איננו מוכרים, סוחרים או מעבירים את המידע האישי שלך לצדדים
            שלישיים, למעט במקרים הבאים:
          </p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>כנדרש על פי חוק או צו בית משפט</li>
            <li>לספקי שירות הנדרשים להפעלת האתר (כגון Supabase לאחסון נתונים)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. זכויות המשתמש</h2>
          <p>בהתאם לחוק, עומדות לך הזכויות הבאות:</p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>לעיין במידע האישי שנאסף עליך</li>
            <li>לבקש תיקון או מחיקה של המידע האישי שלך</li>
            <li>למחוק את חשבונך בכל עת</li>
          </ul>
          <p className="mt-2">
            לצורך מימוש זכויות אלה, ניתן לפנות אלינו בכתובת: contact@accordim.co.il
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. שינויים במדיניות הפרטיות</h2>
          <p>
            אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים
            יפורסמו באתר. המשך השימוש באתר לאחר פרסום השינויים מהווה
            הסכמה למדיניות המעודכנת.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. יצירת קשר</h2>
          <p>
            לשאלות או בקשות בנוגע למדיניות הפרטיות, ניתן לפנות אלינו
            בכתובת: contact@accordim.co.il
          </p>
        </section>
      </div>
    </div>
  )
}
