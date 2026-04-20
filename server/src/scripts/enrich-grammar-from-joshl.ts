/**
 * enrich-grammar-from-joshl.ts
 *
 * Enriches existing N3/N2/N1 Grammar rows (imported from J-O-S-H-L scrape)
 * with rich data from the J-O-S-H-L/grammar_dict term_bank JSON files.
 *
 * Source:
 *   https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main/dictionary_files/term_bank_{1-4}.json
 *
 * Match key: grammarPoint (kanji form at index 0, falling back to hiragana at index 2)
 * Strategy: always overwrite with source value when non-empty.
 *
 * Usage:
 *   npm run enrich:grammar:joshl
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

// ─── Yomitan structured-content parser ────────────────────────────────────────

interface ParsedEntry {
  meaning: string;
  explanation: string;
  examples: {jp: string; en: string}[];
}

/**
 * Parses a Yomitan structured-content JSON array into Meaning, Explanation,
 * and Example sentences (Japanese + English).
 *
 * Each entry's structured content (entry[5]) is an ARRAY of 2 blocks:
 *   [{type:"structured-content", content:[...]}, {type:"structured-content", content:[...]}]
 *
 * Each block's `content` is an array of strings and objects:
 *   - Strings: "【 Meaning 】", "【 Explanation 】", "【 Example sentences 】"
 *   - Objects: {tag:'div', content:'...'} for meaning/explanation
 *   - Objects: {tag:'ol', content:[{tag:'li', content:'...'}, ...]} for examples
 */
function parseEntry(raw: unknown): ParsedEntry {
  let arr = raw as unknown[];

  // If raw is already an array of {type:'structured-content', content:[...]} blocks,
  // iterate through the blocks. If raw is something else (e.g. a JSON string),
  // parse it first.
  if (!Array.isArray(arr)) {
    return {meaning: '', explanation: '', examples: []};
  }

  const firstItem = arr[0] as Record<string, unknown> | undefined;
  const isStructuredContentBlocks =
    firstItem != null && typeof firstItem === 'object' && firstItem.type === 'structured-content';

  if (!isStructuredContentBlocks) {
    // Try parsing as JSON string
    try {
      arr = JSON.parse(raw as string) as unknown[];
    } catch {
      return {meaning: '', explanation: '', examples: []};
    }
  }

  let currentSection = '';
  let meaning = '';
  let explanation = '';
  const examples: {jp: string; en: string}[] = [];

  function getText(node: unknown): string {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getText).join('');
    if (node && typeof node === 'object') {
      const obj = node as Record<string, unknown>;
      if (obj.content != null) return getText(obj.content);
      return '';
    }
    return '';
  }

  function processItem(item: unknown): void {
    if (typeof item === 'string') {
      const t = item.trim();
      if (t === '【 Meaning 】') {
        currentSection = 'meaning';
      } else if (t === '【 Explanation 】') {
        currentSection = 'explanation';
      } else if (t === '【 Example sentences 】') {
        currentSection = 'examples';
      } else if (currentSection === 'meaning') {
        meaning += t + ' ';
      } else if (currentSection === 'explanation') {
        explanation += t + ' ';
      }
      return;
    }

    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;

      // Extract text from a div object (meaning/explanation content)
      if (obj.tag === 'div' && currentSection !== 'examples') {
        const text = getText(obj).trim();
        if (text) {
          if (currentSection === 'meaning') meaning += text + ' ';
          else if (currentSection === 'explanation') explanation += text + ' ';
          return; // content already extracted, don't recurse
        }
      }

      // Extract examples from an <ol> list
      if (obj.tag === 'ol' && Array.isArray(obj.content)) {
        for (const li of obj.content) {
          if (li && typeof li === 'object' && (li as Record<string, unknown>).tag === 'li') {
            const rawText = getText(li)
              .replace(/^[①②③④⑤]\s*/, '')
              .trim();
            const parts = rawText.split(/\n|\\n/).filter(Boolean);
            if (parts.length >= 2) {
              examples.push({
                jp: parts[0].trim(),
                en: parts.slice(1).join(' ').trim(),
              });
            }
          }
        }
        return;
      }

      // Recurse into content arrays/objects
      if (obj.content != null) {
        if (Array.isArray(obj.content)) {
          for (const child of obj.content) processItem(child);
        } else {
          processItem(obj.content);
        }
      }
    }
  }

  // entry[5] is [{type:"structured-content", content:[...]}, ...]
  // Process each block's content array
  for (const block of arr) {
    if (block && typeof block === 'object') {
      const obj = block as Record<string, unknown>;
      if (obj.type === 'structured-content' && Array.isArray(obj.content)) {
        for (const item of obj.content) processItem(item);
      }
    }
  }

  return {
    meaning: meaning.trim(),
    explanation: explanation.trim(),
    examples,
  };
}

// ─── Apply field from source to Grammar entity ────────────────────────────────

