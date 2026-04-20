/**
 * enrich-grammar-from-claude.ts
 *
 * Fills all null Grammar fields across N5-N1 using a local LLM via Ollama.
 * Groups rows by which specific fields are null, then makes one
 * focused API call per group with NDJSON streaming response.
 *
 * Strategy: fill-null-only — only writes to DB fields that are currently null.
 *
 * Usage:
 *   npm run enrich:grammar:claude
 *
 * Requires:
 *   - Ollama running (ollama serve)
 *   - Model pulled: ollama pull llama3.2
 *   - server/.env: OLLAMA_BASE_URL=http://localhost:11434 (default)
 *     Optionally: OLLAMA_MODEL=llama3.2
 */

import 'dotenv/config';
import 'reflect-metadata';
import {MikroORM} from '@mikro-orm/core';
import config from '../mikro-orm.config';
import {Grammar} from '../entities/Grammar';

// ─── Env check ────────────────────────────────────────────────────────────────

const OLLAMA_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2';

// ─── Constants ───────────────────────────────────────────────────────────────

const FILLABLE_FIELDS: (keyof Grammar)[] = [
  'meaning',
  'structure',
  'structureDisplay',
  'about',
  'exampleJp',
  'exampleEn',
  'synonyms',
  'antonyms',
  'register',
  'meaningHint',
];

// ─── Null-field helpers ──────────────────────────────────────────────────────

function isEmpty(val: unknown): boolean {
  return val === null || val === undefined || String(val).trim() === '';
}

function getNullFields(row: Grammar): (keyof Grammar)[] {
  return FILLABLE_FIELDS.filter((f) => isEmpty(row[f]));
}

// ─── Fill-null helper ─────────────────────────────────────────────────────────

function applyIfNull(
  target: Grammar,
  source: Record<string, unknown>,
  fields: (keyof Grammar)[],
): void {
  for (const field of fields) {
    const src = source[field as string];
    if (isEmpty(src)) continue;
    const current = target[field];
    if (isEmpty(current)) {
      (target as unknown as Record<string, unknown>)[field] = String(src).trim();
    }
  }
}

// ─── Ollama streaming parser ─────────────────────────────────────────────

/**
 * Reads a streaming Ollama /api/chat response and accumulates complete JSON
 * objects from the stream incrementally. Stops once all expected rows are
 * found or the stream ends.
 */
async function streamOllama(
  res: Response,
  expectedRowCount: number,
): Promise<Record<string, unknown>[]> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const results: Record<string, unknown>[] = [];

  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, {stream: true});

      // Try to extract and parse complete JSON objects from buffer
      // Strip markdown code fences if present
      const cleaned = buffer.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

      // Strategy 1: try full array parse
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          results.push(...parsed);
          return results;
        }
      } catch {
        // not ready yet
      }

      // Strategy 2: strip outer brackets and parse each line as NDJSON
      const inner = cleaned.replace(/^\s*\[\s*/, '').replace(/\s*,?\s*$/, '');
      for (const line of inner.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === ',') continue;
        try {
          const obj = JSON.parse(trimmed) as Record<string, unknown>;
          results.push(obj);
        } catch {
          // line incomplete
        }
      }

      // If we have enough rows, return
      if (results.length >= expectedRowCount) {
        reader.cancel();
        return results;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return results;
}

// ─── Ollama API ───────────────────────────────────────────────────────────

/**
 * Calls Ollama chat API. Returns parsed NDJSON lines as objects.
 * Retries once on failure; throws after second failure.
 */
