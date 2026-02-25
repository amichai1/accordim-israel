import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const url = 'https://www.tab4u.com/tabs/songs/3815_%D7%90%D7%91%D7%99%D7%AA%D7%A8_%D7%91%D7%A0%D7%90%D7%99_-_%D7%A2%D7%93_%D7%9E%D7%97%D7%A8.html';
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

// Wait a bit for JS rendering
await page.waitForTimeout(3000);

// Check h1
const h1 = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  return h1 ? h1.textContent.trim() : 'NO H1 FOUND';
});
console.log('H1:', h1);

// Check for songContentTPL
const hasSongContent = await page.evaluate(() => {
  return document.getElementById('songContentTPL') !== null;
});
console.log('Has #songContentTPL:', hasSongContent);

// Check what IDs and classes exist related to song/chord/content
const containers = await page.evaluate(() => {
  const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
  const classes = [...document.querySelectorAll('[class]')]
    .map(el => [...el.classList].join('.'))
    .filter(c => c.includes('song') || c.includes('chord') || c.includes('lyric') || c.includes('content') || c.includes('tab'))
    .filter((v, i, a) => a.indexOf(v) === i);
  return {
    relevantIds: ids.filter(id => id.toLowerCase().match(/song|chord|content|tab|lyric|main/)),
    relevantClasses: classes,
  };
});
console.log('Relevant IDs:', JSON.stringify(containers.relevantIds));
console.log('Relevant classes:', JSON.stringify(containers.relevantClasses));

// Try to find the actual song content container
const content = await page.evaluate(() => {
  const selectors = [
    '#songContentTPL', '#song_content', '.song-content', '.songContent',
    '#main_content', '.main-content', '#tableContent', '.tableContent',
    '#songWords', '.songWords', '#chordsArea', '.chordsArea',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return { selector: sel, text: el.textContent.slice(0, 500), html: el.innerHTML.slice(0, 1500) };
  }

  // Check for any div/td with chord-like content
  const allDivs = [...document.querySelectorAll('div, td')];
  for (const d of allDivs) {
    const text = d.textContent;
    if (text && text.match(/[A-G][#b]?m?/) && text.length > 100 && text.length < 10000) {
      return {
        selector: d.tagName + (d.id ? '#' + d.id : '') + (d.className ? '.' + d.className.split(' ')[0] : ''),
        text: text.slice(0, 500),
        html: d.innerHTML.slice(0, 1500),
      };
    }
  }

  return { selector: 'NOT FOUND', text: document.body.textContent.slice(0, 1000), html: '' };
});

console.log('\nContent container:', content.selector);
console.log('Text preview:', content.text);
console.log('HTML preview:', content.html);

await browser.close();
