import type { SimplifiedStack, StackFrame } from '../types.js';

export function simplifyStack(stack: string): SimplifiedStack {
  const lines = stack.split(/\r?\n/).map((l) => l.trimEnd());
  const headline = lines[0]?.trim();

  const frames: StackFrame[] = [];

  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim();
    if (!line) continue;

    // V8 style: "at fn (file:line:col)" or "at file:line:col"
    const v8 = parseV8Frame(line);
    if (v8) {
      frames.push(v8);
      continue;
    }

    // Firefox style: "fn@file:line:col"
    const ff = parseFirefoxFrame(line);
    if (ff) {
      frames.push(ff);
      continue;
    }

    frames.push({ raw: line });
  }

  return {
    headline,
    frames,
    raw: stack
  };
}

function parseV8Frame(line: string): StackFrame | undefined {
  const trimmed = line.startsWith('at ') ? line.slice(3).trim() : line;

  // fn (file:line:col)
  const m1 = trimmed.match(/^(.*?) \((.*?):(\d+):(\d+)\)$/);
  if (m1) {
    return {
      functionName: m1[1] || undefined,
      file: m1[2],
      line: Number(m1[3]),
      column: Number(m1[4]),
      raw: line
    };
  }

  // file:line:col
  const m2 = trimmed.match(/^(.*?):(\d+):(\d+)$/);
  if (m2) {
    return {
      file: m2[1],
      line: Number(m2[2]),
      column: Number(m2[3]),
      raw: line
    };
  }

  return undefined;
}

function parseFirefoxFrame(line: string): StackFrame | undefined {
  const m = line.match(/^(.*?)@(.*?):(\d+):(\d+)$/);
  if (!m) return undefined;
  return {
    functionName: m[1] || undefined,
    file: m[2],
    line: Number(m[3]),
    column: Number(m[4]),
    raw: line
  };
}
