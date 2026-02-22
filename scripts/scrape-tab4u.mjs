#!/usr/bin/env node

/**
 * Tab4U Scraper - Personal Use
 *
 * Scrapes songs from tab4u.com and converts them to ChordPro format.
 * Saves results as JSON files for import into Supabase.
 *
 * Usage:
 *   node scripts/scrape-tab4u.mjs                    # Scrape top 100 songs
 *   node scripts/scrape-tab4u.mjs --artist "שלמה ארצי"  # Scrape specific artist
 *   node scripts/scrape-tab4u.mjs --max 50            # Limit number of songs
 *   node scripts/scrape-tab4u.mjs --url "https://www.tab4u.com/tabs/songs/3815_..." # Single song
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'data', 'scraped');
const PROGRESS_FILE = join(OUTPUT_DIR, '_progress.json');

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  baseUrl: 'https://www.tab4u.com',
  delayBetweenPages: 2000 + Math.random() * 3000, // 2-5 seconds
  maxRetries: 3,
  timeout: 30000,
};

// ============================================================
// CLI Arguments
// ============================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    mode: 'top100',   // 'top100' | 'artist' | 'url' | 'all'
    artist: null,
    url: null,
    max: 500,
    resume: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--artist':
        opts.mode = 'artist';
        opts.artist = args[++i];
        break;
      case '--url':
        opts.mode = 'url';
        opts.url = args[++i];
        break;
      case '--max':
        opts.max = parseInt(args[++i], 10);
        break;
      case '--all':
        opts.mode = 'all';
        break;
      case '--resume':
        opts.resume = true;
        break;
      case '--help':
        console.log(`
Tab4U Scraper

Usage:
  node scripts/scrape-tab4u.mjs                          # Top 100 songs
  node scripts/scrape-tab4u.mjs --artist "שלמה ארצי"       # All songs by artist
  node scripts/scrape-tab4u.mjs --url <song-url>          # Single song
  node scripts/scrape-tab4u.mjs --all --max 200           # Browse all, limit 200
  node scripts/scrape-tab4u.mjs --resume                  # Resume from last run

Options:
  --artist <name>   Scrape all songs by artist
  --url <url>       Scrape a single song URL
  --all             Scrape from full artist listing
  --max <n>         Maximum songs to scrape (default: 500)
  --resume          Resume from where last run stopped
  --help            Show this help
`);
        process.exit(0);
    }
  }
  return opts;
}

// ============================================================
// Progress tracking (for resume)
// ============================================================

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { scraped: [], failed: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

// ============================================================
// Song page scraper
// ============================================================

async function scrapeSongPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout });

  // Wait for song content to load
  await page.waitForSelector('#songContentTPL', { timeout: CONFIG.timeout }).catch(() => null);

  const songData = await page.evaluate(() => {
    // Extract title and artist from h1
    const h1 = document.querySelector('h1');
    if (!h1) return null;

    const h1Text = h1.textContent.trim();
    const parts = h1Text.split(' - ');
    const artist = parts[0]?.trim() || '';
    const songTitle = (parts[1] || '').split('(')[0].trim();

    if (!songTitle) return null;

    // Extract original key if shown on page
    let originalKey = null;
    const keyEl = document.querySelector('.song_key, .originalKey, [class*="key"]');
    if (keyEl) {
      const keyMatch = keyEl.textContent.match(/([A-G][#b]?m?)/);
      if (keyMatch) originalKey = keyMatch[1];
    }

    // Extract song content - chords and lyrics
    const container = document.getElementById('songContentTPL');
    if (!container) return null;

    const lines = [];
    const children = container.childNodes;

    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) lines.push({ type: 'text', content: text });
        continue;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child;

      // Check if this is a chord line
      if (el.classList.contains('chords')) {
        const chords = [];
        // Method 1: chord_info + span pattern
        const chordSpans = el.querySelectorAll('.chord_info + span');
        if (chordSpans.length > 0) {
          chordSpans.forEach(span => {
            const chord = span.textContent.trim();
            // Get the position of this chord relative to the container
            const rect = span.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            chords.push({
              chord,
              offsetLeft: rect.left - containerRect.left,
            });
          });
        } else {
          // Method 2: Extract chords from text content
          const text = el.textContent.trim();
          const parts = text.replace(/\u00A0/g, ' ').split(/\s+/).filter(Boolean);
          // Reconstruct positions from the text
          let pos = 0;
          const fullText = el.textContent.replace(/\u00A0/g, ' ');
          parts.forEach(part => {
            const idx = fullText.indexOf(part, pos);
            chords.push({ chord: part, charPos: idx });
            pos = idx + part.length;
          });
        }
        lines.push({ type: 'chords', chords });
        continue;
      }

      // Check for section headers like [Verse], [Chorus]
      const text = el.textContent.trim();
      if (text.match(/^\[.*\]$/) || text.match(/^(פזמון|בית|סולו|גשר|הקדמה|סיום|Bridge|Chorus|Verse|Solo|Intro|Outro)/i)) {
        lines.push({ type: 'section', content: text });
        continue;
      }

      // Regular text/lyrics line
      if (text && text !== 'לחץ לתצוגה נוספת') {
        lines.push({ type: 'text', content: text });
      }
    }

    return { artist, title: songTitle, originalKey, lines };
  });

  return songData;
}

// ============================================================
// Convert scraped data to ChordPro format
// ============================================================

function toChordPro(songData) {
  if (!songData) return null;

  const lines = [];
  lines.push(`{title: ${songData.title}}`);
  lines.push(`{artist: ${songData.artist}}`);
  if (songData.originalKey) {
    lines.push(`{key: ${songData.originalKey}}`);
  }
  lines.push('');

  const songLines = songData.lines;

  for (let i = 0; i < songLines.length; i++) {
    const line = songLines[i];

    if (line.type === 'section') {
      const sectionText = line.content.replace(/[\[\]]/g, '').trim();
      const lower = sectionText.toLowerCase();

      // Close previous section if needed
      if (i > 0) lines.push('');

      if (lower.includes('פזמון') || lower.includes('chorus')) {
        lines.push(`{soc: ${sectionText}}`);
      } else if (lower.includes('בית') || lower.includes('verse')) {
        lines.push(`{sov: ${sectionText}}`);
      } else {
        lines.push(`{comment: ${sectionText}}`);
      }
      continue;
    }

    if (line.type === 'chords') {
      // Check if the next line is lyrics
      const nextLine = songLines[i + 1];

      if (nextLine && nextLine.type === 'text') {
        // Merge chords into lyrics
        const merged = mergeChordsWithLyrics(line.chords, nextLine.content);
        lines.push(merged);
        i++; // Skip the lyrics line since we merged it
      } else {
        // Chord-only line (intro, interlude, etc.)
        const chordStr = line.chords.map(c => `[${c.chord}]`).join(' ');
        lines.push(chordStr);
      }
      continue;
    }

    if (line.type === 'text') {
      lines.push(line.content);
    }
  }

  // Clean up: close any open sections at the end
  return lines.join('\n');
}

function mergeChordsWithLyrics(chords, lyrics) {
  if (!chords.length) return lyrics;
  if (!lyrics) return chords.map(c => `[${c.chord}]`).join(' ');

  // Sort chords by position (charPos or offsetLeft)
  const sorted = [...chords].sort((a, b) => {
    const posA = a.charPos ?? a.offsetLeft ?? 0;
    const posB = b.charPos ?? b.offsetLeft ?? 0;
    return posA - posB;
  });

  // If we have pixel offsets, we need to estimate character positions
  // Average character width is roughly 8-10px for the typical font
  const usePixelPos = sorted[0]?.offsetLeft !== undefined && sorted[0]?.charPos === undefined;

  if (usePixelPos) {
    // Estimate: average Hebrew char is ~8px wide, but this varies
    // We'll normalize positions relative to the lyrics length
    const maxOffset = Math.max(...sorted.map(c => c.offsetLeft || 0), 1);
    const lyricsLen = lyrics.length;

    // Build result by inserting chords at estimated positions
    let result = '';
    let lastInsertPos = 0;

    for (const chord of sorted) {
      // Estimate character position from pixel offset
      let charPos = Math.round((chord.offsetLeft / maxOffset) * lyricsLen * 0.9);
      charPos = Math.max(charPos, lastInsertPos);
      charPos = Math.min(charPos, lyricsLen);

      // Try to insert at a word boundary
      if (charPos > 0 && charPos < lyricsLen) {
        const nearSpace = lyrics.lastIndexOf(' ', charPos + 2);
        if (nearSpace > lastInsertPos && Math.abs(nearSpace - charPos) <= 3) {
          charPos = nearSpace;
        }
      }

      result += lyrics.slice(lastInsertPos, charPos);
      result += `[${chord.chord}]`;
      lastInsertPos = charPos;
    }
    result += lyrics.slice(lastInsertPos);
    return result;
  }

  // Character position based (from text extraction)
  let result = '';
  let lastPos = 0;

  for (const chord of sorted) {
    const pos = chord.charPos ?? 0;
    // Scale chord position to lyrics length (chord line may be wider/narrower)
    const scaledPos = Math.min(pos, lyrics.length);
    const insertAt = Math.max(scaledPos, lastPos);

    result += lyrics.slice(lastPos, insertAt);
    result += `[${chord.chord}]`;
    lastPos = insertAt;
  }
  result += lyrics.slice(lastPos);
  return result;
}

// ============================================================
// Song discovery - find song URLs
// ============================================================

async function discoverTop100(page) {
  console.log('Discovering top 100 songs...');
  await page.goto(`${CONFIG.baseUrl}/views100`, {
    waitUntil: 'domcontentloaded',
    timeout: CONFIG.timeout,
  });

  const urls = await page.evaluate((baseUrl) => {
    const links = document.querySelectorAll('a[href*="/tabs/songs/"]');
    return [...links].map(a => {
      const href = a.getAttribute('href');
      return href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
    }).filter((url, i, arr) => arr.indexOf(url) === i); // unique
  }, CONFIG.baseUrl);

  console.log(`Found ${urls.length} songs in top 100`);
  return urls;
}

async function discoverArtistSongs(page, artistName) {
  console.log(`Searching for artist: ${artistName}...`);

  // Go to main tabs page and search
  await page.goto(`${CONFIG.baseUrl}/tabs/`, {
    waitUntil: 'domcontentloaded',
    timeout: CONFIG.timeout,
  });

  // Try to find artist in the listing or use search
  // First, try the search functionality
  const searchInput = await page.$('input[type="search"], input[name="q"], #search, .search-input');
  if (searchInput) {
    await searchInput.fill(artistName);
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
  }

  // Look for artist links
  const artistUrl = await page.evaluate((name, baseUrl) => {
    const links = document.querySelectorAll('a[href*="/tabs/artists/"]');
    for (const link of links) {
      if (link.textContent.includes(name)) {
        const href = link.getAttribute('href');
        return href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
      }
    }
    return null;
  }, artistName, CONFIG.baseUrl);

  if (!artistUrl) {
    console.log(`Artist "${artistName}" not found. Try browsing tab4u.com manually and use --url for specific songs.`);
    return [];
  }

  console.log(`Found artist page: ${artistUrl}`);
  await page.goto(artistUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout });

  const urls = await page.evaluate((baseUrl) => {
    const links = document.querySelectorAll('a[href*="/tabs/songs/"]');
    return [...links].map(a => {
      const href = a.getAttribute('href');
      return href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
    }).filter((url, i, arr) => arr.indexOf(url) === i);
  }, CONFIG.baseUrl);

  console.log(`Found ${urls.length} songs for ${artistName}`);
  return urls;
}

async function discoverAllSongs(page, maxPages = 20) {
  console.log('Discovering songs from artist listings...');
  const allSongUrls = new Set();

  // First get artist list
  await page.goto(`${CONFIG.baseUrl}/tabs/`, {
    waitUntil: 'domcontentloaded',
    timeout: CONFIG.timeout,
  });

  const artistUrls = await page.evaluate((baseUrl) => {
    const links = document.querySelectorAll('a[href*="/tabs/artists/"]');
    return [...links].map(a => {
      const href = a.getAttribute('href');
      return href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
    }).filter((url, i, arr) => arr.indexOf(url) === i);
  }, CONFIG.baseUrl);

  console.log(`Found ${artistUrls.length} artists`);

  // Visit each artist page to collect song URLs
  for (let i = 0; i < Math.min(artistUrls.length, maxPages); i++) {
    try {
      console.log(`  Visiting artist ${i + 1}/${Math.min(artistUrls.length, maxPages)}...`);
      await page.goto(artistUrls[i], { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout });

      const songUrls = await page.evaluate((baseUrl) => {
        const links = document.querySelectorAll('a[href*="/tabs/songs/"]');
        return [...links].map(a => {
          const href = a.getAttribute('href');
          return href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
        });
      }, CONFIG.baseUrl);

      songUrls.forEach(url => allSongUrls.add(url));
      await delay(CONFIG.delayBetweenPages);
    } catch (err) {
      console.log(`  Failed to load artist page: ${err.message}`);
    }
  }

  console.log(`Discovered ${allSongUrls.size} total songs`);
  return [...allSongUrls];
}

// ============================================================
// Utility functions
// ============================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 1000));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function saveSong(songData, chordPro, url) {
  const filename = slugify(`${songData.artist}-${songData.title}`) || `song-${Date.now()}`;
  const filePath = join(OUTPUT_DIR, `${filename}.json`);

  const output = {
    title: songData.title,
    artist: songData.artist,
    originalKey: songData.originalKey,
    content: chordPro,
    sourceUrl: url,
    language: /[\u0590-\u05FF]/.test(songData.title) ? 'he' : 'en',
    scrapedAt: new Date().toISOString(),
  };

  writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  return filePath;
}

// ============================================================
// Main
// ============================================================

async function main() {
  const opts = parseArgs();

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Starting Tab4U scraper...');
  console.log(`Mode: ${opts.mode}, Max songs: ${opts.max}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'he-IL',
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Load progress for resume
  const progress = opts.resume ? loadProgress() : { scraped: [], failed: [] };
  const alreadyScraped = new Set(progress.scraped);

  try {
    let songUrls = [];

    // Discover song URLs based on mode
    switch (opts.mode) {
      case 'top100':
        songUrls = await discoverTop100(page);
        break;
      case 'artist':
        songUrls = await discoverArtistSongs(page, opts.artist);
        break;
      case 'url':
        songUrls = [opts.url];
        break;
      case 'all':
        songUrls = await discoverAllSongs(page);
        break;
    }

    // Filter already scraped
    songUrls = songUrls.filter(url => !alreadyScraped.has(url));
    songUrls = songUrls.slice(0, opts.max);

    console.log(`\nScraping ${songUrls.length} songs...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < songUrls.length; i++) {
      const url = songUrls[i];
      console.log(`[${i + 1}/${songUrls.length}] ${url}`);

      let retries = 0;
      let success = false;

      while (retries < CONFIG.maxRetries && !success) {
        try {
          const songData = await scrapeSongPage(page, url);

          if (songData && songData.title) {
            const chordPro = toChordPro(songData);
            const filePath = saveSong(songData, chordPro, url);
            console.log(`  ✓ ${songData.artist} - ${songData.title} → ${filePath}`);

            progress.scraped.push(url);
            successCount++;
            success = true;
          } else {
            console.log('  ✗ No song data found on page');
            retries++;
          }
        } catch (err) {
          console.log(`  ✗ Error: ${err.message}`);
          retries++;
          if (retries < CONFIG.maxRetries) {
            console.log(`  Retrying (${retries}/${CONFIG.maxRetries})...`);
            await delay(5000);
          }
        }
      }

      if (!success) {
        progress.failed.push(url);
        failCount++;
      }

      // Save progress periodically
      if ((i + 1) % 10 === 0) {
        saveProgress(progress);
      }

      // Delay between requests
      if (i < songUrls.length - 1) {
        await delay(CONFIG.delayBetweenPages);
      }
    }

    // Final progress save
    saveProgress(progress);

    console.log(`\n========================================`);
    console.log(`Scraping complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log(`  Output: ${OUTPUT_DIR}`);
    console.log(`========================================`);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
