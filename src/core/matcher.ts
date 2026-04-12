import type { Pattern } from '../types.js';
import { similarity } from './similarity.js';

export function matchPattern(
  input: { name?: string; message: string },
  patterns: Pattern[]
): { pattern: Pattern; score: number } | undefined {
  const message = (input.message ?? '').toLowerCase();
  const name = input.name?.toLowerCase();

  let best: { pattern: Pattern; score: number } | undefined;

  for (const p of patterns) {
    // Hard constraints first
    if (p.match.name && name && p.match.name.toLowerCase() !== name) continue;

    let score = 0;
    if (p.match.messageIncludes?.length) {
      const hitCount = p.match.messageIncludes.filter((s) => message.includes(s.toLowerCase())).length;
      score = Math.max(score, hitCount / p.match.messageIncludes.length);
    }

    if (p.match.messageRegex) {
      try {
        const re = new RegExp(p.match.messageRegex, 'i');
        if (re.test(input.message)) score = Math.max(score, 0.9);
      } catch {
        // ignore invalid regex
      }
    }

    // Fuzzy fallback: compare whole message to each include token concatenation
    if (score < 0.6 && p.match.messageIncludes?.length) {
      const target = p.match.messageIncludes.join(' ').toLowerCase();
      score = Math.max(score, similarity(message, target));
    }

    if (!best || score > best.score) best = { pattern: p, score };
  }

  if (!best) return undefined;
  if (best.score < 0.55) return undefined;
  return best;
}