function applyField<T extends Grammar>(
  row: T,
  field: keyof T,
  rawValue: string | undefined,
): boolean {
  if (rawValue !== undefined && rawValue.length > 0) {
    (row[field] as string | undefined) = rawValue;
    return true;
  }
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('Fetching J-O-S-H-L term_bank files...');
  const urls = [
    'https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main/dictionary_files/term_bank_1.json',
    'https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main/dictionary_files/term_bank_2.json',
    'https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main/dictionary_files/term_bank_3.json',
    'https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main/dictionary_files/term_bank_4.json',
  ];

  const allRaw = await Promise.all(urls.map(fetch));
  // Each term_bank file is an array of 8-element entries (NOT nested further).
  // The outer .flat() merges the 4 file-arrays into one; we must NOT .flat()
  // inside the map since entry[5] (structured content) contains nested arrays.
  const allEntries: unknown[][] = [];
  for (const raw of allRaw) {
    const fileEntries = JSON.parse(raw) as unknown[][];
    allEntries.push(...fileEntries);
  }

  console.log(`Source entries loaded: ${allEntries.length}`);

  // Build lookup map: grammarPoint → { parsed, level, pos }
  // Key by kanji form (index 0) and hiragana form (index 2)
  // Also add variant keys: stripped trailing markers, with/without ～
  const gpMap = new Map<string, {parsed: ParsedEntry; level: string; pos: string}>();
  for (const entry of allEntries) {
    const kanji = ((entry[0] as string) ?? '').trim();
    const hiragana = ((entry[2] as string) ?? '').trim();
    const level = (entry[7] as string) ?? '';
    const parsed = parseEntry(entry[5]);
    const pos = ((entry[3] as string) ?? '').trim();
    const val = {parsed, level, pos};

    function addKey(s: string) {
      if (!s) return;
      gpMap.set(s, val);
      // Strip trailing variant markers: さ ① → さ
      const stripped = s.replace(/\s*[①②③④⑤]$/, '').trim();
      if (stripped !== s) gpMap.set(stripped, val);
      // With ～
      if (!s.startsWith('～')) gpMap.set('～' + s, val);
    }

    addKey(kanji);
    addKey(hiragana);
  }

  // Also store source entries in an array for fuzzy substring matching
  const sourceEntries: {kanji: string; hiragana: string; parsed: ParsedEntry; level: string}[] = [];
  for (const entry of allEntries) {
    sourceEntries.push({
      kanji: ((entry[0] as string) ?? '').trim(),
      hiragana: ((entry[2] as string) ?? '').trim(),
      parsed: parseEntry(entry[5]),
      level: (entry[7] as string) ?? '',
    });
  }

  // Count unique entries per level (not map keys, which are many per entry)
  const uniqueByLevel = new Map<string, Set<string>>();
  for (const entry of allEntries) {
    const kanji = ((entry[0] as string) ?? '').trim();
    const level = (entry[7] as string) ?? '';
    if (!uniqueByLevel.has(level)) uniqueByLevel.set(level, new Set());
    if (kanji) uniqueByLevel.get(level)!.add(kanji);
  }
  const levelCounts: Record<string, number> = {};
  uniqueByLevel.forEach((set, level) => {
    levelCounts[level] = set.size;
  });
  console.log('Source entries by level:', JSON.stringify(levelCounts), '(total:', allEntries.length + ')');

  // Load existing N3/N2/N1 Grammar rows from DB
  const dbRows = await em.findAll(Grammar, {
    where: {level: {$in: ['N3', 'N2', 'N1']}},
  });
  console.log(`DB N3/N2/N1 rows loaded: ${dbRows.length}`);

  // Stats
  let matched = 0;
  let updated = 0;
  let unmatched = 0;
  let totalFieldsUpdated = 0;
  const unmatchedByLevel: Record<string, string[]> = {};
  const unmatchedList: string[] = [];

  for (const row of dbRows) {
    // Try direct match first
    let source = gpMap.get(row.grammarPoint);

    // Fallback: strip J-O-S-H-L placeholder patterns
    // e.g. " Verb[て] + みせる" → "～て] みせる" → "～てみせる" (strip all brackets + collapse)
    if (!source) {
      const raw = row.grammarPoint.trim()
        // Replace Verb[て] → ～て (strip the [] around the hiragana)
        .replace(/\bVerb\b/g, '～')
        .replace(/\[([^\]]+)\]/g, '$1') // strip [て] → て
        .replace(/\bNoun\b/g, '～')
        .replace(/\bAdjective\b/g, '～')
        .replace(/\bParticle\b/g, '～')
        // Strip all brackets (including full-width)
        .replace(/[【\[\[｛｟『（）()]/g, '')
        .replace(/[】\]\]]｠｝』）()]/g, '')
        .replace(/[+＋]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Try as-is (space between ～ and kanji)
      source = gpMap.get(raw);
      if (!source) {
        // Try with spaces around ～ collapsed
        const noSpace = raw.replace(/[ ]*([・〜～])[ ]*/g, '$1').trim();
        source = gpMap.get(noSpace);
        if (!source) {
          // Try fully compact (no spaces at all)
          const compact = raw.replace(/[ ]+/g, '').trim();
          source = gpMap.get(compact);
        }
      }
    }

    if (!source) {
      // Last resort: fuzzy substring matching via gpMap keys
      // Strategy: replace "Verb" with "～" only when followed by + or end (not by [て])
      // Pattern: " Verb + X" → "～X" where X is the following content
      // " Verb[て] + みせる" → "～て みせる" → "～てみせる"
      // " Verb[volitional] + としたが" → "～volitional としたが" → "～としたが"
      const raw = row.grammarPoint.trim();

      // Replace " Verb + X" → "～X" (bare Verb followed by +)
      let norm1 = raw.replace(/\bVerb\s*\+\s*/g, '～');

      // Replace " Verb[X] + Y" → "～X Y" (Verb[form] followed by +)
      norm1 = norm1.replace(/\bVerb\s*\[([^\]]+)\]\s*\+\s*/g, '～$1 ');

      // Replace bare " Verb" (at end) → "～"
      norm1 = norm1.replace(/\bVerb\b/g, '～');

      // Same for Noun, Adjective, Particle
      norm1 = norm1.replace(/\bNoun\s*\+\s*/g, '～');
      norm1 = norm1.replace(/\bNoun\s*\[([^\]]+)\]\s*\+\s*/g, '～$1 ');
      norm1 = norm1.replace(/\bNoun\b/g, '～');
      norm1 = norm1.replace(/\bAdjective\s*\+\s*/g, '～');
      norm1 = norm1.replace(/\bAdjective\s*\[([^\]]+)\]\s*\+\s*/g, '～$1 ');
      norm1 = norm1.replace(/\bAdjective\b/g, '～');
      norm1 = norm1.replace(/\bParticle\s*\+\s*/g, '～');
      norm1 = norm1.replace(/\bParticle\s*\[([^\]]+)\]\s*\+\s*/g, '～$1 ');
      norm1 = norm1.replace(/\bParticle\b/g, '～');

      // Strip remaining brackets: [て] → て
      norm1 = norm1.replace(/\[([^\]]+)\]/g, '$1');

      // Collapse ALL whitespace to single ASCII space, then trim
      const fuzzyNorm = norm1.replace(/\s+/g, ' ').trim();

      source = gpMap.get(fuzzyNorm);

      // Strip variant markers and try again
      if (!source) {
        const bareNorm = fuzzyNorm.replace(/\s*[①②③④⑤]\s*/g, '').trim();
        source = gpMap.get(bareNorm);
      }

      // Fuzzy substring match as last resort
      if (!source) {
        for (const gpMapKey of gpMap.keys()) {
          if (gpMapKey.length < 4) continue;
          if (gpMapKey.includes(fuzzyNorm) || fuzzyNorm.includes(gpMapKey)) {
            source = gpMap.get(gpMapKey);
            break;
          }
        }
      }
    }

    if (!source) {
      unmatched++;
      if (!unmatchedByLevel[row.level]) unmatchedByLevel[row.level] = [];
      unmatchedByLevel[row.level].push(row.grammarPoint);
      unmatchedList.push(`${row.grammarPoint} (${row.level})`);
      continue;
    }

    matched++;
    let fieldsUpdated = 0;

    const {parsed, pos} = source;

    if (applyField(row, 'meaning', parsed.meaning)) fieldsUpdated++;
    if (applyField(row, 'about', parsed.explanation)) fieldsUpdated++;
    if (applyField(row, 'partOfSpeech', pos)) fieldsUpdated++;

    // Take first example
    if (parsed.examples.length > 0) {
      if (applyField(row, 'exampleJp', parsed.examples[0].jp)) fieldsUpdated++;
      if (applyField(row, 'exampleEn', parsed.examples[0].en)) fieldsUpdated++;
    }

    if (fieldsUpdated > 0) updated++;
    totalFieldsUpdated += fieldsUpdated;

    // Batch flush every 100 matched rows
    if (matched % 100 === 0) {
      await em.flush();
      em.clear();
    }
  }

  // Final flush
  await em.flush();
  em.clear();

  console.log('\n=== Summary ===');
  console.log(`Matched:       ${matched}`);
  console.log(`With updates:  ${updated}`);
  console.log(`Unmatched:     ${unmatched}`);
  console.log(`Fields updated:${totalFieldsUpdated}`);

  if (Object.keys(unmatchedByLevel).length > 0) {
    console.log('\nUnmatched by level:');
    for (const [lvl, gps] of Object.entries(unmatchedByLevel)) {
      console.log(`  ${lvl} (${gps.length}): ${gps.slice(0, 5).join(', ')}${gps.length > 5 ? ' ...' : ''}`);
    }
    console.log('\nAll unmatched:');
    for (const u of unmatchedList) console.log(`  - ${u}`);
  }

  await orm.close(true);
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
