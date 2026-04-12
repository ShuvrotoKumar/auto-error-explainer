import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ExplainResult } from '../types.js';

export function appendHistory(filePath: string, result: ExplainResult): void {
  try {
    mkdirSync(dirname(filePath), { recursive: true });

    const existing = safeReadJsonArray(filePath);
    existing.push({
      ts: Date.now(),
      title: result.title,
      matchedPatternId: result.matchedPatternId,
      confidence: result.confidence,
      message: result.input.message,
      source: 'node'
    });

    writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  } catch {
    // ignore history errors
  }
}

function safeReadJsonArray(filePath: string): any[] {
  try {
    const text = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
