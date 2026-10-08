/**
 * Lightweight deterministic string hash (djb2 + xor) for idempotency keys.
 * Used to detect already-generated content (content_hash column) so repeated
 * pipeline runs never create duplicate decks.
 */
export function hashContent(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
    h ^= (h >>> 16) | 0;
    h = Math.imul(h, 2246822507) | 0;
    h ^= (h >>> 13) | 0;
  }
  return (h >>> 0).toString(36);
}
