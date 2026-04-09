/**
 * enrich-grammar-from-selimjb.ts
 *
 * Enriches existing Grammar rows (imported from J-O-S-H-L) with rich data
 * from the SelimJB jlpt-grammar-cards GitHub repository.
 *
 * Source files:
 *   - https://raw.githubusercontent.com/SelimJB/jlpt-grammar-cards/main/n5_full_sample.txt
 *   - https://raw.githubusercontent.com/SelimJB/jlpt-grammar-cards/main/n4_full_sample.txt
 *
 * Match key: grammarPoint — matched via normalized form.
 * Strategy: always overwrite with CSV value when CSV field is non-empty.
 *
 * Usage:
 *   npm run enrich:grammar:selimjb
 */

import * as https from 'https';
import {MikroORM} from '@mikro-orm/core';
import config from '../mikro-orm.config';
import {Grammar} from '../entities/Grammar';

// ─── HTTP ─────────────────────────────────────────────────────────────────────

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

// ─── CSV parsing (RFC-4180, semicolon-delimited) ─────────────────────────────

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ';' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length < headers.length) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j].trim();
    }
    rows.push(row);
  }
  return rows;
}

// ─── Text cleaning ────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and HTML entities from text fields.
 * Returns undefined for empty/whitespace-only strings.
 */
function clean(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const s = text
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s === '' ? undefined : s;
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalizes a grammar point string for matching.
 *
 * Transforms J-O-S-H-L format to SelimJB format so keys can be compared.
 *
 * DB examples:                  CSV examples (after normalize):
 *   Verb［れる・られる］    →    verbれる・られる (passive)
 *   Adjective + て・Noun + で → adjective+て・noun+で
 *   Verb + て              →    verb+て
 *   ～易（やす）い          →    ～やすい
 *   てから                 →    てから
 *   Verb + て+ B           →    verb+て+b
 */
function normalize(gp: string): string {
  return gp
    // Strip HTML tags (some CSV entries have embedded </div> etc.)
    .replace(/<[^>]+>/g, '')
    // Full-width brackets to nothing: Verb［れる・られる］ → Verbれる・られる
    .replace(/[【\[\[｛｟]/g, '')
    .replace(/[】\]\]]｠}/g, '')
    // Furigana: kanji（reading） → reading  (handles kanji-only case)
    // e.g. 易（やす）い → やすい, 方（かた） → かた
    // Pattern: one or more non-Japanese chars, then furigana(reading), keep remaining text
    // Replace the kanji+furigana block with just the reading
    // e.g. "易（やす）い" → "やすい", "方（かた）" → "かた"
    .replace(/([一-龯ぁ-んァ-ン～]+)[（(]([^）)]+)[)）]([一-龯ぁ-んァ-ン]*)/g, (_, kanji, reading, trailing) => reading + trailing)
    // Fallback furigana strip (handles cases where above didn't match)
    .replace(/[（()][^\]）)]+[)）]/g, '')
    // Normalize tilde prefix/suffix: remove leading/trailing ～
    .replace(/^～+/, '')
    // Remove spaces around special chars: Verb + て → Verb+て
    .replace(/\s*([+＋・〜～])\s*/g, '$1')
    // Remove trailing variant markers: ～ている ① → ～ている
    .replace(/\s*[①②③④⑤]$/, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Builds an array of alternative normalized keys for a grammar point.
 * Tries multiple strategies to maximize cross-format matching.
 */
function buildMatchKeys(gp: string): string[] {
  const keys = new Set<string>();

  // Strategy 1: Standard normalization (no tilde prefix, extract furigana)
  keys.add(normalize(gp));

  // Strategy 2: With tilde prefix preserved
  const withTilde = gp
    .replace(/<[^>]+>/g, '')
    .replace(/[【\[\[｛｟]/g, '')
    .replace(/[】\]\]]｠}/g, '')
    .replace(/([一-龯ぁ-んァ-ン～]+)[（(]([^）)]+)[)）]([一-龯ぁ-んァ-ン]*)/g, (_, kanji, reading, trailing) => reading + trailing)
    .replace(/[（()][^\]）)]+[)）]/g, '')
    .replace(/\s*([+＋・〜～])\s*/g, '$1')
    .replace(/\s*[①②③④⑤]$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  keys.add(withTilde);

  // Strategy 3: Extract just the furigana readings as hiragana-only
  const raw = gp.replace(/<[^>]+>/g, '');
  const readingsMatch = (raw.match(/[（(]([^）)]+)[)）]/g) ?? []).map(m => m.slice(1, -1).trim()).join('');
  if (readingsMatch) {
    keys.add(readingsMatch.toLowerCase());
    // Furigana readings + any non-furigana hiragana/katakana that wasn't in brackets
    const nonFurigana = raw
      .replace(/[（()][^）)]+[)）]/g, '')
      .replace(/[一-龯]/g, '')
      .trim();
    keys.add((readingsMatch + nonFurigana).toLowerCase().replace(/\s+/g, ''));
  }

  // Strategy 4: Bare kanji (no furigana, no spaces, no brackets)
  const bareKanji = raw
    .replace(/[（()）()一-龯ぁ-んァ-ン～\s+]/g, '')
    .toLowerCase();
  if (bareKanji) keys.add(bareKanji);

  // Strategy 5: Strip full-width brackets and try again (e.g. Verb［た・ている］ → verbt・ている）
  const noFwk = raw
    .replace(/[【\[\[｛｟『]/g, '')
    .replace(/[】\]\]]｠｝』]/g, '')
    .replace(/([一-龯ぁ-んァ-ン～]+)[（(]([^）)]+)[)）]([一-龯ぁ-んァ-ン]*)/g, (_, k, r, t) => r + t)
    .replace(/[（()][^\]）)]+[)）]/g, '')
    .replace(/^～+/, '')
    .replace(/\s*([+＋・〜～])\s*/g, '$1')
    .replace(/\s*[①②③④⑤]$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (noFwk !== normalize(gp)) keys.add(noFwk);

  return Array.from(keys);
}

