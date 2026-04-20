#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { explainError } from './core/explain.js';

const program = new Command();

program
  .name('auto-error-explainer')
  .description('Explain errors in human-friendly language with fix suggestions')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze an error log file')
  .argument('<path>', 'Path to a log file')
  .option('--lang <lang>', 'Language: en|bn', 'en')
  .option('--mode <mode>', 'Mode: beginner|pro', 'beginner')
  .option('--framework <framework>', 'Framework: react|nextjs|express|node|unknown', 'unknown')
  .action((path: string, opts: { lang: 'en' | 'bn'; mode: 'beginner' | 'pro'; framework: 'react' | 'nextjs' | 'express' | 'node' | 'unknown' }) => {
    const content = readFileSync(path, 'utf8');

    const lines = content.split(/\r?\n/);
    const firstNonEmpty = lines.find((l: string) => l.trim().length > 0) ?? 'Unknown error';

    const stackStart = lines.findIndex((l: string) => l.includes(' at ') || l.trim().startsWith('at '));
    const stack = stackStart >= 0 ? lines.slice(stackStart).join('\n') : undefined;

    const result = explainError(
      {
        message: firstNonEmpty,
        stack
      },
      {
        language: opts.lang,
        mode: opts.mode,
        source: 'cli',
        context: {
          framework: opts.framework
        }
      }
    );

    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  });

program.parse(process.argv);
