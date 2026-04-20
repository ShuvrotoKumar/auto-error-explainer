import type { ExplainOptions, ExplainResult, ExplainerLanguage, ExplainerMode, FrameworkName } from './types.js';
import { explainError } from './core/explain.js';
import { appendHistory } from './node/history.js';

export interface NodeInitOptions {
  mode?: ExplainerMode;
  language?: ExplainerLanguage;
  framework?: FrameworkName;
  historyFile?: string;
  onExplained?: (result: ExplainResult) => void;
}

export interface NodeController {
  stop: () => void;
}

export function initAutoErrorExplainerNode(options: NodeInitOptions = {}): NodeController {
  const mode = options.mode ?? 'beginner';
  const language = options.language ?? 'en';

  const explainOpts: ExplainOptions = {
    mode,
    language,
    source: 'node',
    context: {
      framework: options.framework
    }
  };

  const onResult = (result: ExplainResult) => {
    options.onExplained?.(result);
    if (options.historyFile) appendHistory(options.historyFile, result);
  };

  const onUncaught = (err: any) => {
    const message = err?.message ? String(err.message) : String(err ?? 'Uncaught exception');
    const stack = err?.stack ? String(err.stack) : undefined;
    const name = err?.name ? String(err.name) : undefined;

    const result = explainError({ message, stack, name, cause: err }, explainOpts);
    onResult(result);
  };

  const onRejection = (reason: any) => {
    const message = reason?.message ? String(reason.message) : String(reason ?? 'Unhandled promise rejection');
    const stack = reason?.stack ? String(reason.stack) : undefined;
    const name = reason?.name ? String(reason.name) : undefined;

    const result = explainError({ message, stack, name, cause: reason }, explainOpts);
    onResult(result);
  };

  const originalConsoleError = console.error.bind(console);
  const patchedConsoleError = (...args: any[]) => {
    try {
      const first = args[0];
      const message = first instanceof Error ? first.message : String(first ?? 'console.error');
      const stack = first instanceof Error ? first.stack : undefined;
      const name = first instanceof Error ? first.name : undefined;

      const result = explainError({ message, stack, name, cause: args }, explainOpts);
      onResult(result);
    } catch {
      // ignore
    }
    originalConsoleError(...args);
  };

  process.on('uncaughtException', onUncaught);
  process.on('unhandledRejection', onRejection);
  console.error = patchedConsoleError;

  return {
    stop: () => {
      process.off('uncaughtException', onUncaught);
      process.off('unhandledRejection', onRejection);
      console.error = originalConsoleError;
    }
  };
}