/**
 * Finds the best CSV match for a DB grammar point using fuzzy substring matching.
 * Used as a fallback when exact key lookup fails.
 * Requires a minimum length of 4 chars to avoid false-positive single-char matches
 * (e.g. DB "が" should not match CSV "が" from "がいる").
 */
function fuzzyFind(dbNorm: string, csvRows: Record<string, string>[]): Record<string, string> | undefined {
  if (dbNorm.length < 4) return undefined;

  const dbBare = dbNorm.replace(/[＋・\/～]/g, '').replace(/\s+/g, '');

  for (const csvRow of csvRows) {
    const csvNorm = normalize(csvRow['grammar_point'] ?? '');
    // Require both strings to be ≥ 4 chars to avoid single-char false matches
    if (csvNorm.length >= 4 && csvNorm.includes(dbNorm)) return csvRow;
  }

  // Also try CSV bare as substring of DB (handles: ほしい ⊂ がほしい)
  for (const csvRow of csvRows) {
    const csvBare = normalize(csvRow['grammar_point'] ?? '').replace(/[＋・\/～]/g, '').replace(/\s+/g, '');
    if (csvBare.length >= 4 && dbBare.includes(csvBare)) return csvRow;
  }

  return undefined;
}

// ─── Apply field from CSV to Grammar entity ─────────────────────────────────

