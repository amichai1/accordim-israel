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
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'data', 'scraped');
const PROGRESS_FILE = join(OUTPUT_DIR, '_progress.json');

// ============================================================
// Supabase client (loaded lazily)
// ============================================================

let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const envFile = join(__dirname, '..', '.env.local');
  if (!existsSync(envFile)) {
    console.error('Missing .env.local — cannot upload to Supabase');
    return null;
  }
  const content = readFileSync(envFile, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env.local');
    return null;
  }
  _supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  return _supabase;
}

// Artist cache for uploads (persists across batches)
const artistCache = new Map();

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').trim();
}

async function uploadAndCleanup() {
  const supabase = getSupabase();
  if (!supabase) { console.log('  Skipping upload (no Supabase config)'); return; }

  const files = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  if (!files.length) { console.log('  No files to upload'); return; }

  // Load existing song slugs to avoid duplicates
  const { data: existingSongs } = await supabase.from('songs').select('slug');
  const songSlugs = new Set(existingSongs?.map(s => s.slug) || []);

  // Load existing artists into cache if empty
  if (artistCache.size === 0) {
    const { data: existingArtists } = await supabase.from('artists').select('id, name, slug');
    if (existingArtists) {
      for (const a of existingArtists) artistCache.set(a.name.toLowerCase(), a);
    }
  }

  let uploaded = 0, skipped = 0, errors = 0;

  for (const file of files) {
    try {
      const song = JSON.parse(readFileSync(join(OUTPUT_DIR, file), 'utf-8'));
      if (!song.title || !song.artist || !song.content) { skipped++; continue; }

      // Find or create artist
      let artist = artistCache.get(song.artist.toLowerCase());
      if (!artist) {
        const artistSlug = slugify(song.artist) || `artist-${Date.now()}`;
        const { data, error } = await supabase
          .from('artists').insert({ name: song.artist, slug: artistSlug })
          .select().single();
        if (error) {
          // Might be duplicate slug — try fetch
          const { data: found } = await supabase
            .from('artists').select('id, name, slug').eq('name', song.artist).single();
          if (found) artist = found;
          else { errors++; continue; }
        } else {
          artist = data;
        }
        artistCache.set(song.artist.toLowerCase(), artist);
      }

      // Create song
      const songSlug = slugify(`${song.artist}-${song.title}`) || `song-${Date.now()}`;
      if (songSlugs.has(songSlug)) { skipped++; continue; }

      const { error } = await supabase.from('songs').insert({
        title: song.title, slug: songSlug, artist_id: artist.id,
        content: song.content, original_key: song.originalKey || null,
        language: song.language || 'he',
      });

      if (error) { errors++; continue; }
      songSlugs.add(songSlug);
      uploaded++;

      // Delete the file after successful upload
      unlinkSync(join(OUTPUT_DIR, file));
    } catch (err) {
      errors++;
    }
  }

  console.log(`  Upload: ${uploaded} ok, ${skipped} skipped, ${errors} errors`);
}

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  baseUrl: 'https://www.tab4u.com',
  delayBetweenPages: () => 3000 + Math.random() * 4000, // 3-7 seconds (avg ~5s)
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
    max: Infinity,
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
    // Format: "אקורדים לשיר [title] של [artist]"
    const h1 = document.querySelector('h1');
    if (!h1) return null;

    const h1Text = h1.textContent.trim();
    let artist = '', songTitle = '';

    // Use lastIndexOf to split at the LAST "של" — handles songs like "כוחה של אהבה של פאר טסי"
    const prefix = 'אקורדים לשיר ';
    const separator = ' של ';
    if (h1Text.startsWith(prefix)) {
      const rest = h1Text.slice(prefix.length);
      const lastShelIdx = rest.lastIndexOf(separator);
      if (lastShelIdx !== -1) {
        songTitle = rest.slice(0, lastShelIdx).trim();
        artist = rest.slice(lastShelIdx + separator.length).trim();
      }
    }
    if (!songTitle) {
      // Fallback: "artist - title"
      const parts = h1Text.split(' - ');
      artist = parts[0]?.trim() || '';
      songTitle = (parts[1] || '').split('(')[0].trim();
    }

    if (!songTitle) return null;

    // Extract original key - look for first chord on page as fallback
    let originalKey = null;
    const firstChord = document.querySelector('#songContentTPL .c_C');
    if (firstChord) {
      originalKey = firstChord.textContent.trim();
    }

    // Extract song content from table-based layout
    const container = document.getElementById('songContentTPL');
    if (!container) return null;

    const lines = [];
    const tables = container.querySelectorAll(':scope > table, :scope > br + table');

    // Process all table rows inside songContentTPL
    const allRows = container.querySelectorAll('table tr');

    for (const row of allRows) {
      const td = row.querySelector('td');
      if (!td) continue;

      const classList = [...td.classList];

      // Skip tab lines (guitar tablature)
      if (classList.includes('tabs')) continue;

      // Chord line
      if (classList.includes('chords') || classList.includes('firstChords')) {
        const chordSpans = td.querySelectorAll('.c_C');
        if (chordSpans.length > 0) {
          // Get raw text of chord line (with &nbsp; → space) for character positions
          const rawText = td.textContent.replace(/\u00A0/g, ' ');
          const leadingSpaces = rawText.length - rawText.trimStart().length;
          const trimmed = rawText.trim();
          let searchFrom = 0;
          const chords = [...chordSpans].map(span => {
            const name = span.textContent.trim();
            const pos = rawText.indexOf(name, searchFrom);
            const charPos = (pos >= 0 ? pos : searchFrom) - leadingSpaces;
            searchFrom = (pos >= 0 ? pos : searchFrom) + name.length;
            return { chord: name, charPos: Math.max(0, charPos) };
          });
          lines.push({ type: 'chords', chords, rawLen: trimmed.length });
        }
        continue;
      }

      // Song/lyrics line
      if (classList.includes('song')) {
        const text = td.textContent.trim();
        // Skip UI elements (play tab, learn tab links)
        if (!text || text.includes('נגן טאב') || text.includes('ללימוד')) continue;

        // Check if it's a section header
        if (text.match(/^(פזמון|בית \d|סולו|גשר|הקדמה|סיום|פתיחה|מעבר|אאוטרו|Bridge|Chorus|Verse|Solo|Intro|Outro|Transition|Interlude)/i)) {
          lines.push({ type: 'section', content: text });
        } else {
          lines.push({ type: 'lyrics', content: text });
        }
        continue;
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

      if (i > 0) lines.push('');

      if (lower.includes('פזמון') || lower.includes('chorus')) {
        lines.push(`{soc: ${sectionText}}`);
      } else if (lower.match(/בית|verse/)) {
        lines.push(`{sov: ${sectionText}}`);
      } else {
        lines.push(`{comment: ${sectionText}}`);
      }
      continue;
    }

    if (line.type === 'chords') {
      const nextLine = songLines[i + 1];

      if (nextLine && nextLine.type === 'lyrics') {
        const lyricsText = nextLine.content.trim();
        // If lyrics line is a section label (short text with many chords), don't merge
        const isSectionLabel = lyricsText.match(/^(פזמון|בית \d|סולו|גשר|הקדמה|סיום|פתיחה|מעבר|אאוטרו|Bridge|Chorus|Verse|Solo|Intro|Outro|Transition|Interlude)\s*:?\s*$/i);
        if (isSectionLabel) {
          lines.push(`{comment: ${lyricsText.replace(/:$/, '')}}`);
          const chordStr = line.chords.map(c => `[${c.chord}]`).join(' ');
          lines.push(chordStr);
          lines.push(''); // Blank line after transition chords
          i++; // Skip the lyrics line
        } else {
          const merged = mergeChordsWithLyrics(line.chords, nextLine.content, line.rawLen);
          lines.push(merged);
          i++; // Skip the lyrics line since we merged it
        }
      } else {
        // Chord-only line (intro, interlude, etc.)
        const chordStr = line.chords.map(c => `[${c.chord}]`).join(' ');
        lines.push(chordStr);
      }
      continue;
    }

    if (line.type === 'lyrics') {
      lines.push(line.content);
    }
  }

  return lines.join('\n');
}