async function callOllama(prompt: string, expectedRowCount: number): Promise<Record<string, unknown>[]> {
  const url = `${OLLAMA_URL}/api/chat`;
  const payload = {
    model: OLLAMA_MODEL,
    stream: true,
    messages: [{role: 'user', content: prompt}],
    options: {
      temperature: 0.3,
      num_predict: 6144,
    },
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180_000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(payload),
        signal: controller.signal as AbortSignal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ollama API error ${res.status}: ${text}`);
      }

      // Stream the response — accumulate tokens incrementally.
      // Resolves when all expected rows are collected OR stream ends.
      return await streamOllama(res, expectedRowCount);
    } catch (err) {
      if (attempt === 0) {
        console.warn(`  [attempt 1] Ollama call failed: ${(err as Error).message}, retrying...`);
      } else {
        throw err;
      }
    }
  }
  throw new Error('Unexpected loop exit');
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(rows: Grammar[], nullFields: (keyof Grammar)[]): string {
  const rowsJson = rows.map((r) => {
    const obj: Record<string, unknown> = {};
    for (const field of FILLABLE_FIELDS) {
      obj[field] = r[field] ?? '';
    }
    return obj;
  });

  return `You are a Japanese grammar expert. Fill in ONLY the missing fields for each Japanese grammar point below.

IMPORTANT RULES:
- Respond with a JSON array, one object per grammar point, in the EXACT same order as the input
- Output ONLY the fields listed: ${nullFields.join(', ')} — do NOT include any other fields
- All field values MUST be non-empty strings (no null, no [], no empty strings)
- For synonyms/antonyms: provide comma-separated related grammar points as a plain string (e.g. "〜べきだ, 〜ものだ")
- For register: use plain strings like "Formal", "Casual", "Written", "Spoken", "Keigo", "Neutral", "Literary"
- For structureDisplay: plain text like "Verb［意向形］＋か"
- For meaningHint: plain text usage hint like "Expresses weak assertion or hedging"
- For meaning: plain English meaning
- For about: plain English explanation
- For exampleJp/exampleEn: plain example sentence strings

Return ONLY a valid JSON array, no markdown, no explanation, no text before or after.

${JSON.stringify(rowsJson, null, 2)}

Respond with only a JSON array of ${rows.length} objects in the same order.`;
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

interface GroupedRows {
  nullFields: (keyof Grammar)[];
  rows: Grammar[];
}

function buildGroups(rows: Grammar[]): GroupedRows[] {
  const map = new Map<string, GroupedRows>();
  for (const row of rows) {
    const nullFields = getNullFields(row);
    if (nullFields.length === 0) continue;
    const key = nullFields.slice().sort().join('|');
    if (!map.has(key)) {
      map.set(key, {nullFields: nullFields.slice().sort(), rows: []});
    }
    map.get(key)!.rows.push(row);
  }
  return Array.from(map.values());
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('Loading all Grammar rows...');
  const allRows = await em.findAll(Grammar);
  console.log(`  Loaded ${allRows.length} rows.`);

  const groups = buildGroups(allRows);
  console.log(`\nFound ${groups.length} null-field group(s) to process.\n`);

  let groupsProcessed = 0;
  let groupsFailed = 0;
  let totalFilled = 0;
  let rowsSinceFlush = 0;

  const CHUNK_SIZE = 10;

  for (const group of groups) {
    const {nullFields, rows} = group;
    groupsProcessed++;

    // Split rows into sub-chunks of CHUNK_SIZE to avoid truncation
    const chunks: Grammar[][] = [];
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }

    console.log(
      `[${groupsProcessed}/${groups.length}] Group: [${nullFields.join(', ')}] — ${rows.length} rows (${chunks.length} sub-batch(es))`,
    );

    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c];
      process.stdout.write(`  sub-batch ${c + 1}/${chunks.length} (${chunk.length} rows)...`);

      const prompt = buildPrompt(chunk, nullFields);

      let parsedResults: Record<string, unknown>[];
      try {
        parsedResults = await callOllama(prompt, chunk.length);
      } catch (err) {
        console.log(` ERROR: ${(err as Error).message}`);
        groupsFailed++;
        continue;
      }

      // Match by index: Ollama returns an array in the same order as the input rows
      for (let i = 0; i < chunk.length && i < parsedResults.length; i++) {
        applyIfNull(chunk[i], parsedResults[i], nullFields);
        rowsSinceFlush++;

        if (rowsSinceFlush >= 50) {
          await em.flush();
          rowsSinceFlush = 0;
        }
      }

      const chunkFilled = Math.min(chunk.length, parsedResults.length);
      console.log(` ${chunkFilled}/${chunk.length} filled`);
    }

    await em.flush();
    em.clear();
    rowsSinceFlush = 0;

    // Count total fields filled for this group (all chunks)
    let groupFilled = 0;
    for (const row of group.rows) {
      for (const field of nullFields) {
        const val = row[field];
        if (!isEmpty(val)) groupFilled++;
      }
    }
    totalFilled += groupFilled;
    console.log(`  Total filled for group: ${groupFilled} field(s)`);
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Groups processed : ${groupsProcessed - groupsFailed}`);
  console.log(`Groups failed    : ${groupsFailed}`);
  console.log(`Total fields     : ${totalFilled}`);
  console.log('==============================');

  await orm.close(true);
}

run().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