function applyField<T extends Grammar>(
  row: T,
  field: keyof T,
  rawValue: string | undefined,
): boolean {
  const cleaned = clean(rawValue);
  if (cleaned !== undefined) {
    (row[field] as string | number | undefined) = cleaned;
    return true;
  }
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('Fetching CSV files from GitHub...');
  const [n5Data, n4Data] = await Promise.all([
    fetch(
      'https://raw.githubusercontent.com/SelimJB/jlpt-grammar-cards/main/n5_full_sample.txt',
    ),
    fetch(
      'https://raw.githubusercontent.com/SelimJB/jlpt-grammar-cards/main/n4_full_sample.txt',
    ),
  ]);

  const n5Rows = parseCsv(n5Data);
  const n4Rows = parseCsv(n4Data);

  // Build lookup map: multiple normalized keys → CSV row
  // Each CSV row is stored under multiple keys. The Map iteration in fuzzyFind
  // deduplicates by checking csvRow via Object identity — but we also need
  // the Map values to point to the correct full CSV row object.
  // We use a separate array to keep raw rows for fuzzyFind iteration.
  const csvRows = new Array<Record<string, string>>();
  const csvMap = new Map<string, Record<string, string>>();
  for (const row of [...n5Rows, ...n4Rows]) {
    const raw = (row['grammar_point'] ?? '').replace(/<[^>]+>/g, '').trim();
    if (!raw) continue;
    csvRows.push(row);
    for (const key of buildMatchKeys(raw)) {
      if (key) csvMap.set(key, row);
    }
  }

  console.log(`CSV loaded: N5=${n5Rows.length}, N4=${n4Rows.length}`);
  console.log(`CSV unique normalized keys: ${csvMap.size}`);

  // Load all existing N5/N4 grammar rows from DB
  const dbRows = await em.findAll(Grammar, {
    where: {level: {$in: ['N5', 'N4']}},
  });
  console.log(`DB rows loaded: ${dbRows.length}`);

  let matched = 0;
  let updated = 0;
  let unmatched = 0;
  let totalFieldsUpdated = 0;
  const unmatchedList: string[] = [];

  for (const row of dbRows) {
    // Try multiple normalization strategies for the DB grammar point
    const dbNorm = normalize(row.grammarPoint);
    const dbKeys = buildMatchKeys(row.grammarPoint);
    let csv: Record<string, string> | undefined;

    // Pass 1: exact key lookup
    for (const key of dbKeys) {
      const found = csvMap.get(key);
      if (found) {
        csv = found;
        break;
      }
    }

    // Pass 2: fuzzy substring fallback (for things like たほう ⊂ たほうがいい)
    if (!csv) {
      csv = fuzzyFind(dbNorm, csvRows);
    }

    if (!csv) {
      unmatched++;
      unmatchedList.push(`${row.grammarPoint} (${row.level})`);
      continue;
    }

    matched++;
    let fieldsUpdated = 0;

    if (applyField(row, 'meaning', csv['meaning'])) fieldsUpdated++;
    if (applyField(row, 'lessonTitle', csv['lesson_title'])) fieldsUpdated++;

    // lessonNumber: parse as integer
    const lnRaw = csv['lesson_number'];
    if (lnRaw !== undefined) {
      const ln = parseInt(lnRaw.trim(), 10);
      if (!isNaN(ln)) {
        row.lessonNumber = ln;
        fieldsUpdated++;
      }
    }

    if (applyField(row, 'structure', csv['structure'])) fieldsUpdated++;
    if (applyField(row, 'structureDisplay', csv['structure_display'])) fieldsUpdated++;
    if (applyField(row, 'partOfSpeech', csv['part_of_speech'])) fieldsUpdated++;
    if (applyField(row, 'register', csv['register'])) fieldsUpdated++;
    if (applyField(row, 'about', csv['about'])) fieldsUpdated++;
    if (applyField(row, 'exampleJp', csv['example_jp_1'])) fieldsUpdated++;
    if (applyField(row, 'exampleEn', csv['example_en_1'])) fieldsUpdated++;
    if (applyField(row, 'synonyms', csv['synonyms'])) fieldsUpdated++;
    if (applyField(row, 'antonyms', csv['antonyms'])) fieldsUpdated++;
    if (applyField(row, 'meaningHint', csv['meaning_hint'])) fieldsUpdated++;

    if (fieldsUpdated > 0) updated++;
    totalFieldsUpdated += fieldsUpdated;

    // Batch flush every 100 matched rows
    if (matched % 100 === 0) {
      await em.flush();
      em.clear();
    }
  }

  // Final flush for any remaining
  await em.flush();
  em.clear();

  console.log('\n=== Summary ===');
  console.log(`Matched:       ${matched}`);
  console.log(`With updates:  ${updated}`);
  console.log(`Unmatched:     ${unmatched}`);
  console.log(`Fields updated:${totalFieldsUpdated}`);

  if (unmatchedList.length > 0) {
    console.log(`\nUnmatched DB rows (no CSV match):`);
    for (const u of unmatchedList) {
      console.log(`  - ${u}`);
    }
  }

  await orm.close(true);
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
