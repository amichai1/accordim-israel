import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'הצהרת נגישות | אקורדים ישראל',
  description: 'הצהרת הנגישות של אתר אקורדים ישראל',
}

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">הצהרת נגישות</h1>
      <p className="text-sm text-[var(--muted)] mb-8">עדכון אחרון: פברואר 2026</p>

      <div className="space-y-6 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">מחויבות לנגישות</h2>
          <p>
            אתר &quot;אקורדים ישראל&quot; מחויב להנגשת תכניו לכלל הציבור,
            לרבות אנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים
            עם מוגבלויות, התשנ&quot;ח-1998 ותקנות הנגישות לשירותי
            אינטרנט (תקן SI 5568) ברמת AA של WCAG 2.0.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">התאמות הנגישות שבוצעו</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>
              <strong>התאמה לקוראי מסך:</strong> האתר בנוי עם תגיות HTML
              סמנטיות ותכונות ARIA המאפשרות ניווט באמצעות קוראי מסך.
            </li>
            <li>
              <strong>ניווט מקלדת:</strong> ניתן לנווט באתר באמצעות מקלדת
              בלבד, כולל קישור &quot;דלג לתוכן&quot; לניווט מהיר.
            </li>
            <li>
              <strong>התאמת גודל גופן:</strong> ניתן להגדיל ולהקטין את
              גודל הטקסט באמצעות כפתור הנגישות הצף באתר.
            </li>
            <li>
              <strong>ניגודיות גבוהה:</strong> האתר תומך במצב ניגודיות
              גבוהה הניתן להפעלה דרך כפתור הנגישות.
            </li>
            <li>
              <strong>מצב כהה ובהיר:</strong> האתר תומך במצב כהה ובהיר
              להתאמה אישית.
            </li>
            <li>
              <strong>תמיכה ב-RTL:</strong> האתר בנוי עם תמיכה מלאה
              בכיוון ימין-לשמאל לעברית.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">כפתור הנגישות</h2>
          <p>
            בפינה השמאלית התחתונה של האתר ממוקם כפתור נגישות (סמל נגישות ♿)
            המאפשר:
          </p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>הגדלת גודל הגופן</li>
            <li>הקטנת גודל הגופן</li>
            <li>הפעלת מצב ניגודיות גבוהה</li>
            <li>איפוס כל ההגדרות</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">טכנולוגיות</h2>
          <p>האתר נבנה עם הטכנולוגיות הבאות התומכות בנגישות:</p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>HTML5 סמנטי</li>
            <li>תכונות ARIA</li>
            <li>CSS עם תמיכה בהגדלת טקסט</li>
            <li>Next.js עם רינדור בצד השרת (SSR) לתאימות מלאה</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">דפדפנים נתמכים</h2>
          <p>
            האתר נבדק ותואם לדפדפנים הנפוצים בגרסאותיהם העדכניות:
            Chrome, Firefox, Safari ו-Edge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">פניות בנושא נגישות</h2>
          <p>
            אם נתקלת בבעיית נגישות באתר או שיש לך הצעות לשיפור,
            נשמח לשמוע ממך:
          </p>
          <ul className="list-none pr-0 space-y-1 mt-2">
            <li>דואר אלקטרוני: contact@accordim.co.il</li>
          </ul>
          <p className="mt-2">
            אנו מתחייבים לטפל בכל פנייה בנושא נגישות בהקדם האפשרי.
          </p>
        </section>
      </div>
    </div>
  )
}
