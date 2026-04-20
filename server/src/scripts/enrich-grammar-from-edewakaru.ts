/**
 * enrich-grammar-from-edewakaru.ts
 *
 * Fills null `structureDisplay` and `meaningHint` for existing N3/N2/N1
 * Grammar rows using the Edewakaru Yomitan term banks.
 *
 * Field mapping:
 *   【接続】 section → structureDisplay
 *   【意味】 section → meaningHint
 *
 * Strategy: fill-null-only — only write to DB field if it is currently null.
 *
 * Usage:
 *   npm run enrich:grammar:edewakaru
 */

import * as https from 'https';
import {MikroORM} from '@mikro-orm/core';
import config from '../mikro-orm.config';
import {Grammar} from '../entities/Grammar';

// ─── HTTP ─────────────────────────────────────────────────────────────────────

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ─── Yomitan structured-content parser ────────────────────────────────────────

interface ParsedEntry {
  structureDisplay?: string;  // 【接続】
  meaningHint?: string;        // 【意味】
  examples: {jp: string; en: string}[];
}

function parseEntry(raw: unknown): ParsedEntry {
  let arr = raw as unknown[];

  if (!Array.isArray(arr)) {
    return {examples: []};
  }

  const firstItem = arr[0] as Record<string, unknown> | undefined;
  const isStructuredContentBlocks =
    firstItem != null && typeof firstItem === 'object' && firstItem.type === 'structured-content';

  if (!isStructuredContentBlocks) {
    try {
      arr = JSON.parse(raw as string) as unknown[];
    } catch {
      return {examples: []};
    }
  }

  let fullText = '';

  for (const block of arr) {
    if (block && typeof block === 'object') {
      const obj = block as Record<string, unknown>;
      if (obj.type === 'structured-content' && Array.isArray(obj.content)) {
        for (const item of obj.content) {
          if (typeof item === 'string') {
            fullText += item + '\n';
          }
        }
      }
    }
  }

  const result: ParsedEntry = {examples: []};

  // Extract 【接続】
  const connectMatch = fullText.match(/【接続】\s*([\s\S]*?)(?=【|$)/);
  if (connectMatch) {
    const raw = connectMatch[1].trim().replace(/\n+/g, ' ').trim();
    if (raw) result.structureDisplay = raw;
  }

  // Extract 【意味】
  const meaningMatch = fullText.match(/【意味】\s*([\s\S]*?)(?=【例文】|【|$)/i);
  if (meaningMatch) {
    const raw = meaningMatch[1].trim().replace(/\n+/g, ' ').trim();
    if (raw) result.meaningHint = raw;
  }

  return result;
}

// ─── Normalization ─────────────────────────────────────────────────────────────

/** Strips Yomitan markup and normalises whitespace (does NOT lowercase). */
function stripMarkup(gp: string): string {
  return gp
    .replace(/<[^>]+>/g, '')
    .replace(/[【\[\[｛｟『]/g, '')
    .replace(/[】\]\]]｠｝』]/g, '')
    .replace(/([一-龯ぁ-んァ-ン～]+)[（(]([^）)]+)[)）]([一-龯ぁ-んァ-ン]*)/g, (_, kanji, reading, trailing) => reading + trailing)
    .replace(/[（()][^\]）)]+[)）]/g, '')
    .replace(/\bVerb\b/g, '～')
    .replace(/\bNoun\b/g, '～')
    .replace(/\bAdjective\b/g, '～')
    .replace(/\bParticle\b/g, '～')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/^～+/, '')
    .replace(/\s*([+＋・〜～])\s*/g, '$1')
    .replace(/\s*[①②③④⑤]$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(gp: string): string {
  return stripMarkup(gp).toLowerCase();
}

function buildMatchKeys(gp: string): string[] {
  const keys = new Set<string>();
  const base = normalize(gp);
  keys.add(base);

  const raw = stripMarkup(gp);
  const withTilde = raw.toLowerCase();
  keys.add(withTilde);

  const bareKanji = raw
    .replace(/[（()）()一-龯ぁ-んァ-ン～\s+]/g, '')
    .toLowerCase();
  if (bareKanji) keys.add(bareKanji);

  const readingsMatch = (raw.match(/[（(]([^）)]+)[)）]/g) ?? [])
    .map(m => m.slice(1, -1).trim()).join('');
  if (readingsMatch) {
    keys.add(readingsMatch.toLowerCase());
    const nonFurigana = raw.replace(/[（()）()一-龯]/g, '').trim();
    keys.add((readingsMatch + nonFurigana).toLowerCase().replace(/\s+/g, ''));
  }

  return Array.from(keys);
}

// ─── Apply field (fill-null only) ─────────────────────────────────────────────

