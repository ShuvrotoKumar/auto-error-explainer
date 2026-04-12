import { E as ExplainOptions, a as ExplainResult } from './types-BZ2cTa_U.js';
export { b as ErrorEventLike, c as ErrorExplanation, d as ErrorSource, e as ExplainerLanguage, f as ExplainerMode, F as FixSuggestion, P as Pattern, S as SimplifiedStack, g as StackFrame } from './types-BZ2cTa_U.js';

declare function explainError(input: {
    message: string;
    stack?: string;
    name?: string;
    cause?: unknown;
}, options?: ExplainOptions): ExplainResult;

export { ExplainOptions, ExplainResult, explainError };
