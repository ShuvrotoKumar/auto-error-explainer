export type ExplainerMode = 'beginner' | 'pro';
export type ExplainerLanguage = 'en' | 'bn';

export type ErrorSource = 'browser' | 'node' | 'cli' | 'unknown';

export interface ErrorEventLike {
  name?: string;
  message: string;
  stack?: string;
  cause?: unknown;
}

export interface StackFrame {
  file?: string;
  line?: number;
  column?: number;
  functionName?: string;
  raw?: string;
}

export interface SimplifiedStack {
  headline?: string;
  frames: StackFrame[];
  raw?: string;
}

export interface FixSuggestion {
  title: string;
  description?: string;
  snippet?: string;
  docsUrl?: string;
}

export interface ErrorExplanation {
  title: string;
  whatHappened: string;
  whyHappened: string;
  suggestedFixes: FixSuggestion[];
  simplifiedStack?: SimplifiedStack;
  confidence: number; // 0..1
  matchedPatternId?: string;
}

export interface ExplainOptions {
  mode?: ExplainerMode;
  language?: ExplainerLanguage;
  source?: ErrorSource;
  context?: {
    framework?: 'react' | 'nextjs' | 'express' | 'node' | 'unknown';
    componentName?: string;
    hookName?: string;
    apiRoute?: string;
  };
}

export interface Pattern {
  id: string;
  match: {
    name?: string;
    messageIncludes?: string[];
    messageRegex?: string;
  };
  explanation: {
    en: {
      title: string;
      whatHappened: string;
      whyHappened: string;
      fixes: FixSuggestion[];
    };
    bn: {
      title: string;
      whatHappened: string;
      whyHappened: string;
      fixes: FixSuggestion[];
    };
  };
}

export interface ExplainResult extends ErrorExplanation {
  input: ErrorEventLike;
}
