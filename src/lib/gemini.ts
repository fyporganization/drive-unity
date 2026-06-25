import { GoogleGenAI } from '@google/genai';

// gemini-embedding-001 is the current Google AI Studio embedding model.
// Default output is 3072 dims; we cap to 768 via outputDimensionality to match
// the pgvector(768) schema. Switching models or dims requires re-embedding all
// existing chunks (Phase 5.1 backfill).
export const EMBED_MODEL = 'gemini-embedding-001';
export const EMBED_DIMENSIONS = 768;
// Chat needs reasoning quality — flash by default.
// Vision is high-volume (one call per image) — flash-lite has 2x the free-tier
// RPM and lower latency at the same quality for caption/OCR use. Override via
// GEMINI_CHAT_MODEL / GEMINI_VISION_MODEL, or set GEMINI_MODEL to force both.
export const CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export const VISION_MODEL =
  process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const MAX_EMBED_BATCH = 100;

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY env var is not set');
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

export interface VisionExtractOptions {
  model?: string;
  prompt?: string;
}

export interface GenerateOptions {
  model?: string;
  systemInstruction?: string;
}

export async function batchEmbed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const ai = client();
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += MAX_EMBED_BATCH) {
    const batch = texts.slice(i, i + MAX_EMBED_BATCH);
    const resp = await retryable(() =>
      ai.models.embedContent({
        model: EMBED_MODEL,
        contents: batch,
        config: { outputDimensionality: EMBED_DIMENSIONS },
      })
    );
    const embeddings = resp.embeddings ?? [];
    if (embeddings.length !== batch.length) {
      throw new Error(
        `Gemini returned ${embeddings.length} embeddings for ${batch.length} inputs`
      );
    }
    for (const e of embeddings) {
      const values = e.values;
      if (!values || values.length !== EMBED_DIMENSIONS) {
        throw new Error(
          `Embedding has unexpected length: ${values?.length ?? 0} (expected ${EMBED_DIMENSIONS})`
        );
      }
      out.push(values);
    }
  }
  return out;
}

export async function embedOne(text: string): Promise<number[]> {
  const [v] = await batchEmbed([text]);
  return v;
}

export async function generate(
  prompt: string,
  opts: GenerateOptions = {}
): Promise<string> {
  const ai = client();
  const resp = await retryable(() =>
    ai.models.generateContent({
      model: opts.model ?? CHAT_MODEL,
      contents: prompt,
      config: opts.systemInstruction
        ? { systemInstruction: opts.systemInstruction }
        : undefined,
    })
  );
  return resp.text ?? '';
}

export async function* generateStream(
  prompt: string,
  opts: GenerateOptions = {}
): AsyncGenerator<string, void, void> {
  const ai = client();
  const stream = await ai.models.generateContentStream({
    model: opts.model ?? CHAT_MODEL,
    contents: prompt,
    config: opts.systemInstruction
      ? { systemInstruction: opts.systemInstruction }
      : undefined,
  });
  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) yield t;
  }
}

export async function visionExtract(
  imageBytes: Buffer,
  mimeType: string,
  opts: VisionExtractOptions = {}
): Promise<string> {
  const ai = client();
  const prompt =
    opts.prompt ??
    'Describe this image in detail. If it contains any text (signs, labels, ' +
      'documents, screenshots), transcribe the text verbatim. Combine the ' +
      'description and any transcribed text into one paragraph suitable for ' +
      'search indexing.';

  const resp = await retryable(() =>
    ai.models.generateContent({
      model: opts.model ?? VISION_MODEL,
      contents: [
        { inlineData: { mimeType, data: imageBytes.toString('base64') } },
        prompt,
      ],
    })
  );
  return resp.text ?? '';
}

export interface VisionBatchInput {
  /** Caller-provided identifier echoed back in the result so the caller can
   * map captions to original file IDs without relying on positional indexing. */
  index: number;
  bytes: Buffer;
  mimeType: string;
}

export interface VisionBatchResult {
  index: number;
  caption: string | null;
  error?: string;
}

/**
 * Batched vision extraction — sends N images in a single Gemini call and asks
 * for a JSON array of captions. Cuts API calls by N× on rate-limited free
 * tiers. Robust to partial responses: indices the model omits are returned
 * with `error` set; the caller handles per-file FAILED marking.
 *
 *   Free-tier flash-lite: 30 RPM × 5 imgs = 150 imgs/min (vs 30/min serial).
 */
export async function visionExtractBatch(
  images: VisionBatchInput[],
  opts: VisionExtractOptions = {}
): Promise<VisionBatchResult[]> {
  if (images.length === 0) return [];

  const ai = client();
  const n = images.length;
  const prompt =
    opts.prompt ??
    `You will receive ${n} image${n === 1 ? '' : 's'}. For EACH image (indexed 0` +
      (n > 1 ? ` through ${n - 1}` : '') +
      `):\n` +
      `1. Describe what you see in detail.\n` +
      `2. Transcribe any visible text verbatim.\n` +
      `3. Combine description + transcribed text into one search-indexable paragraph.\n\n` +
      `Respond with ONLY a JSON array — no markdown fences, no explanation, no prose around it:\n` +
      `[\n` +
      `  {"index": 0, "caption": "<paragraph for image 0>"}` +
      (n > 1 ? `,\n  {"index": 1, "caption": "<paragraph for image 1>"}` : '') +
      `\n]`;

  const contents = [
    ...images.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.bytes.toString('base64') },
    })),
    prompt,
  ];

  let raw: string;
  try {
    const resp = await retryable(() =>
      ai.models.generateContent({
        model: opts.model ?? VISION_MODEL,
        contents,
      })
    );
    raw = resp.text ?? '';
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return images.map((img) => ({ index: img.index, caption: null, error: msg }));
  }

  const parsed = parseVisionBatchJson(raw);
  return images.map((img, positional) => {
    const entry = parsed.find((p) => p.index === positional);
    if (!entry || !entry.caption || entry.caption.trim().length === 0) {
      return {
        index: img.index,
        caption: null,
        error: entry ? 'Empty caption returned' : 'No caption returned for this index',
      };
    }
    return { index: img.index, caption: entry.caption };
  });
}

function parseVisionBatchJson(raw: string): { index: number; caption: string }[] {
  let cleaned = raw.trim();
  // Strip ```json ... ``` fences if the model added them despite instructions.
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/, '');
  }
  // Find the first [ and last ] in case there's extra prose around the array.
  const first = cleaned.indexOf('[');
  const last = cleaned.lastIndexOf(']');
  if (first === -1 || last === -1 || last <= first) return [];
  const slice = cleaned.slice(first, last + 1);
  try {
    const arr = JSON.parse(slice);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (item: unknown): item is { index: number; caption: string } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { index?: unknown }).index === 'number' &&
          typeof (item as { caption?: unknown }).caption === 'string'
      )
      .map((item) => ({ index: item.index, caption: item.caption }));
  } catch {
    return [];
  }
}


async function retryable<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === maxAttempts - 1) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 30_000) + Math.random() * 250;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function isRetryable(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { status?: number; code?: number | string; message?: string };
  const status = typeof e.status === 'number' ? e.status : e.code;
  if (status === 429 || status === 500 || status === 503) return true;
  const msg = (e.message ?? '').toLowerCase();
  return /rate.?limit|timeout|econnreset|enotfound|fetch failed|503|429/.test(msg);
}
