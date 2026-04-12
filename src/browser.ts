import type { ExplainOptions, ExplainResult, ExplainerLanguage, ExplainerMode } from './types.js';
import { explainError } from './core/explain.js';
import { createOverlay, type OverlayController } from './ui/overlay.js';

export interface BrowserInitOptions {
  mode?: ExplainerMode;
  language?: ExplainerLanguage;
  overlay?: boolean;
  redact?: boolean;
  onExplained?: (result: ExplainResult) => void;
}

export interface BrowserController {
  stop: () => void;
}

export function initAutoErrorExplainer(options: BrowserInitOptions = {}): BrowserController {
  const mode = options.mode ?? 'beginner';
  const language = options.language ?? 'en';
  const overlayEnabled = options.overlay ?? true;

  const explainOpts: ExplainOptions = {
    mode,
    language,
    source: 'browser'
  };

  let overlay: OverlayController | undefined;
  if (overlayEnabled && typeof window !== 'undefined' && typeof document !== 'undefined') {
    overlay = createOverlay({ language });
  }

  const onResult = (result: ExplainResult) => {
    options.onExplained?.(result);
    overlay?.show(result);
  };

  const onError = (event: ErrorEvent) => {
    const message = event.message || 'Unknown error';
    const stack = (event.error && (event.error as any).stack) || undefined;
    const name = (event.error && (event.error as any).name) || undefined;

    const result = explainError({ message, stack, name }, explainOpts);
    onResult(result);
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
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

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  console.error = patchedConsoleError;

  return {
    stop: () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      console.error = originalConsoleError;
      overlay?.destroy();
    }
  };
}