function applyIfNull<T extends Grammar>(
  row: T,
  field: keyof T,
  rawValue: string | undefined,
): boolean {
  if (!rawValue || rawValue.trim() === '') return false;
  const current = row[field] as string | number | undefined;
  if (current !== undefined && current !== null && String(current).trim() !== '') return false;
  (row[field] as string | undefined) = rawValue.trim();
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('Fetching Edewakaru term bank files from GitHub...');
  const urls = [
    'https://raw.githubusercontent.com/aiko-tanaka/Grammar-Dictionaries/main/edewakaru/term_bank_1.json',
    'https://raw.githubusercontent.com/aiko-tanaka/Grammar-Dictionaries/main/edewakaru/term_bank_2.json',
    'https://raw.githubusercontent.com/aiko-tanaka/Grammar-Dictionaries/main/edewakaru/term_bank_3.json',
    'https://raw.githubusercontent.com/aiko-tanaka/Grammar-Dictionaries/main/edewakaru/term_bank_4.json',
  ];

  const allRaw = await Promise.all(urls.map(fetch));

  // Each term_bank is an array of 7-element entries
  const allEntries: unknown[][] = [];
  for (const raw of allRaw) {
    try {
      allEntries.push(...JSON.parse(raw) as unknown[][]);
    } catch {
      console.warn(`  Skipping malformed JSON in one of the term bank files`);
    }
  }

  console.log(`Source entries loaded: ${allEntries.length}`);

  // Build lookup map
  const gpMap = new Map<string, {parsed: ParsedEntry; kanji: string; extended: string}>();

  for (const entry of allEntries) {
    const kanji = ((entry[0] as string) ?? '').trim();
    const reading = ((entry[1] as string) ?? '').trim();
    const extended = ((entry[2] as string) ?? '').trim();
    const parsed = parseEntry(entry[5]);

    if (!parsed.structureDisplay && !parsed.meaningHint) continue;

    const val = {parsed, kanji, extended};

    function addKey(s: string) {
      if (!s) return;
      gpMap.set(s, val);
      const stripped = s.replace(/\s*[①②③④⑤]$/, '').trim();
      if (stripped !== s) gpMap.set(stripped, val);
      if (!s.startsWith('～')) gpMap.set('～' + s, val);
    }

    addKey(kanji);
    addKey(reading);
    addKey(extended);
  }

  console.log(`Source map built: ${gpMap.size} keys`);

  // Load existing N3/N2/N1 Grammar rows from DB
  const dbRows = await em.findAll(Grammar, {
    where: {level: {$in: ['N3', 'N2', 'N1']}},
  });
  console.log(`DB N3/N2/N1 rows loaded: ${dbRows.length}`);

  // Stats
  let matched = 0;
  let filled = 0;
  let unmatched = 0;
  let totalFilled = 0;
  let structureFilled = 0;
  let meaningFilled = 0;
  const unmatchedList: string[] = [];

  for (const row of dbRows) {
    const dbKeys = buildMatchKeys(row.grammarPoint);
    let source: {parsed: ParsedEntry; kanji: string; extended: string} | undefined;

    for (const key of dbKeys) {
      const found = gpMap.get(key);
      if (found) {
        source = found;
        break;
      }
    }

    // Fallback: normalize and strip placeholders
    if (!source) {
      const raw = row.grammarPoint.trim()
        .replace(/\bVerb\b/g, '～')
        .replace(/\[([^\]]+)\]/g, '$1')
        .replace(/\bNoun\b/g, '～')
        .replace(/\bAdjective\b/g, '～')
        .replace(/\bParticle\b/g, '～')
        .replace(/[【\[\[｛｟『（）()]/g, '')
        .replace(/[】\]\]]｠｝』）()]/g, '')
        .replace(/[+＋]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      source = gpMap.get(raw);
      if (!source) {
        const noSpace = raw.replace(/[ ]*([・〜～])[ ]*/g, '$1').trim();
        source = gpMap.get(noSpace);
      }
    }

    // Last resort: fuzzy substring
    if (!source) {
      const dbNorm = normalize(row.grammarPoint);
      for (const [mapKey, val] of Array.from(gpMap.entries())) {
        if (mapKey.length < 4) continue;
        if (mapKey.includes(dbNorm) || dbNorm.includes(mapKey)) {
          source = val;
          break;
        }
      }
    }

    if (!source) {
      unmatched++;
      unmatchedList.push(`${row.grammarPoint} (${row.level})`);
      continue;
    }

    matched++;
    let rowFilled = 0;

    if (applyIfNull(row, 'structureDisplay', source.parsed.structureDisplay)) {
      rowFilled++;
      structureFilled++;
    }
    if (applyIfNull(row, 'meaningHint', source.parsed.meaningHint)) {
      rowFilled++;
      meaningFilled++;
    }

    if (rowFilled > 0) filled++;
    totalFilled += rowFilled;

    if (matched % 100 === 0) {
      await em.flush();
      em.clear();
    }
  }

  await em.flush();
  em.clear();

  console.log('\n=== Summary ===');
  console.log(`Matched:                 ${matched}`);
  console.log(`With field fills:        ${filled}`);
  console.log(`StructureDisplay filled: ${structureFilled}`);
  console.log(`MeaningHint filled:      ${meaningFilled}`);
  console.log(`Total fields filled:    ${totalFilled}`);
  console.log(`Unmatched:              ${unmatched}`);

  if (unmatchedList.length > 0) {
    console.log(`\nUnmatched DB rows (${unmatchedList.length}):`);
    for (const u of unmatchedList.slice(0, 20)) {
      console.log(`  - ${u}`);
    }
    if (unmatchedList.length > 20) {
      console.log(`  ... and ${unmatchedList.length - 20} more`);
    }
  }

  await orm.close(true);
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
