type ExplainerMode = 'beginner' | 'pro';
type ExplainerLanguage = 'en' | 'bn';
type ErrorSource = 'browser' | 'node' | 'cli' | 'unknown';
interface ErrorEventLike {
    name?: string;
    message: string;
    stack?: string;
    cause?: unknown;
}
interface StackFrame {
    file?: string;
    line?: number;
    column?: number;
    functionName?: string;
    raw?: string;
}
interface SimplifiedStack {
    headline?: string;
    frames: StackFrame[];
    raw?: string;
}
interface FixSuggestion {
    title: string;
    description?: string;
    snippet?: string;
    docsUrl?: string;
}
interface ErrorExplanation {
    title: string;
    whatHappened: string;
    whyHappened: string;
    suggestedFixes: FixSuggestion[];
    simplifiedStack?: SimplifiedStack;
    confidence: number;
    matchedPatternId?: string;
}
interface ExplainOptions {
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
interface Pattern {
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
interface ExplainResult extends ErrorExplanation {
    input: ErrorEventLike;
}

export type { ExplainOptions as E, FixSuggestion as F, Pattern as P, SimplifiedStack as S, ExplainResult as a, ErrorEventLike as b, ErrorExplanation as c, ErrorSource as d, ExplainerLanguage as e, ExplainerMode as f, StackFrame as g };