function mergeChordsWithLyrics(chords, lyrics, chordLineLen) {
  if (!chords.length) return lyrics;

  // Clean double spaces
  const clean = lyrics.replace(/ {2,}/g, ' ').trim();
  if (!clean) return chords.map(c => `[${c.chord}]`).join(' ');

  // Safety: if way more chords than non-space characters, don't merge
  const nonSpaceLen = clean.replace(/\s/g, '').length;
  if (nonSpaceLen > 0 && chords.length > nonSpaceLen) {
    return chords.map(c => `[${c.chord}]`).join(' ') + '\n' + clean;
  }

  const sorted = [...chords].sort((a, b) => (a.charPos ?? 0) - (b.charPos ?? 0));

  // Total length of the chord line text (for proportional mapping)
  const totalChordLen = chordLineLen ||
    Math.max(...sorted.map(c => (c.charPos ?? 0) + c.chord.length), 1);

  let result = '';
  let lastPos = 0;

  for (const chord of sorted) {
    // Proportional mapping: chord text position → lyrics position
    let target = Math.round(((chord.charPos ?? 0) / totalChordLen) * clean.length);
    target = Math.max(target, lastPos);
    target = Math.min(target, clean.length);

    // Snap to nearest word boundary (space) within 3 chars
    if (target > 0 && target < clean.length) {
      for (let d = 0; d <= 3; d++) {
        const check = target - d;
        if (check > lastPos && check > 0 && clean[check - 1] === ' ') {
          target = check;
          break;
        }
      }
    }

    result += clean.slice(lastPos, target);
    result += `[${chord.chord}]`;
    lastPos = target;
  }

  result += clean.slice(lastPos);
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
    const links = document.querySelectorAll('a[href*="tabs/songs/"]');
    return [...links].map(a => {
      const href = a.getAttribute('href');
      return href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
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
    const links = document.querySelectorAll('a[href*="tabs/artists/"]');
    for (const link of links) {
      if (link.textContent.includes(name)) {
        const href = link.getAttribute('href');
        return href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
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
    const links = document.querySelectorAll('a[href*="tabs/songs/"]');
    return [...links].map(a => {
      const href = a.getAttribute('href');
      return href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
    }).filter((url, i, arr) => arr.indexOf(url) === i);
  }, CONFIG.baseUrl);

  console.log(`Found ${urls.length} songs for ${artistName}`);
  return urls;
}

async function discoverAllSongs(page) {
  console.log('Discovering all songs from sitemap...');
  const allSongUrls = new Set();

  // Use sitemap — much faster, no need to crawl artist pages
  for (let n = 1; n <= 7; n++) {
    const sitemapUrl = `${CONFIG.baseUrl}/sitemap.xml?x=songs&n=${n}`;
    console.log(`  Fetching sitemap page ${n}/7...`);
    try {
      await page.goto(sitemapUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout });
      const urls = await page.evaluate(() => {
        return [...document.querySelectorAll('loc')]
          .map(el => el.textContent)
          .filter(url => url.includes('tabs/songs') && !url.includes('?type='));
      });
      urls.forEach(url => allSongUrls.add(url));
      console.log(`    Found ${urls.length} songs (total: ${allSongUrls.size})`);
    } catch (err) {
      console.log(`    Failed to load sitemap page ${n}: ${err.message}`);
    }
    await delay(1000);
  }

  console.log(`Discovered ${allSongUrls.size} total songs from sitemap`);
  return [...allSongUrls];
}

// ============================================================
// Utility functions
// ============================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 1000));
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
  const progress = opts.resume ? loadProgress() : { scraped: [], failed: [], allUrls: [] };
  const alreadyScraped = new Set(progress.scraped);

  try {
    let songUrls = [];

    // On resume with saved URLs, skip discovery
    if (opts.resume && progress.allUrls && progress.allUrls.length > 0) {
      console.log(`Resuming with ${progress.allUrls.length} previously discovered URLs...`);
      songUrls = progress.allUrls;
    } else {
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
      // Save discovered URLs for resume
      progress.allUrls = songUrls;
      saveProgress(progress);
    }

    // Filter already scraped
    songUrls = songUrls.filter(url => !alreadyScraped.has(url));
    songUrls = songUrls.slice(0, opts.max);

    console.log(`\nScraping ${songUrls.length} songs...\n`);

    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < songUrls.length; i++) {
      const url = songUrls[i];
      const totalDone = alreadyScraped.size + successCount + failCount;
      const totalAll = songUrls.length + alreadyScraped.size;
      const pct = ((totalDone / totalAll) * 100).toFixed(1);
      console.log(`[${i + 1}/${songUrls.length}] (${pct}% overall) ${url}`);

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

      // Every 200 songs: status summary + 2 min break
      if ((i + 1) % 200 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        const rate = ((successCount + failCount) / (Date.now() - startTime) * 1000 * 3600).toFixed(0);
        const remaining = songUrls.length - i - 1;
        const etaHours = (remaining / rate).toFixed(1);
        console.log(`\n========== STATUS (${new Date().toLocaleTimeString('he-IL')}) ==========`);
        console.log(`  Progress: ${i + 1}/${songUrls.length} (${pct}%)`);
        console.log(`  Success: ${successCount} | Failed: ${failCount}`);
        console.log(`  Elapsed: ${elapsed} min | Rate: ~${rate}/hr`);
        console.log(`  Remaining: ${remaining} songs | ETA: ~${etaHours} hours`);
        console.log(`  Uploading to DB + 2 min break...`);
        console.log(`===========================================\n`);
        saveProgress(progress);
        // Upload and break run in parallel — break is always 2 min minimum
        await Promise.all([
          uploadAndCleanup(),
          delay(120000),
        ]);
      }

      // Delay between requests
      if (i < songUrls.length - 1) {
        await delay(CONFIG.delayBetweenPages());
      }
    }

    // Final progress save
    saveProgress(progress);

    // Final upload of remaining files
    console.log('\nUploading remaining songs to DB...');
    await uploadAndCleanup();

    console.log(`\n========================================`);
    console.log(`Scraping complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log(`========================================`);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
