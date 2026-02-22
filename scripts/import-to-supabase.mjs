#!/usr/bin/env node

/**
 * Import scraped songs into Supabase
 *
 * Reads JSON files from data/scraped/ and imports them into Supabase.
 *
 * Usage:
 *   node scripts/import-to-supabase.mjs
 *   node scripts/import-to-supabase.mjs --dry-run    # Preview without inserting
 *
 * Environment variables (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 * Note: Uses the SERVICE_ROLE_KEY (not anon key) to bypass RLS policies.
 */

import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'scraped');

// ============================================================
// Load environment variables from .env.local
// ============================================================

function loadEnv() {
  const envFile = join(__dirname, '..', '.env.local');
  if (!existsSync(envFile)) {
    console.error('Missing .env.local file. Create it with:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }

  const content = readFileSync(envFile, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// ============================================================
// Slug generation
// ============================================================

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

function makeUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

// ============================================================
// Main import logic
// ============================================================

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Read all scraped JSON files
  if (!existsSync(DATA_DIR)) {
    console.error(`No data directory found at ${DATA_DIR}`);
    console.error('Run the scraper first: node scripts/scrape-tab4u.mjs');
    process.exit(1);
  }

  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  console.log(`Found ${files.length} scraped songs`);

  if (files.length === 0) {
    console.log('Nothing to import.');
    return;
  }

  // Load existing artists to avoid duplicates
  const { data: existingArtists } = await supabase.from('artists').select('id, name, slug');
  const artistMap = new Map();
  const existingSlugs = new Set();

  if (existingArtists) {
    for (const a of existingArtists) {
      artistMap.set(a.name.toLowerCase(), a);
      existingSlugs.add(a.slug);
    }
  }

  // Load existing song slugs
  const { data: existingSongs } = await supabase.from('songs').select('slug');
  const songSlugs = new Set();
  if (existingSongs) {
    existingSongs.forEach(s => songSlugs.add(s.slug));
  }

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = join(DATA_DIR, file);
      const song = JSON.parse(readFileSync(filePath, 'utf-8'));

      if (!song.title || !song.artist || !song.content) {
        console.log(`  ⊘ Skipping ${file} (missing data)`);
        skippedCount++;
        continue;
      }

      // Find or create artist
      let artist = artistMap.get(song.artist.toLowerCase());

      if (!artist) {
        const artistSlug = makeUniqueSlug(slugify(song.artist) || `artist-${Date.now()}`, existingSlugs);

        if (dryRun) {
          console.log(`  [DRY RUN] Would create artist: ${song.artist} (${artistSlug})`);
          artist = { id: 'dry-run-id', name: song.artist, slug: artistSlug };
        } else {
          const { data, error } = await supabase
            .from('artists')
            .insert({ name: song.artist, slug: artistSlug })
            .select()
            .single();

          if (error) {
            console.error(`  ✗ Failed to create artist "${song.artist}": ${error.message}`);
            errorCount++;
            continue;
          }
          artist = data;
        }
        artistMap.set(song.artist.toLowerCase(), artist);
      }

      // Create song
      const songSlug = makeUniqueSlug(
        slugify(`${song.artist}-${song.title}`) || `song-${Date.now()}`,
        songSlugs
      );

      if (dryRun) {
        console.log(`  [DRY RUN] Would import: ${song.artist} - ${song.title} (${songSlug})`);
      } else {
        const { error } = await supabase.from('songs').insert({
          title: song.title,
          slug: songSlug,
          artist_id: artist.id,
          content: song.content,
          original_key: song.originalKey || null,
          language: song.language || 'he',
          genre: null,
        });

        if (error) {
          console.error(`  ✗ Failed to import "${song.title}": ${error.message}`);
          errorCount++;
          continue;
        }

        console.log(`  ✓ ${song.artist} - ${song.title}`);
      }

      importedCount++;
    } catch (err) {
      console.error(`  ✗ Error processing ${file}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Import ${dryRun ? '(DRY RUN) ' : ''}complete!`);
  console.log(`  Imported: ${importedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
