import { sha256 } from './hash';

export interface Chunk {
  index: number;
  content: string;
  hash: string;
}

export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
  minLength?: number;
}

export function chunkText(text: string, opts: ChunkOptions = {}): Chunk[] {
  const size = opts.chunkSize ?? 2000;
  const overlap = opts.overlap ?? 200;
  const minLength = opts.minLength ?? 50;

  const normalised = text.replace(/\x00/g, '').replace(/\r\n/g, '\n').trim();
  if (normalised.length === 0) return [];

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalised.length) {
    let end = Math.min(start + size, normalised.length);

    if (end < normalised.length) {
      const lookback = normalised.slice(start, end);
      const breakAt =
        lookback.lastIndexOf('\n\n') !== -1
          ? lookback.lastIndexOf('\n\n') + 2
          : lookback.lastIndexOf('. ') !== -1
            ? lookback.lastIndexOf('. ') + 2
            : lookback.lastIndexOf('\n') !== -1
              ? lookback.lastIndexOf('\n') + 1
              : -1;
      if (breakAt > size / 2) {
        end = start + breakAt;
      }
    }

    const content = normalised.slice(start, end).trim();
    if (content.length >= minLength) {
      chunks.push({ index: index++, content, hash: sha256(content) });
    }

    if (end >= normalised.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}
