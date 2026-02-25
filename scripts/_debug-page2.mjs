import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const url = 'https://www.tab4u.com/tabs/songs/3815_%D7%90%D7%91%D7%99%D7%AA%D7%A8_%D7%91%D7%A0%D7%90%D7%99_-_%D7%A2%D7%93_%D7%9E%D7%97%D7%A8.html';
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3000);

// Parse h1 for title and artist
const meta = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  if (!h1) return null;
  const text = h1.textContent.trim();
  // Format: "אקורדים לשיר [title] של [artist]"
  const match = text.match(/אקורדים לשיר (.+?) של (.+)/);
  if (match) return { title: match[1], artist: match[2] };
  // Fallback: "artist - title" pattern
  const parts = text.split(' - ');
  return { artist: parts[0]?.trim(), title: parts[1]?.trim() };
});
console.log('Meta:', JSON.stringify(meta));

// Extract structured content from the song
const lines = await page.evaluate(() => {
  const container = document.getElementById('songContentTPL');
  if (!container) return [];

  const result = [];
  const tables = container.querySelectorAll('table');

  for (const table of tables) {
    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
      const td = row.querySelector('td');
      if (!td) continue;

      const classList = [...td.classList];

      // Chord line
      if (classList.some(c => c === 'chords' || c === 'firstChords')) {
        const chordSpans = td.querySelectorAll('.c_C');
        if (chordSpans.length > 0) {
          const chords = [...chordSpans].map(s => ({
            name: s.textContent.trim(),
            // Get position from surrounding &nbsp; spacing
          }));
          result.push({ type: 'chords', text: td.textContent.trim().replace(/\u00A0/g, ' '), chords: chords.map(c => c.name) });
        }
        continue;
      }

      // Song/lyrics line
      if (classList.includes('song')) {
        const text = td.textContent.trim();
        if (text && !text.includes('נגן טאב') && !text.includes('ללימוד')) {
          result.push({ type: 'lyrics', text });
        }
        continue;
      }

      // Tab line (guitar tab - skip)
      if (classList.includes('tabs')) {
        continue;
      }
    }
  }

  return result;
});

console.log('\nExtracted lines:');
for (const line of lines.slice(0, 30)) {
  if (line.type === 'chords') {
    console.log(`  CHORDS: [${line.chords.join('] [')}]  (raw: "${line.text}")`);
  } else {
    console.log(`  LYRICS: "${line.text}"`);
  }
}
console.log(`\nTotal lines: ${lines.length}`);

// Also check how the key is displayed
const keyInfo = await page.evaluate(() => {
  const songInfo = document.getElementById('otherSongInfoArea') || document.getElementById('topSongInfoTable');
  if (songInfo) return songInfo.textContent.trim().slice(0, 200);
  return 'no key area found';
});
console.log('\nKey/info area:', keyInfo);

await browser.close();
